/*
  1.1 один результат, адресат результата определен "*" способом указания, обычное указание адресата
  to: '*'

  a - передача state
  b - передача nestings
  return { 589592873598724: { nestings: {}, attrs: {} } }

  setup:
    model + nested_model
    model knows nested_model _provoda_id
    pass action to model
    update nested_model state by _provoda_id
*/

import model from 'pv/model'
import pvUpdate from 'pv/updateAttr'
import pvState from 'pv/getAttr'
import pvPass from 'pv/pass'
import getNesting from 'pv/getRel'

import init from '../../init'
import makeStepsRunner from '../../steps'

const action = {
  to: ['*'],
  fn: [
    ['my_friend_id'],
    (data, my_friend_id) => ({
      [my_friend_id]: { attrs: { balance: data.value } },
    }),
  ],
}

test('simple pass by * calculated', async () => {
  const TargetChild = model({ model_name: 'TargetChild' })

  const app = (await init({
    model_name: 'startModel',
    rels: {
      my_friend: ['nest', [TargetChild]],
    },
    actions: {
      action1: action,
    },
  })).app_model

  const steps = makeStepsRunner(app)

  return steps([
    () => {
      // save my_friend_id
      pvUpdate(
        app.start_page,
        'my_friend_id',
        pvState(getNesting(app.start_page, 'my_friend'), '_provoda_id'),
      )
    },
    () => {
      // pass action
      pvPass(app.start_page, 'action1', { value: 13 })
    },
    () => {
      // read my_friend state
      expect(13).toBe(pvState(getNesting(app.start_page, 'my_friend'), 'balance'))
    },
  ])
})
