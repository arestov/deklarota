import {describe, it, expect} from '@jest/globals'

import parse from './parse'
import stringify from './stringify'

describe('parse', () => {
  describe('smoke', () => {
    it.each([
      ['tracks/[:artist]', {artist: 'Smith'}],
      ['tracks/[:artist],[:track]', {artist: 'Smith', track: 'nice to have you'}],
      ['tracks/[:artist:next_value],([:track])', {next_value: 'Smith', track: 'nice to have you'}],
      ['tracks/[:artist::Smith]', {artist: 'Smith'}],
    ])('result should match snapshot for "%s"', (template, data) => {
      expect(stringify(parse(template), data)).toMatchSnapshot()
    })
  })
})
