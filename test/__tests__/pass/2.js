// 2. множественный результат, адресат результатов определен, обычное указание адресата

// a - передача state
// b - передача nestings

import model from 'pv/model'
import pvState from 'pv/getAttr'
import pvPass from 'pv/pass'
import pvUpdate from 'pv/updateAttr'
import getNesting from 'pv/getRel'

import init from '../../init'

const action = {
  to: {
    way1: [
      'selected',
    ],
    way2: [
      '< title < target_child.indie',
    ],
    way3: [
      'skip_this_state',
    ],
  },
  fn() {
    return {
      way1: true, // Исполнитель должен проверить hasOwnProperty()
      way2: 'Michael Jackson',
      // way3 - 3. множественный результат - ответ пропускается

    }
  },
}

const action2 = {
  to: ['< customNoopProp'],
  fn: [
    ['$noop'],
    (data, noop) => noop,
  ],
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

test('multiple state by pass calculated', async () => {
  const { app_model: app, steps } = await setup()

  return steps([
    () => {
      pvUpdate(app.start_page, 'skip_this_state', 'untouched')
      pvPass(app.start_page, 'action', 13)
    },
    () => {
      expect(true).toBe(pvState(app.start_page, 'selected'))
      expect('untouched').toBe(pvState(app.start_page, 'skip_this_state'))

      expect('Michael Jackson').toBe(pvState(
        getNesting(getNesting(app.start_page, 'target_child'), 'indie'),
        'title',
      ))
    },
    () => {
      pvUpdate(app.start_page, 'customNoopProp', 'untouched')
      pvPass(app.start_page, 'action2', 13)
    },
    () => {
      expect('untouched').toBe(pvState(app.start_page, 'customNoopProp'))
    },
  ])

  async function setup() {
    const TargetChild = mdl({
      model_name: 'TargetChild',
      rels: {
        indie: [
          'nest', [createDeepChild('indie', {
            attrs: {
              title: ['input'],
            },
          })],
        ],
        list: [
          'nest', [[createDeepChild(1), createDeepChild(2)]],
        ],
        calculated_child: [
          'comp',
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
          { linking: ['<< indie', '<< list'], many: true },
        ],
      },
    })

    return init({
      model_name: 'startModel',
      attrs: {
        customNoopProp: ['input'],
        selected: ['input'],
        skip_this_state: ['input'],
      },
      rels: {
        target_child: ['nest', [TargetChild]],
      },
      actions: {
        action,
        action2,
      },
    })
  }
})
