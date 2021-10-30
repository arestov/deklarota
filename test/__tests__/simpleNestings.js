import spv from 'spv'
import model from 'pv/model'
// import pvUpdate from 'pv/updateAttr'
// import pvState from 'pv/getAttr'
import getNesting from 'pv/getRel'

import init from 'test/init'

const waitFlow = require('../waitFlow')

test('nestings legacy inited', async () => {
  const Appartment = model({
    attrs: {},
  })

  const person = (await init({
    rels: {
      appartment: ['nest', [Appartment]],
    },
  })).app_model

  return waitFlow(person).then(person => {
    // t.is(undefined, getNesting(person, 'garage'))
    expect(getNesting(person, 'appartment')).toBeTruthy()
    // t.is(49588, pvState(getNesting(person, 'appartment'), 'number'))
  })
})

test('nestings new inited', async () => {
  const Appartment = model({
    attrs: {},
  })

  const person = (await init({
    rels: {
      appartment: ['nest', [Appartment]],
    },
  })).app_model

  return waitFlow(person).then(person => {
    expect(getNesting(person, 'appartment')).toBeTruthy()
  })
})
