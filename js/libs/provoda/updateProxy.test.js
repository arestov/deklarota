import {it, expect} from '@jest/globals'

import {compoundComplexState} from './updateProxy'

it('compoundComplexState', () => {

  const fakeModel = {
    values: {
      attrA: 'attrAValue',
      attrB: 'attrBValue',
      attrC: 'attrCValue',
      attrD: 'attrDValue',
      attrE: 'attrEValue',
    },
    state: function(name) {
      return this.values[name]
    },
  }

  expect(compoundComplexState(
    fakeModel, {
      require_marks: [],
      depends_on: ['attrA'],
      fn: (attrA) => ([attrA])
    }
  )).toMatchSnapshot()

  expect(compoundComplexState(
    fakeModel, {
      require_marks: [],
      depends_on: ['attrA', 'attrB'],
      fn: (attrA, attrB) => ([attrA, attrB])
    }
  )).toMatchSnapshot()

  expect(compoundComplexState(
    fakeModel, {
      require_marks: [],
      depends_on: ['attrA', 'attrB', 'attrC'],
      fn: (attrA, attrB, attrC) => ([attrA, attrB, attrC])
    }
  )).toMatchSnapshot()

  expect(compoundComplexState(
    fakeModel, {
      require_marks: [],
      depends_on: ['attrA', 'attrB', 'attrC', 'attrD'],
      fn: (attrA, attrB, attrC, attrD) => ([attrA, attrB, attrC, attrD])
    }
  )).toMatchSnapshot()

  expect(compoundComplexState(
    fakeModel, {
      require_marks: [],
      depends_on: ['attrA', 'attrB', 'attrC', 'attrD', 'attrE'],
      fn: (attrA, attrB, attrC, attrD, attrE) => ([attrA, attrB, attrC, attrD, attrE])
    }
  )).toMatchSnapshot()
})
