#!/usr/bin/env groovy

import jenkins.model.*
import hudson.model.*
import hudson.security.*
import org.jenkinsci.main.modules.cli.auth.ssh.UserPropertyImpl
import java.util.logging.Logger
import java.util.logging.Level

/**
 * Jenkins initialization script to configure SSH CLI authentication
 * with comprehensive error handling and logging
 */

// Initialize logging
def logger = Logger.getLogger("jenkins.ssh.cli.setup")
logger.info("Starting SSH CLI authentication configuration")

try {
    // Get Jenkins instance
    def jenkins = Jenkins.getInstance()
    if (jenkins == null) {
        throw new Exception("Jenkins instance is not available")
    }
    
    // Configuration parameters
    def adminUsername = "{{ jenkins_admin_username }}"
    def publicKey = "jenkins_ssh_public_key"
    
    // Verify security realm is set up
    def securityRealm = jenkins.getSecurityRealm()
    if (securityRealm == null || !(securityRealm instanceof SecurityRealm)) {
        throw new Exception("Security realm not properly configured")
    }
    
    // Use User.get instead of direct UserDetails access
    logger.info("Looking up user: ${adminUsername}")
    def user = User.get(adminUsername, false) // false = don't create if doesn't exist
    
    if (user == null) {
        logger.warning("User ${adminUsername} not found. Checking if we need to create it.")
        
        // Check if we're using Jenkins own user database
        if (securityRealm instanceof HudsonPrivateSecurityRealm) {
            logger.info("Using HudsonPrivateSecurityRealm - can create user if needed")
            // Only create user if using Jenkins' own user database
            user = User.get(adminUsername, true) // true = create if doesn't exist
            logger.info("Created user: ${adminUsername}")
        } else {
            throw new Exception("User ${adminUsername} not found and cannot be created with current security realm")
        }
    }
    
    // Get or create SSH user property
    def sshProperty = user.getProperty(UserPropertyImpl.class)
    if (sshProperty == null) {
        logger.info("Adding SSH property to user ${adminUsername}")
        sshProperty = new UserPropertyImpl()
        user.addProperty(sshProperty)
    } else {
        logger.info("Updating existing SSH property for user ${adminUsername}")
    }
    
    // Set the authorized key
    def currentKeys = sshProperty.authorizedKeys ?: ""
    if (!currentKeys.contains(publicKey.trim())) {
        logger.info("Setting new authorized SSH key")
        sshProperty.authorizedKeys = publicKey.trim()
        user.save()
        logger.info("SSH key saved successfully")
    } else {
        logger.info("SSH key already configured - no changes needed")
    }
    
    // Verify the changes
    def verifyProperty = user.getProperty(UserPropertyImpl.class)
    if (verifyProperty == null || !verifyProperty.authorizedKeys.contains(publicKey.trim())) {
        throw new Exception("Failed to verify SSH key configuration")
    }
    
    logger.info("SSH CLI authentication successfully configured for user: ${adminUsername}")
    println("SSH CLI authentication successfully configured for user: ${adminUsername}")
    
} catch (ClassNotFoundException e) {
    // Handle case where SSH CLI plugin is not installed
    logger.log(Level.SEVERE, "SSH CLI plugin not installed or incompatible. Error: ${e.message}", e)
    println("ERROR: SSH CLI plugin not installed or incompatible. Please install the SSH CLI Authentication plugin.")
    e.printStackTrace()
    
} catch (Exception e) {
    // Handle all other exceptions
    logger.log(Level.SEVERE, "Failed to configure SSH CLI authentication. Error: ${e.message}", e)
    println("ERROR: Failed to configure SSH CLI authentication: ${e.message}")
    e.printStackTrace()
}