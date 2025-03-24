#!/usr/bin/env groovy

import jenkins.model.*
import com.cloudbees.plugins.credentials.*
import com.cloudbees.plugins.credentials.common.*
import com.cloudbees.plugins.credentials.domains.*
import com.cloudbees.plugins.credentials.impl.*

class DockerHubCredentialsCreator {
    
    def createSimpleCredentials(String username, String password, String credentialsId, String description) {
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
                username,
                password
            )
            
            // Add credentials to store
            store.addCredentials(domain, credentials)
            
            println("Simple password and username Credentials created successfully!")
            return 0
        } catch (Exception e) {
            println("Error creating simple password and username credentials: ${e.message}")
            e.printStackTrace()
            return 1
        }
    }
    
    def processCredentials(Map config) {
        println("Creating Simple password and username credentials with:")
        println("- Username: ${config.username}")
        println("- Credentials ID: ${config.credentialsId}")
        println("- Description: ${config.description}")
        
        // Validate required parameters
        if (!config.username || !config.password) {
            println("ERROR: DockerHub username and password are required")
            return 1
        }
        
        return createSimpleCredentials(
            config.username,
            config.password,
            config.credentialsId,
            config.description
        )
    }
}