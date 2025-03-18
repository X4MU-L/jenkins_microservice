variable "vpc_cidr" {
  description = "The CIDR block for the VPC"
  type        = string
}

variable "vpc_id" {
  description = "The VPC id to subnet"
  type        = string
}

variable "tags" {
  description = "The tags for the network infra computes"
  type        = map(string)
}
