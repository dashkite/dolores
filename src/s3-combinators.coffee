import * as S3 from "@aws-sdk/client-s3"
import { lift, partition } from "./helpers"
import { MediaType } from "@dashkite/media-type"

AWS =
  S3: lift S3
  
assign = ( key ) -> ( value ) ->
  ( context ) -> context[ key ] = value ; context

bucket = ( bucket ) ->
  ( context = {}) ->
    context.Bucket = bucket
    context

key = ( key ) ->
  ( context ) ->
    context.Key = key
    context.ContentType = MediaType.format MediaType.fromPath key
    context

body = assign "Body"

type = assign "ContentType"

cache = assign "CacheControl"

put = ( context ) ->
  AWS.S3.putObject context

export { bucket, key, body, type, cache, put }