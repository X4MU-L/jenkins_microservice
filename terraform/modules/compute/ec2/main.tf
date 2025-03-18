# modules/compute/main.tf

resource "aws_instance" "main_ec2" {
  count                       = var.instance_count
  ami                         = "ami-04b4f1a9cf54c11d0"
  instance_type               = var.instance_type
  subnet_id                   = var.subnet_id
  vpc_security_group_ids      = var.security_groups
  associate_public_ip_address = var.assign_ip
  key_name                    = var.key_name
  tags = merge(
    var.tags,
    {
      "Server" = var.instance_count > 1 && count.index == 0 ? var.apps[0] : var.apps[1]
    }
  )

  root_block_device {
    volume_size = var.volume_size # Increase to 30GB (or adjust as needed)
    volume_type = var.volume_type # Use gp3 for better performance
  }
}


# Load Balancers 
