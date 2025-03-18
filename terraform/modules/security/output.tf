output "default_security_id" {
  value = aws_security_group.default.id
}
output "jenkins_security_group_id" {
  value = aws_security_group.jenkins.id
}

output "key_name" {
  value = aws_key_pair.main.key_name
}

output "key_pair_file_name" {
  value = local_file.private_key.filename
}
