#!/usr/bin/env groovy
import jenkins.model.*
import com.cloudbees.plugins.credentials.*
import com.cloudbees.plugins.credentials.common.*
import com.cloudbees.plugins.credentials.domains.*
import com.cloudbees.plugins.credentials.impl.*

// Create CliBuilder for parsing arguments
def cli = new CliBuilder(usage: 'groovy create-dockerhub-credentials.groovy [options]')
cli.u(longOpt: 'username', args: 1, required: true, 'DockerHub username')
cli.p(longOpt: 'password', args: 1, required: true, 'DockerHub password')
cli.i(longOpt: 'id', args: 1, required: false, 'Credentials ID (default: dockerhub-credentials)')
cli.d(longOpt: 'description', args: 1, required: false, 'Credentials description (default: DockerHub Credentials)')

def options = cli.parse(args)
if (!options) {
    return 1
}

def dockerHubUsername = options.u
def dockerHubPassword = options.p
def credentialsId = options.i ?: 'dockerhub-credentials'
def description = options.d ?: 'DockerHub Credentials'

println("Setting up DockerHub credentials...")

try {
    // Get Jenkins instance
    def jenkins = Jenkins.getInstance()
    
    // Get credentials domain
    def domain = Domain.global()
    
    // Get credentials store
    def store = jenkins.getExtensionList(
        "com.cloudbees.plugins.credentials.SystemCredentialsProvider"
    )[0].getStore()
    
    // Check if credentials already exist
    def existingCredentials = store.getCredentials(domain).find { it.id == credentialsId }
    if (existingCredentials) {
        println("Credentials with ID ${credentialsId} already exist. Updating...")
        store.removeCredentials(domain, existingCredentials)
    }
    
    // Define credentials
    def credentials = new UsernamePasswordCredentialsImpl(
        CredentialsScope.GLOBAL,
        credentialsId,
        description,
        dockerHubUsername,
        dockerHubPassword
    )
    
    // Add credentials to store
    store.addCredentials(domain, credentials)
    
    println("DockerHub credentials created successfully!")
    return 0
} catch (Exception e) {
    println("Error creating DockerHub credentials: ${e.message}")
    e.printStackTrace()
    return 1
}

