import parse from './parse'

describe('parse', () => {
  it('should parse "tracks/[:artist],[:track]" correctly', () => {
    expect(parse('tracks/[:artist],[:track]')).toMatchSnapshot()
  })
})
