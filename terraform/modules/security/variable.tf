variable "vpc_id" {
  description = "The VPC ID"
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

variable "name" {
  description = "The name of the security group instance"
  type        = string
}

variable "app_name" {
  description = "The name of the application"
  type = string
}