#!/usr/bin/env groovy

import jenkins.model.*
import org.jenkinsci.plugins.workflow.job.WorkflowJob
import org.jenkinsci.plugins.workflow.cps.CpsScmFlowDefinition
import hudson.plugins.git.GitSCM
import hudson.plugins.git.BranchSpec
import hudson.plugins.git.UserRemoteConfig
import hudson.plugins.git.extensions.impl.CloneOption
import hudson.triggers.SCMTrigger
import hudson.model.Cause
import hudson.model.Action
import com.cloudbees.plugins.credentials.CredentialsProvider
import com.cloudbees.plugins.credentials.common.StandardCredentials
import jenkins.model.Jenkins

class PipelineJobCreator {
    
    def createPipelineJob(String gitRepoUrl, String gitBranch, String jenkinsfilePath, 
                           String credentialsId, Boolean enableWebhook, String jobNameSuffix = "") {
        try {
            // Get Jenkins instance
            def jenkins = Jenkins.getInstance()
            
            // Generate job name from repository URL and optional suffix
            def repoName = gitRepoUrl.tokenize('/')[-1].replace('.git', '')
            def jobName = repoName + (jobNameSuffix ? "-${jobNameSuffix}" : "") + "-pipeline"
            
            // Check if job already exists
            def job = jenkins.getItemByFullName(jobName)
            if (job != null) {
                println("Job ${jobName} already exists, updating configuration...")
                job.delete()
            }
            
            // Create new pipeline job
            def pipelineJob = jenkins.createProject(WorkflowJob.class, jobName)
            
            // Configure Git SCM with proper branch handling
            def userRemoteConfig = new UserRemoteConfig(
                gitRepoUrl, 
                null, 
                null, 
                credentialsId
            )
            
            // Normalize branch specification
            def normalizedBranch = gitBranch.startsWith('**/') ? gitBranch : "**/${gitBranch}"
            def branchSpecs = [new BranchSpec(normalizedBranch)]
            
            def cloneOption = new CloneOption(true, true, null, 10)

            // Configure Git SCM with host key bypass
            // def gitExtensions = [
            //     new hudson.plugins.git.extensions.impl.CloneOption(
            //         shallow: true, 
            //         noTags: false, 
            //         reference: null, 
            //         depth: 1
            //     ),
            //     new hudson.plugins.git.extensions.impl.IgnoreNotifyCommit(),
            //     new com.cloudbees.jenkins.GitHubTrustAll()
            // ]
            // Environment variable to disable strict host checking
            // def env = System.getenv().toMap()
            // env.put("GIT_SSH_COMMAND", "ssh -o StrictHostKeyChecking=no")

            def gitScm = new GitSCM(
                [userRemoteConfig],
                branchSpecs,
                false,
                [],
                null,
                null,
                [cloneOption]
            )
            
            // Configure pipeline definition
            def flowDefinition = new CpsScmFlowDefinition(gitScm, jenkinsfilePath)
            pipelineJob.setDefinition(flowDefinition)
            
            // Set up triggers
            def triggerProperty = new org.jenkinsci.plugins.workflow.job.properties.PipelineTriggersJobProperty()
            def triggers = []
            
            // Webhook configuration
            if (enableWebhook) {
                try {
                    // Attempt to use GitHub webhook trigger
                    Class<?> githubTriggerClass = Class.forName("org.jenkinsci.plugins.github.webhook.MultibranchWebhook")
                    def githubTrigger = githubTriggerClass.newInstance()
                    triggers.add(githubTrigger)
                    println("Multibranch GitHub webhook trigger enabled for ${jobName}")
                } catch (ClassNotFoundException e) {
                    // Fallback to GitHub Push trigger
                    try {
                        Class<?> githubPushTriggerClass = Class.forName("com.cloudbees.jenkins.GitHubPushTrigger")
                        def githubPushTrigger = githubPushTriggerClass.newInstance()
                        triggers.add(githubPushTrigger)
                        println("GitHub push trigger enabled for ${jobName}")
                    } catch (Exception fallbackEx) {
                        // Fallback to SCM polling if no GitHub triggers available
                        println("No GitHub webhook plugin found, falling back to SCM polling")
                        triggers.add(new SCMTrigger("H/5 * * * *"))
                    }
                }
            } else {
                // Default to SCM polling when webhooks are disabled
                println("Webhook trigger disabled for ${jobName}, using SCM polling")
                triggers.add(new SCMTrigger("H/15 * * * *"))
            }
            
            // Apply triggers
            triggerProperty.setTriggers(triggers)
            pipelineJob.addProperty(triggerProperty)
            
            // Set description
            pipelineJob.setDescription(
                "Pipeline job for ${repoName} (${normalizedBranch}) - " + 
                (enableWebhook ? "GitHub webhook enabled" : "SCM polling only")
            )
            
            // Save and build
            pipelineJob.save()
            // Trigger initial build with correct method
            // Option 2: If you want to specify a cause
            pipelineJob.scheduleBuild(0, new Cause.UserIdCause())
            println("Pipeline job ${jobName} created successfully for branch ${normalizedBranch}!")
            return 0
        } catch (Exception e) {
            println("Error creating pipeline job: ${e.message}")
            e.printStackTrace()
            return 1
        }
    }

    def validateCredentials(String credentialsId) {
        def credentialsList = CredentialsProvider.lookupCredentials(
            StandardCredentials.class,
            Jenkins.getInstance(),
            null,
            null
        )
        
        def credFound = credentialsList.find { it.id == credentialsId }
        if (!credFound) {
            println("WARNING: Credentials with ID '${credentialsId}' not found in Jenkins!")
            println("Make sure credential ID exists before running webhook operations")
            return false
        }
        return true
    }
    
    def processPipelines(Map config) {
        println("Pipeline Configuration:")
        println("- Repository URL: ${config.repoUrl}")
        println("- Branches: ${config.branches}")
        println("- Jenkinsfile path: ${config.jenkinsfilePath}")
        println("- Credentials ID: ${config.credentialsId}")
        println("- Webhook enabled: ${config.enableWebhook}")
        
        // Validate credentials
        if (!validateCredentials(config.credentialsId)) {
            println("CAUTION: Credentials validation failed. Proceeding, but webhook may not work.")
        }
        
        // Create pipeline jobs
        def failureCount = 0
        config.branches.each { branch ->
            def branchSuffix = branch.replace('**/', '').replace('*', '')
            def result = createPipelineJob(
                config.repoUrl, 
                branch, 
                config.jenkinsfilePath, 
                config.credentialsId, 
                config.enableWebhook, 
                branchSuffix
            )
            if (result != 0) {
                failureCount++
            }
        }
        
        // Summary and webhook guidance
        if (failureCount > 0) {
            println("WARNING: ${failureCount} pipeline job(s) failed to create properly.")
            return 1
        } else {
            println("All pipeline jobs created successfully!")
            if (config.enableWebhook) {
                def jenkinsRootUrl = Jenkins.getInstance().rootUrl ?: 'your-jenkins-url'
                println("GitHub webhook configuration:")
                println("- Webhook URL: ${jenkinsRootUrl}/github-webhook/")
                println("- Recommended events: push, pull_request")
                println("- Ensure GitHub repository webhook is configured")
            } else {
                println("Webhooks disabled - jobs will use SCM polling")
            }
            return 0
        }
    }
}