# Dynamically calculate subnet CIDRs using cidrsubnet()
resource "aws_subnet" "public_subnet" {
  vpc_id                  = var.vpc_id
  cidr_block              = cidrsubnet(var.vpc_cidr, 8, 1) # Creates a /24 from VPC /16
  map_public_ip_on_launch = true
  availability_zone       = data.aws_availability_zones.AV_zones.names[0]
  tags                    = var.tags

}

resource "aws_subnet" "private_subnet" {
  vpc_id            = var.vpc_id
  cidr_block        = cidrsubnet(var.vpc_cidr, 8, 2) # Another /24 from VPC /16
  availability_zone = data.aws_availability_zones.AV_zones.names[1]
  tags              = var.tags
}
