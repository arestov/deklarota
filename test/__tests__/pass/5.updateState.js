import model from 'pv/model'
import pvState from 'pv/getAttr'
import pvUpdate from 'pv/updateAttr'

import init from '../../init'
import makeStepsRunner from '../../steps'

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

const mdl = props => model(props)
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

test('simple state by pass1 && pass2 calculated', async () => {
  const app = await setup()
  const steps = makeStepsRunner(app)

  return steps([
    () => {
      pvUpdate(app.start_page, 'some_prop', 13)
    },
    () => {
      expect('young').toBe(pvState(app.start_page, 'age_state'))
    },
    () => {
      pvUpdate(app.start_page, 'some_prop2', 45)
    },
    () => {
      expect('old').toBe(pvState(app.start_page, 'age_state'))
    },
  ])

  async function setup() {
    const app = (await init({
      zero_map_level: false,
      'chi-start__page': createDeepChild('start', {
        zero_map_level: true,
        model_name: 'startModel',
        rels: {
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
