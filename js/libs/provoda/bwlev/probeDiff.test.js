import {it, expect} from '@jest/globals'

import { zoomingAndConverting } from './probeDiff'

it('getClosestStep', () => {
  const zooming = zoomingAndConverting((item) => item)

  expect(zooming([1, 2, 3], [1, 2, 3])).toMatchSnapshot()
  expect(zooming([1, 77, 89], [1, 2, 3])).toMatchSnapshot()
  expect(zooming([9, 77, 89], [1, 2, 3])).toMatchSnapshot()
  expect(zooming([1, 2, 3], [1, 2, 4])).toMatchSnapshot()
})
