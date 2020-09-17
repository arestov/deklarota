import parse from './parse'

test('check parsing', function() {
  expect(parse('tracks/[:artist],[:track]')).toMatchSnapshot()
})
