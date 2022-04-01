import {describe, it, expect} from '@jest/globals'

import parse, { toBasicTemplate } from './parse'

describe('parse', () => {
  describe('smoke', () => {
    it.each([
      ['tracks/[:artist]'],
      ['tracks/[:artist],[:track]'],
      ['tracks/[:artist:next_value],([:track])'],
      ['tracks/[:artist::Smith]'],
      ['tracks/[:artist::nice%20to%20have%20you)]']

    ])('result should match snapshot for "%s"', input => {
      expect(parse(input)).toMatchSnapshot()
    })

    it.each([
      ['tracks/[:artist:next_value],([:track])'],
      ['tracks/[:artist],([:track])'],
      ['tracks/']
    ])('result should match snapshot for "%s"', input => {
      expect(toBasicTemplate(input)).toMatchSnapshot()
    })

    it.each([
      ['tracks/[::]'],
      ['tracks/[:artist][:track]'],
      ['tracks/[:artist:next_value:]'],
      ['tracks/[:artist:next_value:john]'],
    ])('should throw for "%s"', input => {
      expect(() => parse(input)).toThrow()
    })
  })
})
