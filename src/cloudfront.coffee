import * as CloudFront from "@aws-sdk/client-cloudfront"
import { lift, partition } from "./helpers"
import * as It from "@dashkite/joy/iterable"

AWS =
  CloudFront: lift CloudFront

normalize = ( distribution ) ->
  { Comment, Id, ARN, Status } = distribution
  name: Comment
  id: Id
  arn: ARN
  status: Status?.toLowerCase()
  _: distribution

list = ->
  Marker = undefined
  loop
    { $metadata, DistributionList } = await AWS.CloudFront.listDistributions { Marker }
    if $metadata.httpStatusCode == 200
      { NextMarker, Items } = DistributionList
      ( yield normalize item ) for item in Items
      if NextMarker? then Marker = NextMarker else break
    else
      throw new Error "cloudfront::list: unexpected status [ #{ $metadata.httpStatusCode } ]"
  # undefined

isAliasFor = (domain) -> ({ _ }) -> _.Aliases.Items?.includes domain
find = ( domain ) -> It.find ( isAliasFor domain ), list()

getDistributionForDomain = ( domain ) -> find domain

addCustomHeader = ({ domain, origin, name, value }) ->

  distribution = await find domain

  { 
    $metadata
    ETag
    DistributionConfig 
  } = await AWS.CloudFront.getDistributionConfig Id: distribution.id

  if $metadata.httpStatusCode == 200

    origin = DistributionConfig
      .Origins.Items.find ({ DomainName }) -> origin == DomainName

    if origin?

      headers = ( origin.CustomHeaders.Items ? [] )

      if ( header = headers.find ({ HeaderName }) -> HeaderName == name )?
        header.HeaderValue = value
      else
        headers.push
          HeaderName: name
          HeaderValue: value

      DistributionConfig.Origins.Items[0].CustomHeaders.Items = headers
      DistributionConfig.Origins.Items[0].CustomHeaders.Quantity = headers.length

      AWS.CloudFront.updateDistribution 
        Id: distribution.id
        IfMatch: ETag
        DistributionConfig: DistributionConfig

    else
      throw new Error "cloudfront.addCustomHeader: missing origin [ #{ origin } ]"

  else
    throw new Error "cloudfront.addCustomHeader: unexpected status [ #{ $metadata.httpStatusCode } ]"

invalidatePaths = ({ domain, paths }) ->
  if ( distribution = await find domain )?
  
    { 
      $metadata
      Invalidation
      Location 
    } = await AWS.CloudFront.createInvalidation 
      DistributionId: distribution.id
      InvalidationBatch:
        CallerReference: Date.now()
        Paths:
          Items: paths
          Quantity: paths.length
    
    if $metadata.httpStatusCode != 201
      throw new Error "cloudfront.invalidatePaths: 
        unexpected status [ #{ $metadata.httpStatusCode } ]"
  else # distribution not found
    throw new Error "cloudfront.invalidatePaths:
      distribution not found for domain [ #{ domain } ]"

listCachePolicies = ->
  do ({ normalize } = {}) ->
    normalize = ( item ) ->
      id: item.CachePolicy.Id
      name: item.CachePolicy.CachePolicyConfig.Name
    Marker = undefined
    loop
      { $metadata, CachePolicyList } = await AWS.CloudFront.listCachePolicies { Marker }
      if $metadata.httpStatusCode == 200
        { NextMarker, Items } = CachePolicyList
        ( yield normalize item ) for item in Items
        if NextMarker? then Marker = NextMarker else break
      else
        throw new Error "cloudfront::listCachePolicies: unexpected status [ #{ $metadata.httpStatusCode } ]"
    return

getCachePolicy = ( name ) ->
  for await policy from listCachePolicies()
    if policy.name == name
      return policy
  return undefined

listRequestPolicies = ->
  do ({ normalize } = {}) ->
    normalize = ( item ) ->
      id: item.OriginRequestPolicy.Id
      name: item.OriginRequestPolicy.OriginRequestPolicyConfig.Name
    Marker = undefined
    loop
      { $metadata, OriginRequestPolicyList } = 
        await AWS.CloudFront.listOriginRequestPolicies { Marker }
      if $metadata.httpStatusCode == 200
        { NextMarker, Items } = OriginRequestPolicyList
        ( yield normalize item ) for item in Items
        if NextMarker? then Marker = NextMarker else break
      else
        throw new Error "cloudfront::listRequestPolicies:
          unexpected status [ #{ $metadata.httpStatusCode } ]"
    return

getRequestPolicy = ( name ) ->
  for await policy from listRequestPolicies()
    if policy.name == name
      return policy
  return undefined


listResponsePolicies = ->
  do ({ normalize } = {}) ->
    normalize = ( item ) ->
      id: item.ResponseHeadersPolicy.Id
      name: item.ResponseHeadersPolicy.ResponseHeadersPolicyConfig.Name
    Marker = undefined
    loop
      { $metadata, ResponseHeadersPolicyList } = 
        await AWS.CloudFront.listResponseHeadersPolicies { Marker }
      if $metadata.httpStatusCode == 200
        { NextMarker, Items } = ResponseHeadersPolicyList
        ( yield normalize item ) for item in Items
        if NextMarker? then Marker = NextMarker else break
      else
        throw new Error "cloudfront::listResponsePolicies:
          unexpected status [ #{ $metadata.httpStatusCode } ]"
    return

getResponsePolicy = ( name ) ->
  for await policy from listResponsePolicies()
    if policy.name == name
      return policy
  return undefined

export {
  list
  find
  addCustomHeader
  invalidatePaths
  getDistributionForDomain
  listCachePolicies
  getCachePolicy
  listRequestPolicies
  getRequestPolicy
  listResponsePolicies
  getResponsePolicy
}