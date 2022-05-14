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
      model_name: 'startModel',
      attrs: {
        age_state: ['input'],
        some_prop: ['input'],
        some_prop2: ['input'],
      },
      rels: {
      },
      actions: {
        'handleAttr:some_prop': action1,
        'handleAttr:some_prop2': action2,
      },
    })).app_model

    return app
  }
})
