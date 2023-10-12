import FS from "node:fs/promises"
import Path from "node:path"

$root = Path.resolve "log"

configure = ({ root }) -> $root = root

log = ( topic, name, text ) ->
  path = Path.join $root, topic, name
  directory = Path.dirname path
  await FS.mkdir  directory, recursive: true
  FS.appendFile path, "#{ text }\n"

clean = ->
  FS.rm $root, 
    recursive: true
    force: true



export { configure, log, clean }