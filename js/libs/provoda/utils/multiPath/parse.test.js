import parse from './parse'

test('check parsing', function() {
  //
  // "< state_name < nesting < resource < #"

  expect(parse('< @one:state_name < nesting < resource < #')).toMatchSnapshot()

  // t.snapshot(parse("< state_name < @one:nesting < resource < #"));

  expect(function() {
    parse('< state_name < @one:nesting < resource < #')
  }).toThrow()

  expect(function() {
    parse('< @one: < nesting < resource < #')
  }).toThrow()

  expect(parse('< state_name < nesting < resource < #')).toMatchSnapshot()

  expect(function() {
    parse('< state_name < aggr:nesting < resource < #')
  }).toThrow()

  expect(parse('< state_name << /resource/[:ddaf]/sdf < #')).toMatchSnapshot()

  expect(parse('< state_name <<< #')).toMatchSnapshot()

  expect(parse('<< nesting_name << #')).toMatchSnapshot()

  expect(parse('<< nesting_name << ^^')).toMatchSnapshot()

  expect(parse('< state_name <<< ^^')).toMatchSnapshot()

  expect(parse('< state_name')).toMatchSnapshot()

  expect(parse('state_name')).toMatchSnapshot()

  expect(parse('@one:state_name:nest')).toMatchSnapshot()
  expect(parse('@state_name:nest.test')).toMatchSnapshot()


  expect(parse('/resource/[:ddaf]/sdf < #')).toMatchSnapshot()

  expect(parse('/resource/[:ddaf]/sdf <')).toMatchSnapshot()

  expect(parse('nesting_name < < ^^')).toMatchSnapshot()


})
