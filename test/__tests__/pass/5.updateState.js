const action1 = {
  to: ['age_state'],
  fn: [
    [],
    ({ next_value: age }) => {
      if (age < 18) {
        return 'young'
      }

      return null
    },
  ],
}

const action2 = {
  to: ['age_state'],
  fn: [
    [],
    ({ next_value: age }) => {
      if (age >= 40) {
        return 'old'
      }

      return null
    },
  ],
}

const test = require('ava')

const requirejs = require('../../../requirejs-config')

const spv = requirejs('spv')
const Model = requirejs('pv/Model')
const pvState = requirejs('pv/getAttr')
const pvUpdate = requirejs('pv/updateAttr')

const init = require('../../init')
const makeStepsRunner = require('../../steps')

const mdl = props => spv.inh(Model, {}, props)
const createDeepChild = (num, props) => mdl({
  attrs: {
    desc: [
      'compx',
      [],
      () => `DeepChild${num}`,
    ],
  },
  ...props,
})

test('simple state by pass1 && pass2 calculated', async t => {
  const app = await setup()
  const steps = makeStepsRunner(app)

  return steps([
    () => {
      pvUpdate(app.start_page, 'some_prop', 13)
    },
    () => {
      t.is(
        'young',
        pvState(app.start_page, 'age_state'),
      )
    },
    () => {
      pvUpdate(app.start_page, 'some_prop2', 45)
    },
    () => {
      t.is(
        'old',
        pvState(app.start_page, 'age_state'),
      )
    },
  ])

  async function setup() {
    const TargetChild = mdl({
      rels: {
        indie: [
          'nest', [createDeepChild('indie')],
        ],
        list: [
          'nest', [[createDeepChild(1), createDeepChild(2)]],
        ],
        calculated_child: [
          'compx',
          ['number <<< #', 'nickname <<< ^', '<< @all:indie', '<< @all:list'],
          (num, nickname, indie_value, list) => {
            if (num === 100) {
              return list.slice(0, 1)
            }

            if (nickname === 'smith') {
              return indie_value
            }

            return list
          },
        ],
      },
    })

    const app = (await init({
      'chi-start__page': createDeepChild('start', {
        model_name: 'startModel',
        rels: {
          target_child: ['nest', [TargetChild]],
        },
        actions: {
          'handleAttr:some_prop': action1,
          'handleAttr:some_prop2': action2,
        },
      }),
    }, self => {
      self.start_page = self.initChi('start__page') // eslint-disable-line
    })).app_model

    return app
  }
})
