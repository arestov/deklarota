// 4. множественный результат, указание адресата через аргумент

// a - передача state

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


const test = require('ava')

const requirejs = require('../../../requirejs-config')

const spv = requirejs('spv')
const Model = requirejs('pv/Model')
const pvState = requirejs('pv/getAttr')
const getNesting = requirejs('pv/getRel')
const updateNesting = requirejs('pv/updateNesting')

const init = require('../../init')
const makeStepsRunner = require('../../steps')

const mdl = props => spv.inh(Model, {}, props)
const createDeepChild = (num, props) => mdl({
  attrs: {
    desc: [
      'comp',
      [],
      () => `DeepChild${num}`,
    ],
  },
  ...props,
})

test('map_values_list_to_target in pass', async t => {
  const app = await setup()
  const steps = makeStepsRunner(app)


  const getA = () => getNesting(app.start_page, 'nest_a')
  const getB = () => getNesting(app.start_page, 'nest_b')

  return steps([
    () => {
      t.is(
        undefined,
        pvState(getA(), 'selected'),
      )
      t.is(
        undefined,
        pvState(getB(), 'selected'),
      )
    },
    () => {
      updateNesting(app.start_page, 'selected', [getA(), getB()])
    },
    () => {
      t.is(
        true,
        pvState(getA(), 'selected'),
      )
      t.is(
        false,
        pvState(getB(), 'selected'),
      )
      //
      // t.throws(() => {
      //   updateNesting(app.start_page, 'selected', [getA()])
      // })
    },
  ])

  async function setup() {
    const app = (await init({
      'chi-start__page': createDeepChild('start', {
        model_name: 'startModel',
        rels: {
          nest_a: ['nest', [createDeepChild('nestA')]],
          nest_b: ['nest', [createDeepChild('nestB')]],
        },
        actions: {
          'handleRel:selected': action,
        },
      }),
    }, self => {
      self.start_page = self.initChi('start__page') // eslint-disable-line
    })).app_model

    return app
  }
})
