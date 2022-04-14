import {describe, it, expect} from '@jest/globals'

import isBwlevName from './isBwlevName'

describe('isBwlevName', () => {
  it.each([
    ['bwlev'],
    ['bwlev:'],
    ['bwlev:rf'],
    [':rf'],
    [':']

  ])('result should match snapshot for "%s"', input => {
    expect(isBwlevName(input)).toMatchSnapshot()
  })
})
