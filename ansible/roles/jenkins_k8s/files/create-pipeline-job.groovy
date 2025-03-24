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


// Import the external EnvironmentUtils script
def envUtilsScript = new File("${JENKINS_HOME}/function-scripts/create-environment-vars.groovy")
def envUtilsClass = new GroovyClassLoader(getClass().getClassLoader()).parseClass(envUtilsScript)
def envUtils = envUtilsClass.newInstance()

// Function to create or update a pipeline job
def createPipelineJob(String gitRepoUrl, String gitBranch, String jenkinsfilePath, String credentialsId, Boolean enableWebhook, String jobNameSuffix = "") {
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
        
        // create environment variables
        println("Pipeline job ${jobName} created successfully for branch ${gitBranch}!")
        return 0
    } catch (Exception e) {
        println("Error creating pipeline job: ${e.message}")
        e.printStackTrace()
        return 1
    }
}

// Validate GitHub credentials before proceeding
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

// Parse command line arguments or use defaults
def cli = new CliBuilder(usage: 'groovy createPipeline.groovy [options]')
cli.r(longOpt: 'repo', args: 1, required: true, 'Git repository URL')
cli.b(longOpt: 'branches', args: 1, required: false, 'Comma-separated list of branches (default: main)')
cli.p(longOpt: 'path', args: 1, required: false, 'Path to Jenkinsfile (default: Jenkinsfile)')
cli.i(longOpt: 'id', args: 1, required: false, 'Jenkins credentials ID (default: github-credentials)')
cli.w(longOpt: 'webhook', args: 1, required: false, 'Enable webhook trigger (true/false, default: true)')
cli.d(longOpt: 'docker_username', args: 1, required: false, 'Docker username (default: "")')

def options = cli.parse(args)
if (!options) {
    return 1
}

def repoUrl = options.r
def branches = options.b ? options.b.split(',') : ['**/main']
def jenkinsfilePath = options.p ?: 'Jenkinsfile'
def credentialsId = options.i ?: 'github-credentials'
def enableWebhookStr = options.w ?: 'true'
def enableWebhook = enableWebhookStr.toLowerCase() == 'true'
def docker_username = options.d ?: ""

println("Configuration:")
println("- Repository URL: ${repoUrl}")
println("- Branches: ${branches}")
println("- Jenkinsfile path: ${jenkinsfilePath}")
println("- Credentials ID: ${credentialsId}")
println("- Webhook enabled: ${enableWebhook}")
println("- Docker username: ${docker_username}")

// Validate credentials
if (!validateCredentials(credentialsId)) {
    println("Proceeding with pipeline creation, but webhook functionality may not work!")
}

// Create a pipeline job for each branch
def failureCount = 0
branches.each { branch ->
    def branchSuffix = branch.replace('**/', '').replace('*', '')
    def result = createPipelineJob(repoUrl, branch, jenkinsfilePath, credentialsId, enableWebhook, branchSuffix)
    if (result != 0) {
        failureCount++
    }
}

if (failureCount > 0) {
    println("WARNING: ${failureCount} pipeline job(s) failed to create properly.")
    return 1
} else {
    println("All pipeline jobs created successfully!")
    if (enableWebhook) {
        println("GitHub webhooks are enabled - make sure your GitHub repository has webhook configured to ${Jenkins.getInstance().rootUrl ?: 'your-jenkins-url'}/github-webhook/")
    } else {
        println("GitHub webhooks are disabled - jobs will use SCM polling instead")
    }


    def envVars = [
            "DOCKERHUB_USERNAME": docker_username,
            "GITHUB_USERNAME": repoUrl.tokenize(':')[1].tokenize('/')[0],
            "GITHUB_REPO_NAME": repoUrl.tokenize('/')[-1].replace('.git', ''),
    ]
    envUtils.setGlobalEnvironmentVariables(envVars)
    return 0
}