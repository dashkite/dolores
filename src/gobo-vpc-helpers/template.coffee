###
This template deploys a VPC, with a pair of public and private subnets spread
across two Availability Zones. It deploys an internet gateway, with a default
route on the public subnets. It deploys a pair of NAT gateways (one in each AZ),
and default routes for them in the private subnets.

Connecting ECS nodes with AWS EFS requires the NFS protocol, so we must grant
access to both sides of a TCP connection on port 2049.
https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/security-group-rules-reference.html#sg-rules-efs
###
export render = ( options = {} ) -> 
  if !options.name
    throw new Error "must specify Gobo VPC environment name"
  
  # IP range (CIDR notation) for this VPC
  options.VpcCIDR ?= "10.192.0.0/16"

  # IP range (CIDR notation) for the public subnet in the first Availability Zone
  options.PublicSubnet1CIDR ?= "10.192.10.0/24"

  # IP range (CIDR notation) for the public subnet in the second Availability Zone
  options.PublicSubnet2CIDR ?= "10.192.11.0/24"

  # IP range (CIDR notation) for the private subnet in the first Availability Zone
  options.PrivateSubnet1CIDR ?= "10.192.20.0/24"

  # IP range (CIDR notation) for the private subnet in the second Availability Zone
  options.PrivateSubnet2CIDR ?= "10.192.21.0/24"

  """
  AWSTemplateFormatVersion: "2010-09-09"
  Description: "VPC for Gobo Environment [ #{options.name} ]"
  Resources:
    VPC:
      Type: AWS::EC2::VPC
      Properties:
        CidrBlock: #{options.VpcCIDR}
        EnableDnsSupport: true
        EnableDnsHostnames: true
        Tags:
          - Key: Name
            Value: #{options.name}

    InternetGateway:
      Type: AWS::EC2::InternetGateway
      Properties:
        Tags:
          - Key: Name
            Value: #{options.name}

    InternetGatewayAttachment:
      Type: AWS::EC2::VPCGatewayAttachment
      Properties:
        InternetGatewayId: !Ref InternetGateway
        VpcId: !Ref VPC

    PublicSubnet1:
      Type: AWS::EC2::Subnet
      Properties:
        VpcId: !Ref VPC
        AvailabilityZone: !Select [ 0, !GetAZs '' ]
        CidrBlock: #{options.PublicSubnet1CIDR}
        MapPublicIpOnLaunch: true
        Tags:
          - Key: Name
            Value: #{options.name} Public Subnet (AZ1)

    PublicSubnet2:
      Type: AWS::EC2::Subnet
      Properties:
        VpcId: !Ref VPC
        AvailabilityZone: !Select [ 1, !GetAZs  '' ]
        CidrBlock: #{options.PublicSubnet2CIDR}
        MapPublicIpOnLaunch: true
        Tags:
          - Key: Name
            Value: #{options.name} Public Subnet (AZ2)

    PrivateSubnet1:
      Type: AWS::EC2::Subnet
      Properties:
        VpcId: !Ref VPC
        AvailabilityZone: !Select [ 0, !GetAZs  '' ]
        CidrBlock: #{options.PrivateSubnet1CIDR}
        MapPublicIpOnLaunch: false
        Tags:
          - Key: Name
            Value: #{options.name} Private Subnet (AZ1)

    PrivateSubnet2:
      Type: AWS::EC2::Subnet
      Properties:
        VpcId: !Ref VPC
        AvailabilityZone: !Select [ 1, !GetAZs  '' ]
        CidrBlock: #{options.PrivateSubnet2CIDR}
        MapPublicIpOnLaunch: false
        Tags:
          - Key: Name
            Value: #{options.name} Private Subnet (AZ2)

    PublicRouteTable:
      Type: AWS::EC2::RouteTable
      Properties:
        VpcId: !Ref VPC
        Tags:
          - Key: Name
            Value: #{options.name} Public Routes

    DefaultPublicRoute:
      Type: AWS::EC2::Route
      DependsOn: InternetGatewayAttachment
      Properties:
        RouteTableId: !Ref PublicRouteTable
        DestinationCidrBlock: 0.0.0.0/0
        GatewayId: !Ref InternetGateway

    PublicSubnet1RouteTableAssociation:
      Type: AWS::EC2::SubnetRouteTableAssociation
      Properties:
        RouteTableId: !Ref PublicRouteTable
        SubnetId: !Ref PublicSubnet1

    PublicSubnet2RouteTableAssociation:
      Type: AWS::EC2::SubnetRouteTableAssociation
      Properties:
        RouteTableId: !Ref PublicRouteTable
        SubnetId: !Ref PublicSubnet2

    DatabaseSecurityGroup:
      Type: AWS::EC2::SecurityGroup
      Properties:
        GroupName: "#{options.name}-database"
        GroupDescription: "Gobo Aurora Database SG"
        VpcId: !Ref VPC
        SecurityGroupIngress:
          - CidrIp: "10.192.0.0/16"
            Description: "Allows database to accept incoming connections from VPC"
            IpProtocol: tcp
            FromPort: 5432
            ToPort: 5432

    APISecurityGroup:
      Type: AWS::EC2::SecurityGroup
      Properties:
        GroupName: "#{options.name}-api"
        GroupDescription: "Gobo API node SG"
        VpcId: !Ref VPC
        SecurityGroupIngress:
          - CidrIp: "10.192.0.0/16"
            Description: "Allows API nodes to accept incoming HTTP requests from load balancer." 
            IpProtocol: tcp
            FromPort: 5000
            ToPort: 5000
        
        SecurityGroupEgress:
          - CidrIp: "0.0.0.0/0"
            Description: "Allows API nodes to reach APIs on public Internet"
            IpProtocol: tcp
            FromPort: 443
            ToPort: 443

          - CidrIp: "10.192.0.0/16"
            Description: "Allows API nodes to reach database"
            IpProtocol: tcp
            FromPort: 5432
            ToPort: 5432

          - CidrIp: "10.192.0.0/16"
            Description: "Allows API nodes to reach EFS"
            IpProtocol: tcp
            FromPort: 2049
            ToPort: 2049

    WorkerSecurityGroup:
      Type: AWS::EC2::SecurityGroup
      Properties:
        GroupName: "#{options.name}-worker"
        GroupDescription: "Gobo worker node SG"
        VpcId: !Ref VPC
        SecurityGroupEgress:
          - CidrIp: "0.0.0.0/0"
            Description: "Allows worker nodes to reach APIs on public Internet"
            IpProtocol: tcp
            FromPort: 443
            ToPort: 443

          - CidrIp: "10.192.0.0/16"
            Description: "Allows worker nodes to reach database"
            IpProtocol: tcp
            FromPort: 5432
            ToPort: 5432

          - CidrIp: "10.192.0.0/16"
            Description: "Allows worker nodes to reach EFS"
            IpProtocol: tcp
            FromPort: 2049
            ToPort: 2049

    EFSSecurityGroup1:
      Type: AWS::EC2::SecurityGroup
      Properties:
        GroupName: "#{options.name}-efs-api"
        GroupDescription: "Gobo EFS SG from API Nodes"
        VpcId: !Ref VPC
        SecurityGroupIngress:
          - CidrIp: "10.192.0.0/16"
            GroupId: !GetAtt APISecurityGroup.GroupId
            Description: "Allows EFS instance to be reached by API nodes within the VPC" 
            IpProtocol: tcp 
            FromPort: 2049
            ToPort: 2049

    EFSSecurityGroup2:
      Type: AWS::EC2::SecurityGroup
      Properties:
        GroupName: "#{options.name}-efs-worker"
        GroupDescription: "Gobo EFS SG from Worker Nodes"
        VpcId: !Ref VPC
        SecurityGroupIngress:
          - CidrIp: "10.192.0.0/16"  
            GroupId: !GetAtt WorkerSecurityGroup.GroupId
            Description: "Allows EFS instance to be reached by worker nodes within the VPC" 
            IpProtocol: tcp
            FromPort: 2049
            ToPort: 2049

    LoadBalancerSecurityGroup:
      Type: AWS::EC2::SecurityGroup
      Properties:
        GroupName: "#{options.name}-load-balanacer"
        GroupDescription: "Gobo load balancer SG"
        VpcId: !Ref VPC
        SecurityGroupIngress:
          - CidrIp: "0.0.0.0/0"
            Description: "Allows load balancer to accept incoming HTTPS requests" 
            IpProtocol: tcp
            FromPort: 443
            ToPort: 443


  Outputs:
    VPC:
      Description: A reference to the created VPC
      Value: !Ref VPC

    PublicSubnets:
      Description: A list of the public subnets
      Value: !Join [ ",", [ !Ref PublicSubnet1, !Ref PublicSubnet2 ]]

    PrivateSubnets:
      Description: A list of the private subnets
      Value: !Join [ ",", [ !Ref PrivateSubnet1, !Ref PrivateSubnet2 ]]

    PublicSubnet1:
      Description: A reference to the public subnet in the 1st Availability Zone
      Value: !Ref PublicSubnet1

    PublicSubnet2:
      Description: A reference to the public subnet in the 2nd Availability Zone
      Value: !Ref PublicSubnet2

    PrivateSubnet1:
      Description: A reference to the private subnet in the 1st Availability Zone
      Value: !Ref PrivateSubnet1

    PrivateSubnet2:
      Description: A reference to the private subnet in the 2nd Availability Zone
      Value: !Ref PrivateSubnet2

    DatabaseSecurityGroup:
      Description: Security group for database
      Value: !Ref DatabaseSecurityGroup

    APISecurityGroup:
      Description: Security group for api node
      Value: !Ref APISecurityGroup

    WorkerSecurityGroup:
      Description: Security group for worker node
      Value: !Ref WorkerSecurityGroup

    LoadBalancerSecurityGroup:
      Description: Security group for load balancer
      Value: !Ref LoadBalancerSecurityGroup
  """