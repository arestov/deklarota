import {describe, it, expect} from '@jest/globals'

import parse from './parse'

describe('parse', () => {
  describe('smoke', () => {
    it.each([
      ['< @one:state_name < nesting < resource < #'],
      ['< state_name < nesting < resource < #'],
      ['< state_name << resource/[:ddaf]/sdf < #'],
      ['< state_name <<< #'],
      ['< state_name <<'],
      ['<< nesting_name << #'],
      ['<< nesting_name << ^^'],
      ['<< nesting_name'],
      ['< state < nesting_name'],
      ['< state_name <<< ^^'],
      ['< state_name'],
      ['state_name'],
      ['@one:state_name:nest'],
      ['@state_name:nest.test'],
      ['resource/[:ddaf]/sdf < #'],
      ['resource/[:ddaf]/sdf <'],
      ['nesting_name < < ^^'],
      ['<<<< #'],
    ])('result should match snapshot for "%s"', input => {
      expect(parse(input)).toMatchSnapshot()
    })

    it.each([
      ['< state_name < @one:nesting < resource < #'],
      ['< @one: < nesting < resource < #'],
      ['< state_name < aggr:nesting < resource < #'],
    ])('should throw for "%s"', input => {
      expect(() => parse(input)).toThrow()
    })
  })
})
