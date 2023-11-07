class HTTPError extends Error
  constructor: ( error ) ->
    status = error.$metadata.httpStatusCode
    super "HTTP Error: #{ status }"
    @_ = error
    @status = status


lift = (M, options) ->

  options ?= region: "us-east-1"
  client = undefined

  proxy = ( command ) -> 
    ( parameters = {} ) ->
      try
        await client.send new command parameters
      catch error
        if error.$metadata?.httpStatusCode?
          if process.env.DEBUG?
            console.log error
          throw new HTTPError error
        else
          throw error

  N = {}
  for key, value of M
    if key.endsWith "Command"
      name = key
        .replace /Command$/, ""
        .replace /^[A-Z]/, (c) -> c.toLowerCase()
      N[ name ] = proxy value
    else if key.endsWith "Client"
      client = new value options
  N

turn = (nodes, state, context) ->
  for node in nodes
    if node.pattern == state.name || node.pattern.test? state.name
      if node.action?
        await node.action context, state
      if node.result?
        state.result = await node.result context, state
      else if node.next?
        original = state.name
        state.name = await node.next context, state
        # console.log "#{original} -> #{state.name}"
        if node.nodes?
          try
            await turn node.nodes, state, context
          catch error
            if ! /^Unknown state/.test error.message
              throw error
      return undefined
  # if we get here, no nodes matched, which is a bad state
  throw new Error "Unknown state [ #{state.name} ]"

runNetwork = (nodes, state, context) ->
  loop
    await turn nodes, state, context
    if state.result?
      return state.result

# From joy's partition.
partition = (n, i) ->
  batch = []
  for x from i
    batch.push x
    if batch.length == n
      yield batch
      batch = []
  if batch.length > 0
    yield batch

export { log } from "./logger"



export {
  lift
  runNetwork
  partition
}