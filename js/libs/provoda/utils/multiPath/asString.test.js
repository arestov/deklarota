import test from 'ava'

import parse from './parse'
import asString from './asString'

function pipe(str) {
  return asString(parse(str))
}

test('check asString', function(t) {

  // "< state_name < nesting < resource < #"

  t.snapshot(pipe('< @one:state_name < nesting < resource < #'))
  t.snapshot(pipe('<< @one:nesting'))

  // t.snapshot(parse("< state_name < @one:nesting < resource < #"));

  t.snapshot(pipe('< state_name < nesting < resource < #'))

  t.snapshot(pipe('< state_name << /resource/[:ddaf]/sdf < #'))

  t.snapshot(pipe('< state_name <<< #'))

  t.snapshot(pipe('<< nesting_name << #'))

  t.snapshot(pipe('<< nesting_name << ^^'))

  t.snapshot(pipe('< state_name <<< ^^'))

  t.snapshot(pipe('< state_name'))

  t.snapshot(pipe('state_name'))

  t.snapshot(pipe('/resource/[:ddaf]/sdf < #'))

  t.snapshot(pipe('/resource/[:ddaf]/sdf <'))

  t.snapshot(pipe('nesting_name < < ^^'))
})
