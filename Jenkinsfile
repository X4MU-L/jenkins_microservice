pipeline {
    agent {
        kubernetes {
            yaml """
apiVersion: v1
kind: Pod
spec:
  containers:
  - name: docker
    image: docker:latest
    command:
    - cat
    tty: true
    volumeMounts:
    - name: docker-sock
      mountPath: /var/run/docker.sock
  - name: node
    image: node:18
    command:
    - cat
    tty: true
  - name: golang
    image: golang:1.19
    command:
    - cat
    tty: true
  - name: ansible
    image: ansible/ansible-runner:latest
    command:
    - cat
    tty: true
    volumeMounts:
    - name: ssh-keys
      mountPath: /home/jenkins/.ssh
  volumes:
  - name: docker-sock
    hostPath:
      path: /var/run/docker.sock
  - name: ssh-keys
    secret:
      secretName: jenkins-ssh-keys
"""
        }
    }
    
    environment {
        DOCKER_HUB_CREDS = credentials('dockerhub-credentials')
        FRONTEND_IMAGE = "${DOCKERHUB_USERNAME}/frontend:${env.BUILD_NUMBER}"
        BACKEND_IMAGE = "${DOCKERHUB_USERNAME}/backend:${env.BUILD_NUMBER}"
        WORKER_IMAGE = "${DOCKERHUB_USERNAME}/worker:${env.BUILD_NUMBER}"
        AWS_REGION = "us-east-1"  // Replace with your AWS region
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Test') {
            parallel {
                stage('Test Backend') {
                    steps {
                        dir('backend') {
                            container('node') {
                                sh 'npm ci'
                                sh 'npm test'
                            }
                        }
                    }
                }
                
                stage('Test Frontend') {
                    steps {
                        dir('frontend') {
                            container('node') {
                                sh 'npm ci'
                                sh 'npm test'
                            }
                        }
                    }
                }
                
                stage('Test Worker') {
                    steps {
                        dir('worker') {
                            container('golang') {
                                sh 'go test ./...'
                            }
                        }
                    }
                }
            }
        }
        
        stage('Build') {
            parallel {
                stage('Build Backend') {
                    steps {
                        dir('backend') {
                            container('docker') {
                                sh 'docker build -t ${BACKEND_IMAGE} .'
                                sh 'echo ${DOCKER_HUB_CREDS_PSW} | docker login -u ${DOCKER_HUB_CREDS_USR} --password-stdin'
                                sh 'docker push ${BACKEND_IMAGE}'
                            }
                        }
                    }
                }
                
                stage('Build Frontend') {
                    steps {
                        dir('frontend') {
                            container('docker') {
                                sh 'docker build -t ${FRONTEND_IMAGE} .'
                                sh 'echo ${DOCKER_HUB_CREDS_PSW} | docker login -u ${DOCKER_HUB_CREDS_USR} --password-stdin'
                                sh 'docker push ${FRONTEND_IMAGE}'
                            }
                        }
                    }
                }
                
                stage('Build Worker') {
                    steps {
                        dir('worker') {
                            container('docker') {
                                sh 'docker build -t ${WORKER_IMAGE} .'
                                sh 'echo ${DOCKER_HUB_CREDS_PSW} | docker login -u ${DOCKER_HUB_CREDS_USR} --password-stdin'
                                sh 'docker push ${WORKER_IMAGE}'
                            }
                        }
                    }
                }
            }
        }
        
        stage('Deploy to AWS') {
            steps {
                container('ansible') {
                    // Setup AWS credentials for Ansible
                    sh 'mkdir -p ~/.aws'
                    withCredentials([file(credentialsId: 'aws-credentials', variable: 'AWS_CREDS')]) {
                        sh 'cp ${AWS_CREDS} ~/.aws/credentials'
                    }
                    
                    // Create inventory file dynamically based on AWS tags
                    sh '''
                    cat > inventory.aws.yml << EOF
plugin: aws_ec2
regions:
  - ${AWS_REGION}
keyed_groups:
  - key: tags.Role
    prefix: role
EOF
                    '''
                    
                    // Copy SSH key for connection
                    sh 'mkdir -p ~/.ssh'
                    sh 'cp /home/jenkins/.ssh/aws-server-key.pem ~/.ssh/'
                    sh 'chmod 600 ~/.ssh/aws-server-key.pem'
                    
                    // Run deployment playbook
                    sh '''
                    ansible-playbook -i inventory.aws.yml ansible/deploy.yml \\
                      -e "frontend_image=${FRONTEND_IMAGE}" \\
                      -e "backend_image=${BACKEND_IMAGE}" \\
                      -e "worker_image=${WORKER_IMAGE}" \\
                      -e "build_number=${BUILD_NUMBER}" \\
                      --private-key=~/.ssh/aws-server-key.pem
                    '''
                }
            }
        }
    }
    
    post {
        always {
            cleanWs()
        }
        success {
            echo 'Pipeline completed successfully!'
        }
        failure {
            echo 'Pipeline failed!'
        }
    }
}