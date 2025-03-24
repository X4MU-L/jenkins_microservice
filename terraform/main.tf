

# Root Module - main.tf
module "network" {
  source               = "./modules/network"
  vpc_cidr             = var.vpc_cidr
  private_subnet_id    = module.subnet.private_subnet_id
  public_subnet_id     = module.subnet.public_subnet_id
  enable_dns_hostnames = true
  tags                 = var.tags
}

module "subnet" {
  source   = "./modules/subnets"
  vpc_cidr = var.vpc_cidr
  vpc_id   = module.network.vpc_id
  tags     = var.tags
}

module "security" {
  source                  = "./modules/security"
  name                    = "MySecurityGroup"
  vpc_id                  = module.network.vpc_id
  egress_cidr_blocks      = var.egress_cidr_blocks
  ingress_cidr_blocks     = var.ingress_cidr_blocks
  app_name                = var.APP_NAME
  tags                    = var.tags
  jenkins_node_port       = var.NODE_PORT
  jenkins_container_port  = var.CONTAINER_PORT
  jenkins_agent_node_port = var.AGENT_NODE_PORT
  jenkins_ssh_port        = var.JENKINS_SSH_PORT
  jenkins_ssh_node_port   = var.SSH_NODE_PORT

}

module "compute" {
  source          = "./modules/compute/ec2"
  instance_count  = var.instance_count
  instance_type   = var.instance_type
  subnet_id       = module.subnet.public_subnet_id
  key_name        = module.security.key_name
  security_groups = [module.security.default_security_id, module.security.jenkins_security_group_id]
  tags            = var.tags
  apps            = var.apps
  assign_ip       = true
  volume_size     = 30
  volume_type     = "gp3"
  jenkins_port    = var.NODE_PORT

  #   # EC2-specific variables (only used when deployment_type = "ec2")
  # instance_type     = "t3.small"
  # key_name         = module.security.key_name
  # volume_size      = 50
  # volume_type      = "gp3"

  # # EKS-specific variables (only used when deployment_type = "eks")
  # cluster_version  = "1.27"
  # node_group_size = 2
}
