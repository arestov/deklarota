// 2. множественный результат, адресат результатов определен, обычное указание адресата

// a - передача state
// b - передача nestings

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


const test = require('ava')

const requirejs = require('../../../requirejs-config')

const spv = requirejs('spv')
const Model = requirejs('pv/Model')
const pvState = requirejs('pv/getAttr')
const pvPass = requirejs('pv/pass')
const pvUpdate = requirejs('pv/updateAttr')
const getNesting = requirejs('pv/getRel')

const init = require('../../init')

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

test('multiple state by pass calculated', async t => {
  const { app_model: app, steps } = await setup()

  return steps([
    () => {
      pvUpdate(app.start_page, 'skip_this_state', 'untouched')
      pvPass(app.start_page, 'action', 13)
    },
    () => {
      t.is(
        true,
        pvState(app.start_page, 'selected'),
      )
      t.is(
        'untouched',
        pvState(app.start_page, 'skip_this_state'),
      )

      t.is(
        'Michael Jackson',
        pvState(
          getNesting(getNesting(app.start_page, 'target_child'), 'indie'),
          'title',
        ),
      )
    },
    () => {
      pvUpdate(app.start_page, 'customNoopProp', 'untouched')
      pvPass(app.start_page, 'action2', 13)
    },
    () => {
      t.is(
        'untouched',
        pvState(app.start_page, 'customNoopProp'),
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

    return init({
      'chi-start__page': createDeepChild('start', {
        model_name: 'startModel',
        rels: {
          target_child: ['nest', [TargetChild]],
        },
        actions: {
          action,
          action2,
        },
      }),
    }, self => {
      self.start_page = self.initChi('start__page') // eslint-disable-line
    })
  }
})
