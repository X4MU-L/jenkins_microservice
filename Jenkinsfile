pipeline {
    agent {
        kubernetes {
            yaml """
apiVersion: v1
kind: Pod
metadata:
  labels:
    jenkins: agent
spec:
  containers:
  - name: docker
    image: docker:dind
    command: ['dockerd', '--host=unix:///var/run/docker.sock', '--host=tcp://0.0.0.0:2375', '--storage-driver=overlay2']
    securityContext:
      privileged: true
  - name: helm
    image: alpine/helm:3.11.0
    command: ['cat']
    tty: true
  - name: terraform
    image: hashicorp/terraform:1.5.0
    command: ['cat']
    tty: true
  - name: ansible
    image: ansible/ansible-runner:latest
    command: ['cat']
    tty: true
  - name: kubectl
    image: bitnami/kubectl:latest
    command: ['cat']
    tty: true
"""
        }
    }
    
    environment {
        AWS_REGION = 'us-east-1'
        ECR_REPO = '123456789012.dkr.ecr.us-east-1.amazonaws.com'
        DOCKER_REGISTRY_CREDS = credentials('docker-registry-credentials')
        AWS_CREDENTIALS = credentials('aws-credentials')
        GITHUB_TOKEN = credentials('github-token')
        SONAR_TOKEN = credentials('sonar-token')
        MONGODB_URI = credentials('mongodb-uri')
        POSTGRES_CREDS = credentials('postgres-credentials')
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Code Quality & Linting') {
            parallel {
                stage('Backend API Linting') {
                    when { changeset "backend-api/**" }
                    steps {
                        dir('backend-api') {
                            sh 'npm install'
                            sh 'npm run lint'
                            sh 'npm run format'
                        }
                    }
                }
                
                stage('Frontend Linting') {
                    when { changeset "frontend/**" }
                    steps {
                        dir('frontend') {
                            sh 'npm install'
                            sh 'npm run lint'
                            sh 'npm run format'
                        }
                    }
                }
                
                stage('Worker Service Linting') {
                    when { changeset "worker-service/**" }
                    steps {
                        dir('worker-service') {
                            sh 'pip install black flake8'
                            sh 'black --check .'
                            sh 'flake8 .'
                        }
                    }
                }
            }
        }
        
        stage('Unit Tests') {
            parallel {
                stage('Backend API Tests') {
                    when { changeset "backend-api/**" }
                    steps {
                        dir('backend-api') {
                            sh 'npm run test'
                            sh 'npm run test:cov'
                        }
                    }
                }
                
                stage('Frontend Tests') {
                    when { changeset "frontend/**" }
                    steps {
                        dir('frontend') {
                            sh 'npm run test'
                        }
                    }
                }
                
                stage('Worker Service Tests') {
                    when { changeset "worker-service/**" }
                    steps {
                        dir('worker-service') {
                            sh 'pip install pytest pytest-cov'
                            sh 'pytest --cov=app'
                        }
                    }
                }
            }
        }
        
        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('SonarQube') {
                    sh 'sonar-scanner -Dsonar.projectKey=microservices-app -Dsonar.sources=.'
                }
                timeout(time: 2, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }
        
        stage('Build & Push Images') {
            parallel {
                stage('Build Backend API') {
                    when { changeset "backend-api/**" }
                    steps {
                        script {
                            docker.withRegistry("https://${ECR_REPO}", 'ecr:us-east-1:aws-credentials') {
                                def backendImage = docker.build("${ECR_REPO}/backend-api:${env.BUILD_ID}", "./backend-api")
                                backendImage.push()
                                backendImage.push('latest')
                            }
                        }
                    }
                }
                
                stage('Build Frontend') {
                    when { changeset "frontend/**" }
                    steps {
                        script {
                            docker.withRegistry("https://${ECR_REPO}", 'ecr:us-east-1:aws-credentials') {
                                def frontendImage = docker.build("${ECR_REPO}/frontend:${env.BUILD_ID}", "./frontend")
                                frontendImage.push()
                                frontendImage.push('latest')
                            }
                        }
                    }
                }
                
                stage('Build Worker Service') {
                    when { changeset "worker-service/**" }
                    steps {
                        script {
                            docker.withRegistry("https://${ECR_REPO}", 'ecr:us-east-1:aws-credentials') {
                                def workerImage = docker.build("${ECR_REPO}/worker-service:${env.BUILD_ID}", "./worker-service")
                                workerImage.push()
                                workerImage.push('latest')
                            }
                        }
                    }
                }
            }
        }
        
        stage('Security Scan') {
            steps {
                sh 'trivy image ${ECR_REPO}/backend-api:${BUILD_ID}'
                sh 'trivy image ${ECR_REPO}/frontend:${BUILD_ID}'
                sh 'trivy image ${ECR_REPO}/worker-service:${BUILD_ID}'
            }
        }
        
        stage('Infrastructure Provisioning') {
            when {
                anyOf {
                    branch 'main'
                    branch 'staging'
                }
            }
            steps {
                container('terraform') {
                    dir('terraform') {
                        withCredentials([string(credentialsId: 'aws-credentials', variable: 'AWS_ACCESS_KEY_ID'),
                                        string(credentialsId: 'aws-secret-key', variable: 'AWS_SECRET_ACCESS_KEY')]) {
                            sh 'terraform init'
                            sh 'terraform plan -out=tfplan'
                            sh 'terraform apply -auto-approve tfplan'
                        }
                    }
                }
            }
        }
        
        stage('Server Configuration') {
            when {
                anyOf {
                    branch 'main'
                    branch 'staging'
                }
            }
            steps {
                container('ansible') {
                    dir('ansible') {
                        sh 'ansible-galaxy install -r requirements.yml'
                        sh 'ansible-playbook -i inventory.aws_ec2.yml configure-servers.yml'
                    }
                }
            }
        }
        
        stage('Deploy to Kubernetes') {
            when {
                anyOf {
                    branch 'main'
                    branch 'staging'
                }
            }
            steps {
                container('helm') {
                    dir('helm') {
                        script {
                            def environment = env.BRANCH_NAME == 'main' ? 'production' : 'staging'
                            
                            sh """
                            helm upgrade --install backend-api ./charts/backend-api \
                                --set image.tag=${env.BUILD_ID} \
                                --set environment=${environment} \
                                --namespace ${environment}
                                
                            helm upgrade --install frontend ./charts/frontend \
                                --set image.tag=${env.BUILD_ID} \
                                --set environment=${environment} \
                                --namespace ${environment}
                                
                            helm upgrade --install worker-service ./charts/worker-service \
                                --set image.tag=${env.BUILD_ID} \
                                --set environment=${environment} \
                                --namespace ${environment}
                            """
                        }
                    }
                }
            }
        }
        
        stage('Integration Tests') {
            when {
                anyOf {
                    branch 'main'
                    branch 'staging'
                }
            }
            steps {
                container('kubectl') {
                    script {
                        def environment = env.BRANCH_NAME == 'main' ? 'production' : 'staging'
                        
                        // Wait for deployments to be ready
                        sh "kubectl wait --for=condition=available --timeout=300s deployment/backend-api deployment/frontend deployment/worker-service -n ${environment}"
                        
                        // Get service endpoint
                        def apiEndpoint = sh(script: "kubectl get svc backend-api -n ${environment} -o jsonpath='{.status.loadBalancer.ingress[0].hostname}'", returnStdout: true).trim()
                        
                        // Run integration tests against the endpoint
                        dir('tests') {
                            sh "API_ENDPOINT=http://${apiEndpoint} npm run test:integration"
                        }
                    }
                }
            }
        }
        
        stage('Performance Tests') {
            when { branch 'main' }
            steps {
                container('kubectl') {
                    script {
                        def apiEndpoint = sh(script: "kubectl get svc backend-api -n production -o jsonpath='{.status.loadBalancer.ingress[0].hostname}'", returnStdout: true).trim()
                        
                        dir('tests') {
                            sh "k6 run --out influxdb=http://influxdb:8086/k6 performance-tests.js"
                        }
                    }
                }
            }
        }
    }
    
    post {
        always {
            junit '**/test-results/*.xml'
            archiveArtifacts artifacts: '**/test-reports/*.html'
            
            // Clean up
            sh 'docker system prune -f'
        }
        
        success {
            echo 'Pipeline completed successfully!'
            
            // Notify team on success
            slackSend(color: 'good', message: "Pipeline succeeded: ${env.JOB_NAME} ${env.BUILD_NUMBER} (<${env.BUILD_URL}|Open>)")
        }
        
        failure {
            echo 'Pipeline failed!'
            
            // Notify team on failure
            slackSend(color: 'danger', message: "Pipeline failed: ${env.JOB_NAME} ${env.BUILD_NUMBER} (<${env.BUILD_URL}|Open>)")
        }
    }
}