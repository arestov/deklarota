import parse from './parse'
import asString from './asString'

function pipe(str) {
  return asString(parse(str))
}

test('check asString', function() {

  // "< state_name < nesting < resource < #"

  expect(pipe('< @one:state_name < nesting < resource < #')).toMatchSnapshot()
  expect(pipe('<< @one:nesting')).toMatchSnapshot()

  // t.snapshot(parse("< state_name < @one:nesting < resource < #"));

  expect(pipe('< state_name < nesting < resource < #')).toMatchSnapshot()

  expect(pipe('< state_name << /resource/[:ddaf]/sdf < #')).toMatchSnapshot()

  expect(pipe('< state_name <<< #')).toMatchSnapshot()

  expect(pipe('<< nesting_name << #')).toMatchSnapshot()

  expect(pipe('<< nesting_name << ^^')).toMatchSnapshot()

  expect(pipe('< state_name <<< ^^')).toMatchSnapshot()

  expect(pipe('< state_name')).toMatchSnapshot()

  expect(pipe('state_name')).toMatchSnapshot()

  expect(pipe('/resource/[:ddaf]/sdf < #')).toMatchSnapshot()

  expect(pipe('/resource/[:ddaf]/sdf <')).toMatchSnapshot()

  expect(pipe('nesting_name < < ^^')).toMatchSnapshot()
})
