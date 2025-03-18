vpc_cidr            = "10.0.0.0/16"
aws_region          = "us-east-1"
instance_count      = 2
instance_type       = "t3.medium"
egress_cidr_blocks  = ["0.0.0.0/0"]
ingress_cidr_blocks = ["0.0.0.0/0"]
tags = {
  Name  = "ansible-tags",
  App   = "ansible-learn"
  Other = "ansible"
}
jenkins_port       = 8081
jenkins_agent_port = 50001
deployment_type    = "ec2"
apps               = ["Jenkins", "Services"]
