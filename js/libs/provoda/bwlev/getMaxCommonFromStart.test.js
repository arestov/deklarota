import {it, expect} from '@jest/globals'

import getMaxCommonFromStart from './getMaxCommonFromStart'

it('getClosestStep', () => {
  expect(getMaxCommonFromStart([1, 2, 3], [1, 2, 3])).toMatchSnapshot()
  expect(getMaxCommonFromStart([1, 77, 89], [1, 2, 3])).toMatchSnapshot()
  expect(getMaxCommonFromStart([9, 77, 89], [1, 2, 3])).toMatchSnapshot()
  expect(getMaxCommonFromStart([1, 2, 3], [1, 2, 4])).toMatchSnapshot()
})
