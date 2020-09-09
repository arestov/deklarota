import test from 'ava'


import spv from 'spv'
import Model from 'pv/Model'
// import pvUpdate from 'pv/updateAttr'
// import pvState from 'pv/getAttr'
import getNesting from 'pv/getRel'

import init from 'test/init'

const waitFlow = require('../waitFlow')

test('nestings legacy inited', async t => {
  const Appartment = spv.inh(Model, {}, {
    attrs: {},
  })

  const person = (await init({
    'nest-appartment': [Appartment],
  })).app_model

  return waitFlow(person).then(person => {
    // t.is(undefined, getNesting(person, 'garage'))
    t.truthy(getNesting(person, 'appartment'))
    // t.is(49588, pvState(getNesting(person, 'appartment'), 'number'))
  })
})

test('nestings new inited', async t => {
  const Appartment = spv.inh(Model, {}, {
    attrs: {},
  })

  const person = (await init({
    rels: {
      appartment: ['nest', [Appartment]],
    },
  })).app_model

  return waitFlow(person).then(person => {
    t.truthy(getNesting(person, 'appartment'))
  })
})
