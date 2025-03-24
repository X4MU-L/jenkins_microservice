#!/usr/bin/env groovy

import jenkins.model.*
import hudson.EnvVars
import hudson.slaves.EnvironmentVariablesNodeProperty

class EnvironmentUtils {
    static boolean setGlobalEnvironmentVariables(Map<String, String> envVars) {
        try {
            def jenkins = Jenkins.getInstance()
            def globalNodeProperties = jenkins.getGlobalNodeProperties()
            def envVarsNodePropertyList = globalNodeProperties.getAll(EnvironmentVariablesNodeProperty.class)
            
            EnvironmentVariablesNodeProperty envVarsNodeProperty = null
            if (envVarsNodePropertyList.isEmpty()) {
                envVarsNodeProperty = new EnvironmentVariablesNodeProperty()
                globalNodeProperties.add(envVarsNodeProperty)
            } else {
                envVarsNodeProperty = envVarsNodePropertyList.get(0)
            }
            
            EnvVars envVarsObject = envVarsNodeProperty.getEnvVars()
            
            envVars.each { key, value ->
                envVarsObject.put(key, value)
                println("Setting global environment variable: ${key}=${value}")
            }
            
            jenkins.save()
            println("Global environment variables set successfully!")
            return true
        } catch (Exception e) {
            println("Error setting global environment variables: ${e.message}")
            e.printStackTrace()
            return false
        }
    }
}
