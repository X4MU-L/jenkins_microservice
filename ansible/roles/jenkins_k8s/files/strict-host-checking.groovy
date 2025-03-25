#!/usr/bin/env groovy

import jenkins.model.*
import org.jenkinsci.plugins.gitclient.verifier.*
import java.util.logging.Level
import java.util.logging.Logger

class SSHHostKeyVerificationConfigurator {
    
    def configureHostKeyVerification(String hostKey) {
        try {
            // Get Jenkins instance
            def jenkins = Jenkins.getInstance()
            
            // Get the Git Host Key Verification Configuration descriptor
            def instance = jenkins.getDescriptor("org.jenkinsci.plugins.gitclient.GitHostKeyVerificationConfiguration")
            
            // Create verification strategy
            def strategy = new ManuallyProvidedKeyVerificationStrategy(hostKey)
            
            // Set the verification strategy
            instance.setSshHostKeyVerificationStrategy(strategy)
            
            // Save the configuration
            instance.save()
            
            println("SSH Host Key Verification configured successfully!")
            return 0
        } catch (Exception e) {
            println("Error configuring SSH Host Key Verification: ${e.message}")
            e.printStackTrace()
            return 1
        }
    }
    
    def processHostKeyVerification(Map config) {
        println("Configuring SSH Host Key Verification with:")
        println("- Host Key: ${config.hostKey}")
        
        // Validate required parameters
        if (!config.hostKey) {
            println("ERROR: Host key is required")
            return 1
        }
        
        return configureHostKeyVerification(config.hostKey)
    }
}
