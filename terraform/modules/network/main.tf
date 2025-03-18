# create a virtual private cloud for out infra
resource "aws_vpc" "main_vpc" {
  cidr_block           = var.vpc_cidr
  tags                 = var.tags
  enable_dns_hostnames = var.enable_dns_hostnames
  enable_dns_support   = true
}

# create internet gateway for the vpc
# add tags
resource "aws_internet_gateway" "igw_main" {
  vpc_id = aws_vpc.main_vpc.id
  tags   = var.tags
}

# Create Route Tables
resource "aws_route_table" "public_route_table" {
  vpc_id = aws_vpc.main_vpc.id
  tags   = var.tags
}

#  Add Route to Internet in Public Route Table
resource "aws_route" "public_internet_route" {
  route_table_id         = aws_route_table.public_route_table.id
  destination_cidr_block = "0.0.0.0/0"
  gateway_id             = aws_internet_gateway.igw_main.id
}

# Associate Public Route Table with Public Subnet
resource "aws_route_table_association" "public_assoc" {
  subnet_id      = var.public_subnet_id
  route_table_id = aws_route_table.public_route_table.id
}


#  Create NAT Gateway for Private Subnets
resource "aws_eip" "nat_eip" {
}
resource "aws_nat_gateway" "nat" {
  allocation_id = aws_eip.nat_eip.id
  subnet_id     = var.public_subnet_id
}

resource "aws_route_table" "private_route_table" {
  vpc_id = aws_vpc.main_vpc.id
}

resource "aws_route" "private_nat_route" {
  route_table_id         = aws_route_table.private_route_table.id
  destination_cidr_block = "0.0.0.0/0"
  nat_gateway_id         = aws_nat_gateway.nat.id
}

resource "aws_route_table_association" "private_assoc" {
  subnet_id      = var.private_subnet_id
  route_table_id = aws_route_table.private_route_table.id
}
