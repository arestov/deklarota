import {it, expect} from '@jest/globals'

import getClosestToEndCommonStep from './getClosestToEndCommonStep'

it('getClosestStep', () => {
  expect(getClosestToEndCommonStep([1, 2, 3], [1, 2, 3])).toMatchSnapshot()
  expect(getClosestToEndCommonStep([1, 77, 89], [1, 2, 3])).toMatchSnapshot()
  expect(getClosestToEndCommonStep([9, 77, 89], [1, 2, 3])).toMatchSnapshot()
  expect(getClosestToEndCommonStep([1, 2, 3], [1, 2, 4])).toMatchSnapshot()
})
