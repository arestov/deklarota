import {describe, it, expect} from '@jest/globals'

import parse from './parse'

describe('parse', () => {
  describe('smoke', () => {
    it.each([
      ['tracks/[:artist]'],
      ['tracks/[:artist],[:track]'],
      ['tracks/[:artist:next_value],([:track])'],

    ])('result should match snapshot for "%s"', input => {
      expect(parse(input)).toMatchSnapshot()
    })

    it.each([
      ['tracks/[:artist][:track]'],
      ['tracks/[:artist:next_value:]'],
      ['tracks/[:artist:next_value:john]'],
    ])('should throw for "%s"', input => {
      expect(() => parse(input)).toThrow()
    })
  })
})
