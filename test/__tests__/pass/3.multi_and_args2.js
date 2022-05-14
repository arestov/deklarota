// 4. множественный результат, указание адресата через аргумент

// a - передача state

import model from 'pv/model'
import pvState from 'pv/getAttr'
import getNesting from 'pv/getRel'
import updateNesting from 'pv/updateNesting'

import init from '../../init'
import makeStepsRunner from '../../steps'

const action = {
  to: {
    next: [
      'selected', {
        base: 'arg_nesting_next',
        map_values_list_to_target: true,
      },
    ],
  },
  fn({ next_value }) {
    if (!next_value) {
      return null
    }

    return {
      next: [
        true,
        false,
      ],
    }
  },
}

const mdl = props => model(props)
const createDeepChild = (num, props) => mdl({
  model_name: `DeepChild${num}`,
  attrs: {
    desc: [
      'comp',
      [],
      () => `DeepChild${num}`,
    ],
  },
  ...props,
})

test('map_values_list_to_target in pass', async () => {
  const app = await setup()
  const steps = makeStepsRunner(app)


  const getA = () => getNesting(app.start_page, 'nest_a')
  const getB = () => getNesting(app.start_page, 'nest_b')

  return steps([
    () => {
      expect(undefined).toBe(pvState(getA(), 'selected'))
      expect(undefined).toBe(pvState(getB(), 'selected'))
    },
    () => {
      updateNesting(app.start_page, 'selected', [getA(), getB()])
    },
    () => {
      expect(true).toBe(pvState(getA(), 'selected'))
      expect(false).toBe(pvState(getB(), 'selected'))
      //
      // t.throws(() => {
      //   updateNesting(app.start_page, 'selected', [getA()])
      // })
    },
  ])

  async function setup() {
    const app = (await init({
      model_name: 'startModel',
      rels: {
        nest_a: ['nest', [createDeepChild('nestA', {
          attrs: {
            selected: ['input'],
          },
        })]],
        nest_b: ['nest', [createDeepChild('nestB', {
          attrs: {
            selected: ['input'],
          },
        })]],
        selected: [
          'input',
          { linking: ['<< nest_a', '<< nest_b'], many: true },
        ],
      },
      actions: {
        'handleRel:selected': action,
      },
    })).app_model

    return app
  }
})
