import * as EC2 from "@aws-sdk/client-ec2"
import { lift } from "./helpers"

AWS =
  EC2: lift EC2, region: "us-east-1"

tagsToObject = ( tags ) ->
  result = {}
  for tag in tags
    result[ tag.Key ] = tag.Value
  result

get = ( name = "default" ) ->
  { $metadata, Vpcs } = await AWS.EC2.describeVpcs 
    Filters: [ Name: "tag:Name", Values: [ name ] ]
  if $metadata.httpStatusCode == 200
    [ vpc ] = Vpcs
    tags = tagsToObject vpc.Tags
    id: vpc.VpcId
    name: tags.Name
    _: vpc
  else
    throw new Error "Dolores: VPC.get: unexpected status
      [ #{ $metadata.httpStatusCode }"

# we assume here that there will not be sufficient items 
# returned to justify using an asyc iterator
Subnets =
  list: ( name = "default" ) ->
    vpc = await get name
    { $metadata, Subnets } = await AWS.EC2.describeSubnets 
      Filters: [ Name: "vpc-id", Values: [ vpc.id ]]
    if $metadata.httpStatusCode == 200
      for subnet in Subnets
        id: subnet.SubnetId
        zone: subnet.AvailabilityZone
        arn: subnet.SubnetArn
        _: subnet
    else
      throw new Error "Dolores: VPC.Subnet.list: unexpected status
        [ #{ $metadata.httpStatusCode }"

SecurityGroups =
  list: ( name = "default" ) ->
    vpc = await get name
    { $metadata, SecurityGroups } = await AWS.EC2.describeSecurityGroups
      Filters: [ 
        { Name: "vpc-id", Values: [ vpc.id ] }
        # assume the group name is the VPC name
        { Name: "group-name", Values: [ name ] }
      ]

    if $metadata.httpStatusCode == 200
      for group in SecurityGroups
        id: group.GroupId
        description: group.Description
        vpc: group.VpcId
        _: group
    else
      throw new Error "Dolores: VPC.SecurityGroups.list: unexpected status
        [ #{ $metadata.httpStatusCode }"

export {
  get
  Subnets
  SecurityGroups
}