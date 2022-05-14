// 4. множественный результат, указание адресата через аргумент

// a - передача state

import model from 'pv/model'
import pvState from 'pv/getAttr'
import getNesting from 'pv/getRel'
import updateNesting from 'pv/updateNesting'

import init from 'test/init'
import makeStepsRunner from 'test/steps'

const action = {
  to: {
    prev: [
      'selected', {
        base: 'arg_nesting_prev',
      },
    ],
    next: [
      'selected', {
        base: 'arg_nesting_next',
      },
    ],
  },
  fn({ prev_value, next_value }) {
    if (!prev_value && !next_value) {
      return null
    }

    if (!prev_value) {
      return {
        next: true,
      }
    }

    if (!next_value) {
      return {
        prev: false,
      }
    }

    return {
      next: true,
      prev: false,
    }
  },
}

const mdl = props => model(props)
const createDeepChild = (num, props) => mdl({
  model_name: `DeepChild${num}`,
  attrs: {
    selected: ['input'],
    desc: [
      'comp',
      [],
      () => `DeepChild${num}`,
    ],
  },
  ...props,
})

test('multiple state to arg base by pass calculated', async () => {
  const app = await setup()
  const steps = makeStepsRunner(app)


  const getA = () => getNesting(app.start_page, 'nest_a')
  const getB = () => getNesting(app.start_page, 'nest_b')

  return steps([
    () => {
      updateNesting(app.start_page, 'selected', getB())
    },
    () => {
      expect(undefined).toBe(pvState(getA(), 'selected'))
      expect(true).toBe(pvState(getB(), 'selected'))
    },
    () => {
      updateNesting(app.start_page, 'selected', getA())
    },
    () => {
      expect(true).toBe(pvState(getA(), 'selected'))
      expect(false).toBe(pvState(getB(), 'selected'))
    },
  ])

  async function setup() {
    const app = (await init({
      model_name: 'startModel',
      rels: {
        nest_a: ['nest', [createDeepChild('nestA')]],
        nest_b: ['nest', [createDeepChild('nestB')]],
        selected: [
          'input',
          { linking: ['<< nest_a', '<< nest_b'] },
        ],
      },
      actions: {
        'handleRel:selected': action,
      },
    })).app_model

    return app
  }
})
