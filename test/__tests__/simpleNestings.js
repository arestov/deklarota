const test = require('ava')

const requirejs = require('../../requirejs-config')

const spv = requirejs('spv')
const Model = requirejs('pv/Model')
// const pvUpdate = requirejs('pv/update')
// const pvState = requirejs('pv/state')
const getNesting = requirejs('pv/getNesting')

const init = requirejs('test/init')

const waitFlow = require('../waitFlow')

test('nestings legacy inited', async t => {
  const Appartment = spv.inh(Model, {}, {
    '+states': {},
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
    '+states': {},
  })

  const person = (await init({
    '+nests': {
      appartment: ['nest', [Appartment]],
    },
  })).app_model

  return waitFlow(person).then(person => {
    t.truthy(getNesting(person, 'appartment'))
  })
})
