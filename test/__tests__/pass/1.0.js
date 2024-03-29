// -> pass("post", {})
//   changed songs-list
// -> pass("state-changed:state-name", 55)
//   changed state in parent
//
// -> pass("state-changed:state-name", 55)
//   changed state in nesting


/* EXEC

Написать примеры для каждого пунка
1) шаги
2) ожидаемый безульат
без обвязки

1. один результат, адресат результата определен, обычное указание адресата
1.1 один результат, адресат результата определен "*" способом указания, обычное указание адресата
2. множественный результат, адресат результатов определен, обычное указание адресата
3. множественный результат - ответ пропускается
4. множественный результат, указание адресата через аргумент
5. один результат, адресат результата nesting определен любым способом типа записи nesting, обычное
  указание адресата

*/

import pvState from 'pv/getAttr'
import pvPass from 'pv/pass'

import init from '../../init'
import makeStepsRunner from '../../steps'

const action1 = {
  to: ['age_state'],
  fn: [
    [],
    age => {
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
    age => {
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
      pvPass(app.start_page, 'action1', 13)
    },
    () => {
      expect('young').toBe(pvState(app.start_page, 'age_state'))
    },
    () => {
      pvPass(app.start_page, 'action2', 45)
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
      },
      rels: {
      },
      actions: {
        action1,
        action2,
      },
    })).app_model

    return app
  }
})
