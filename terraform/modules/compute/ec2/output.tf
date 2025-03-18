# Outputs
output "instance_ids" {
  value = aws_instance.main_ec2[*].id
}

output "jenkins_instance_ip" {
  value       = aws_instance.main_ec2[0].public_ip
  description = "The public IP of the Jenkins instance"
}
output "jenkins_url" {
  value       = "http://${aws_instance.main_ec2[0].public_ip}:${var.jenkins_port}"
  description = "The URL to access Jenkins"
}
