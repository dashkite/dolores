import * as STS from "@aws-sdk/client-sts"
import { lift } from "./helpers"

cache =
  account: null

AWS =
  STS: lift STS

getAccount = ->
  cache.account ?= ( await AWS.STS.getCallerIdentity() ).Account

export {
  getAccount
}