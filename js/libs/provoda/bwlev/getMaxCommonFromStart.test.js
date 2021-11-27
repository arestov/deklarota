import {it, expect} from '@jest/globals'

import { getMaxCommonFromStart, getMaxCommonFromEnd } from './getMaxCommonFromStart'

it('getMaxCommonFromStart', () => {
  expect(getMaxCommonFromStart([1, 2, 3], [1, 2, 3])).toMatchSnapshot()
  expect(getMaxCommonFromStart([1, 77, 89], [1, 2, 3])).toMatchSnapshot()
  expect(getMaxCommonFromStart([9, 77, 89], [1, 2, 3])).toMatchSnapshot()
  expect(getMaxCommonFromStart([1, 2, 3], [1, 2, 4])).toMatchSnapshot()

  expect(getMaxCommonFromStart([1, 2, 3, 4, 5, 6], [1, 2, 3])).toMatchSnapshot()

})

it('getMaxCommonFromEnd', () => {
  expect(getMaxCommonFromEnd([1, 2, 3], [1, 2, 3])).toMatchSnapshot()
  expect(getMaxCommonFromEnd([4, 77, 3], [1, 2, 3])).toMatchSnapshot()
  expect(getMaxCommonFromEnd([9, 77, 89], [1, 2, 3])).toMatchSnapshot()
  expect(getMaxCommonFromEnd([4, 2, 3], [1, 2, 3])).toMatchSnapshot()

  expect(getMaxCommonFromEnd([6, 5, 4, 1, 2, 3], [1, 2, 3])).toMatchSnapshot()

  expect(getMaxCommonFromEnd([1, 2, 3], [1, 5, 3])).toMatchSnapshot()
})
