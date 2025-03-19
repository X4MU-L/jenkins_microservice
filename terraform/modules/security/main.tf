resource "aws_security_group" "default" {
  vpc_id = var.vpc_id
  tags   = merge(var.tags, { Name = "default-sg" })
  name   = var.name

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = var.ingress_cidr_blocks
  }

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = var.ingress_cidr_blocks
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = var.ingress_cidr_blocks
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = var.egress_cidr_blocks
  }
}

resource "aws_security_group" "jenkins" {
  vpc_id = var.vpc_id
  name   = "jenkins-sg"
  tags   = merge(var.tags, { Name = "jenkins-sg" })

  ingress {
    from_port   = var.jenkins_node_port
    to_port     = var.jenkins_node_port
    protocol    = "tcp"
    cidr_blocks = var.ingress_cidr_blocks
    description = "Jenkins NodePort UI"
  }

  ingress {
    from_port   = var.jenkins_container_port
    to_port     = var.jenkins_container_port
    protocol    = "tcp"
    cidr_blocks = var.ingress_cidr_blocks
    description = "Jenkins Web UI"
  }

  ingress {
    from_port   = var.jenkins_agent_node_port
    to_port     = var.jenkins_agent_node_port
    protocol    = "tcp"
    cidr_blocks = var.ingress_cidr_blocks
    description = "Jenkins JNLP"
  }

  ingress {
    from_port   = 6443
    to_port     = 6443
    protocol    = "tcp"
    cidr_blocks = var.ingress_cidr_blocks
    description = "Kubernetes API Server"
  }
}

# create private key
resource "tls_private_key" "main" {
  algorithm = "RSA"
  rsa_bits  = 4096
}

resource "aws_key_pair" "main" {
  key_name   = "${var.app_name}-key"
  public_key = tls_private_key.main.public_key_openssh
}


resource "local_file" "private_key" {
  content              = tls_private_key.main.private_key_pem
  filename             = pathexpand("~/.ssh/${var.app_name}-key.pem")
  file_permission      = "0400"
  directory_permission = "0700"
}
