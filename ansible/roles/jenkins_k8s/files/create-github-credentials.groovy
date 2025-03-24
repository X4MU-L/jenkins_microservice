#!/usr/bin/env groovy

import jenkins.model.*
import com.cloudbees.plugins.credentials.*
import com.cloudbees.plugins.credentials.domains.*
import com.cloudbees.jenkins.plugins.sshcredentials.impl.*
import hudson.plugins.sshslaves.verifiers.*

// Function to create GitHub SSH credentials
def createGitHubCredentials(String credentialsId, String description, String username, String sshKeyPath) {
    try {
        // Get Jenkins instance
        def jenkins = Jenkins.getInstance()
        
        // Get credentials domain
        def domain = Domain.global()
        
        // Get credentials store
        def store = jenkins.getExtensionList(SystemCredentialsProvider.class)[0].getStore()
        
        // Check if credentials already exist
        def existingCredentials = store.getCredentials(domain).find { it.id == credentialsId }
        if (existingCredentials) {
            println("Credentials with ID '${credentialsId}' already exist, updating...")
            store.removeCredentials(domain, existingCredentials)
        }
        
        // Read SSH private key
        def privateKey = new File(sshKeyPath).text
        
        // Create SSH credentials
        def credentials = new BasicSSHUserPrivateKey(
            CredentialsScope.GLOBAL,
            credentialsId,
            username,
            new BasicSSHUserPrivateKey.DirectEntryPrivateKeySource(privateKey),
            "",  // passphrase
            description
        )
        
        // Add credentials to store
        store.addCredentials(domain, credentials)
        
        println("GitHub SSH credentials '${credentialsId}' created successfully!")
        return 0
    } catch (Exception e) {
        println("Error creating GitHub credentials: ${e.message}")
        e.printStackTrace()
        return 1
    }
}

// Parse command line arguments or use defaults
def cli = new CliBuilder(usage: 'groovy create-github-credentials.groovy [options]')
cli.i(longOpt: 'id', args: 1, required: false, 'Credentials ID (default: github-ssh-key)')
cli.d(longOpt: 'description', args: 1, required: false, 'Credentials description (default: GitHub SSH Key)')
cli.u(longOpt: 'username', args: 1, required: false, 'GitHub username (default: git)')
cli.k(longOpt: 'key-path', args: 1, required: false, 'Path to SSH private key file (default: /var/jenkins_home/.ssh/id_rsa)')

def options = cli.parse(args)
if (!options) {
    return 1
}

def credentialsId = options.i ?: 'github-ssh-key'
def description = options.d ?: 'GitHub SSH Key'
def username = options.u ?: 'git'
def sshKeyPath = options.k ?: '/var/jenkins_home/.ssh/github-ssh-key'

// Create GitHub SSH credentials
createGitHubCredentials(credentialsId, description, username, sshKeyPath)
return 0