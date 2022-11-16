import FS from "node:fs/promises"
import Path from "node:path"

# TODO make logger path configurable
#      no need to hardcode to .sky/log
$root = Path.resolve ".sky", "log"

log = ( topic, name, text ) ->
  path = Path.join $root, topic, name
  directory = Path.dirname path
  await FS.mkdir  directory, recursive: true
  FS.appendFile path, "#{ text }\n"

clean = ->
  FS.rm $root, 
    recursive: true
    force: true



export { log, clean }