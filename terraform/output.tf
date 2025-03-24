output "vpc_id" {
  value = module.compute.instance_ids
}

output "private_subnet_id" {
  value = module.subnet.private_subnet_id
}
output "public_subnet_id" {
  value = module.subnet.public_subnet_id
}

output "security_group_id" {
  value = module.security.default_security_id
}

output "key_pair_file_name" {
  value = module.security.key_pair_file_name
}

output "jenkins_url" {
  value = var.deployment_type == "ec2" ? "http://${module.compute.jenkins_instance_ip}:" : module.compute.load_balancer_dns
}
