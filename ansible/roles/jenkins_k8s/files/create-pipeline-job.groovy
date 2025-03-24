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
import com.cloudbees.plugins.credentials.CredentialsProvider
import com.cloudbees.plugins.credentials.common.StandardCredentials
import jenkins.model.Jenkins

class PipelineJobCreator {
    
    def createPipelineJob(String gitRepoUrl, String gitBranch, String jenkinsfilePath, String credentialsId, Boolean enableWebhook, String jobNameSuffix = "") {
        // Same implementation as your original function
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
                jenkins.deleteItem(job)
            }
            
            // Create new pipeline job
            def pipelineJob = jenkins.createProject(WorkflowJob.class, jobName)
            
            // Configure Git SCM
            def userRemoteConfig = new UserRemoteConfig(gitRepoUrl, null, null, credentialsId)
            def branchSpec = new BranchSpec(gitBranch)
            def cloneOption = new CloneOption(true, true, null, 10)
            def gitScm = new GitSCM(
                [userRemoteConfig],
                [branchSpec],
                false,
                [],
                null,
                null,
                [cloneOption]
            )
            
            // Configure pipeline definition
            def flowDefinition = new CpsScmFlowDefinition(gitScm, jenkinsfilePath)
            pipelineJob.setDefinition(flowDefinition)
            
            // Enable branch specifier for GitHub webhook compatibility
            if (pipelineJob.getDefinition() instanceof CpsScmFlowDefinition) {
                def scm = pipelineJob.getDefinition().getScm()
                if (scm instanceof GitSCM) {
                    scm.setBranches([new BranchSpec(gitBranch)])
                }
            }
            
            // Set webhook trigger property
            def triggerProperty = new org.jenkinsci.plugins.workflow.job.properties.PipelineTriggersJobProperty()
            def triggers = []
            
            // Configure triggers based on enableWebhook flag
            if (enableWebhook) {
                try {
                    // First try to load the GitHub plugin class
                    Class<?> githubTriggerClass = Class.forName("com.cloudbees.jenkins.GitHubPushTrigger")
                    def githubTrigger = githubTriggerClass.newInstance()
                    triggers.add(githubTrigger)
                    println("GitHub webhook trigger enabled for ${jobName}")
                } catch (Exception e) {
                    println("GitHub plugin not found, falling back to SCM polling")
                    // Fallback to SCM polling if GitHub plugin not available
                    triggers.add(new SCMTrigger("H/15 * * * *"))
                }
            } else {
                // Use only SCM polling when webhooks are disabled
                println("Webhook trigger disabled for ${jobName}, using SCM polling only")
                triggers.add(new SCMTrigger("H/15 * * * *"))
            }
            
            triggerProperty.setTriggers(triggers)
            pipelineJob.addProperty(triggerProperty)
            
            // Set appropriate description
            if (enableWebhook) {
                pipelineJob.setDescription("Pipeline job for ${repoName} (${gitBranch}) - GitHub webhook enabled")
            } else {
                pipelineJob.setDescription("Pipeline job for ${repoName} (${gitBranch}) - SCM polling only")
            }
            
            // Save configuration
            pipelineJob.save()
            
            // Trigger an initial build to validate configuration
            pipelineJob.scheduleBuild2(0, new Cause.UserIdCause())
            
            println("Pipeline job ${jobName} created successfully for branch ${gitBranch}!")
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
        println("Configuration:")
        println("- Repository URL: ${config.repoUrl}")
        println("- Branches: ${config.branches}")
        println("- Jenkinsfile path: ${config.jenkinsfilePath}")
        println("- Credentials ID: ${config.credentialsId}")
        println("- Webhook enabled: ${config.enableWebhook}")
        
        // Validate credentials
        if (!validateCredentials(config.credentialsId)) {
            println("Proceeding with pipeline creation, but webhook functionality may not work!")
        }
        
        // Create a pipeline job for each branch
        def failureCount = 0
        config.branches.each { branch ->
            def branchSuffix = branch.replace('**/', '').replace('*', '')
            def result = createPipelineJob(config.repoUrl, branch, config.jenkinsfilePath, 
                                          config.credentialsId, config.enableWebhook, branchSuffix)
            if (result != 0) {
                failureCount++
            }
        }
        
        if (failureCount > 0) {
            println("WARNING: ${failureCount} pipeline job(s) failed to create properly.")
            return 1
        } else {
            println("All pipeline jobs created successfully!")
            if (config.enableWebhook) {
                println("GitHub webhooks are enabled - make sure your GitHub repository has webhook configured to ${Jenkins.getInstance().rootUrl ?: 'your-jenkins-url'}/github-webhook/")
            } else {
                println("GitHub webhooks are disabled - jobs will use SCM polling instead")
            }
            return 0
        }
    }
}