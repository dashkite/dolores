import { test } from "@dashkite/amen"

import * as Type from "@dashkite/joy/type"
import { generic } from "@dashkite/joy/generic"

findTarget = ( active ) ->
  ( target ) ->
    active.includes target.toLowerCase()

isActive = do ({ active } = {}) -> 
  active = process.env.target?.split /\s+/
  ( targets ) ->
    !active? || ( targets.find findTarget active )?

target = generic name: "target"

generic target, Type.isArray, Type.isObject, Type.isFunction, 
  ( tx, spec, f ) ->
    if isActive tx
      test spec, await f() 
    else 
      test spec.description

generic target, Type.isArray, Type.isString, Type.isFunction, 
  ( tx, name, f ) -> target tx, description: name, f

generic target, Type.isString, Type.isString, Type.isFunction,
  ( t, name, f ) -> target [ t ], description: name, f

generic target, Type.isString, Type.isFunction, 
  ( name, f ) -> target [ name ], description: name, f

export {
  target
}