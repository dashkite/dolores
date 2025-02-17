import { deployStack, deleteStack } from "./stack"
import { render } from "./gobo-vpc-helpers/template"

rescueNotFound = ( error ) ->
  if ! ( error.status in [ 400 ] )
    throw error

getARN = ( name, options = {} ) ->
  region = options.region ? _region
  account = options.registryID ? await getAccount()
  "arn:aws:rds:#{ region }:#{ account }:cluster:#{ name }"

createVPC = ( name, options = {} ) ->
  options.name = "vpc-#{ name }"

  template = render options
  deployStack name, template

deleteVPC = ( name ) ->
  deleteStack name

export {
  createVPC
  deleteVPC
}