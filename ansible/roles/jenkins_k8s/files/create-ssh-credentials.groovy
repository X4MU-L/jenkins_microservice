#!/usr/bin/env groovy

import jenkins.model.*
import com.cloudbees.plugins.credentials.*
import com.cloudbees.plugins.credentials.domains.*
import com.cloudbees.plugins.credentials.impl.*
import com.cloudbees.jenkins.plugins.sshcredentials.impl.*
import hudson.plugins.sshslaves.verifiers.*

class GitHubCredentialsCreator {
    
    def createSSHCredentials(String credentialsId, String description, String username, String sshKeyPath) {
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
            
            println("SSH credentials '${credentialsId}' created successfully!")
            return 0
        } catch (Exception e) {
            println("Error creating SSH credentials: ${e.message}")
            e.printStackTrace()
            return 1
        }
    }
    
    def processCredentials(Map config) {
        println("Creating SSH credentials with:")
        println("- Credentials ID: ${config.credentialsId}")
        println("- Description: ${config.description}")
        println("- Username: ${config.username}")
        println("- SSH Key Path: ${config.sshKeyPath}")
        
        // Validate SSH key file exists
        def keyFile = new File(config.sshKeyPath)
        if (!keyFile.exists()) {
            println("ERROR: SSH key file not found at ${config.sshKeyPath}")
            return 1
        }
        
        return createSSHCredentials(
            config.credentialsId,
            config.description,
            config.username,
            config.sshKeyPath
        )
    }
}