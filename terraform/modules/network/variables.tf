# Variables
variable "vpc_cidr" {
  description = "The CIDR block for the VPC"
  type        = string
}

variable "tags" {
  description = "The tags for the network infra computes"
  type        = map(string)
}

variable "public_subnet_id" {
  description = "The Public subnet id"
  type        = string
}

variable "private_subnet_id" {
  description = "The private subnet id"
  type        = string
}

variable "enable_dns_hostnames" {
  description = "Enable DNS hostnames in the VPC"
  type        = bool
  default     = true

}
