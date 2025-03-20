variable "aws_profile" {
  description = "AWS profile to use"
  type        = string
  default     = "tech4devops"
}

variable "vpc_cidr" {
  description = "The CIDR block for the VPC"
  type        = string
}

variable "aws_region" {
  description = "Aws region for the infra"
  type        = string
}

variable "instance_count" {
  description = "The number of instances to launch"
  type        = number
}
variable "instance_type" {
  description = "The type of instance to launch"
  type        = string
}

variable "tags" {
  description = "The tags for the network infra computes"
  type        = map(string)
}
variable "egress_cidr_blocks" {
  description = "The egress cidr blocks for the security group"
  type        = list(string)
}

variable "ingress_cidr_blocks" {
  description = "The ingress cidr blocks for the security group"
  type        = list(string)
}

variable "deployment_type" {
  description = "Type of deployment (ec2 or eks)"
  type        = string
  validation {
    condition     = contains(["ec2", "eks"], var.deployment_type)
    error_message = "Allowed values are: eks and ec2"
  }
}
variable "apps" {
  description = "The application tags"
  type        = tuple([string, string])
}
variable "CONTAINER_PORT" {
  description = "Port for container interface"
  type        = number
}
variable "NODE_PORT" {
  description = "Port for Jenkins Nodeport to kubernetes"
  type        = number
}
variable "AGENT_PORT" {
  description = "Port for Jenkins JNLP agents"
  type        = number
}
variable "AGENT_NODE_PORT" {
  description = "NodePort for Jenkins JNLP agents"
  type        = number
}

variable "JENKINS_SSH_PORT" {
  description = "Port for Jenkins SSH interface"
  type        = number
}

variable "SSH_NODE_PORT" {
  description = "Port for SSH Nodeport to kubernetes"
  type        = number
}
variable "SECRET_NAME_VOLUME_KEY" {
  description = "The secret name for the volume key in kubernetes"
  type        = string

}
variable "APP_NAME" {
  description = "The application name"
  type        = string
}

variable "APP_VERSION" {
  description = "The application version"
  type        = string
}

variable "APP_DESCRIPTION" {
  description = "The application description"
  type        = string
}

variable "APP_AUTHOR" {
  description = "The application author"
  type        = string

}
variable "GITHUB_USERNAME" {
  description = "The github username"
  type        = string
}
