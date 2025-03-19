# Variables
variable "instance_count" {
  description = "The number of instances to launch"
  type        = number
}
variable "instance_type" {
  description = "The type of instance to launch"
  type        = string
}
variable "subnet_id" {
  description = "The ID of the subnet to launch the instances in"
  type        = string
}
variable "security_groups" {
  description = "The security groups to assign to the instances"
  type        = list(string)
}

variable "key_name" {
  description = "The private key name for the ec2 instance"
  type        = string
}
variable "assign_ip" {
  description = "Assign a public IP to the instance"
  type        = bool
  default     = false
}

variable "volume_size" {
  description = "The size of the root volume in GB"
  type        = number
  default     = 30
}

variable "volume_type" {
  description = "The type of volume to use"
  type        = string
  default     = "gp3"
}
variable "tags" {
  description = "A map of tags to add to all resources"
  type        = map(string)
}

variable "jenkins_port" {
  description = "Port for Jenkins web interface"
  type        = number
}
variable "apps" {
  description = "tags for the instances"
  type        = tuple([string, string])
}
