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

variable "jenkins_port" {
  description = "Port for Jenkins web interface"
  type        = number
  default     = 8080
}

variable "jenkins_agent_port" {
  description = "Port for Jenkins JNLP agents"
  type        = number
  default     = 50000
}
variable "apps" {
  description = "The application tags"
  type        = tuple([string, string])
}
