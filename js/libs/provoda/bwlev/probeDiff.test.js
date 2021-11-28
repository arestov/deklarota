import {it, expect} from '@jest/globals'

import { zoomingAndConverting, traveling } from './probeDiff'

it('getClosestStep', () => {
  const zooming = zoomingAndConverting((item) => item)

  expect(zooming([1, 2, 3], [1, 2, 3])).toMatchSnapshot()
  expect(zooming([1, 77, 89], [1, 2, 3])).toMatchSnapshot()
  expect(zooming([9, 77, 89], [1, 2, 3])).toMatchSnapshot()
  expect(zooming([1, 2, 3], [1, 2, 4])).toMatchSnapshot()
})

it.each([
  [
    [1, 2, 3], [1, 2, 3],
  ],
  [
    [1, 2, 3, 4, 5, 6, 7], [1, 2, 7, 4, 11, 12, 7],
  ],
  [
    [1, 2, 3, 4, 5, 6, 7], [1, 2, 7, 4, 11, 6, 7],
  ],
  [
    [1, 2, 3, 4, 5, 6, 7], [1, 8, 7],
  ],
  [
    [1, 2, 3, 4], [3, 4]
  ],
  [
    [1, 2, 3, 4], [1, 3, 4]
  ],
  [
    [3, 4], [1, 2, 3, 4]
  ],
])(
  'traveling(%j, %j)',
  (a, b) => {
    expect(traveling(a, b)).toMatchSnapshot()
  },
)
