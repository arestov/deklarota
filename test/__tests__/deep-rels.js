// const test = require('ava')

const requirejs = require('../../requirejs-config')

const spv = requirejs('spv')
const Model = requirejs('pv/Model')
const bhv = requirejs('pv/bhv')
const mergeBhv = requirejs('pv/dcl/merge')
const pvUpdate = requirejs('pv/updateAttr')
const pvState = requirejs('pv/getAttr')
const getNesting = requirejs('pv/getRel')
const updateNesting = requirejs('pv/updateNesting')

const init = require('../init')

const toIds = md_list => {
  if (!Array.isArray(md_list)) {
    return md_list && md_list._provoda_id
  }

  return md_list.map(item => item._provoda_id)
}


const doTest = async t => {
  const modelForLevel = (levelName, model) => ({
    rels: {
      [levelName]: ['model', model],
    },
    actions: {
      add: {
        to: [`<< ${levelName}`, { method: 'at_end' }],
      },
    },
  })

  const deepLevel3 = bhv({})
  const deepLevel2 = bhv(modelForLevel('level3', deepLevel3))
  const deepLevel1 = bhv(modelForLevel('level2', deepLevel2))


  const base1 = bhv({})
  const base2 = bhv({})


  const App = mergeBhv(
    modelForLevel('level1', deepLevel1),
    {
      attrs: {
        level3ArrayNotEmpty: [
          'compx',
          ['<< @all:level1.level2.level3 <<'], list => list ? Boolean(list.length) : null,
        ],
      },
      rels: {
        base1: ['nest', [base1]],
        base2: ['nest', [base2]],
      },
      actions: {
        /* no nice attr */
        stage1CreateLevel1v1: {
          to: ['<< level1', { method: 'at_end' }],
          fn: () => ({
            states: {
              title: 'level1Gold',
            },
          }),
        },

        /* no nice attr */
        stage1CreateLevel2v1: {
          to: ['<< level1.level2', { method: 'at_end' }],
          fn: () => ({
            states: {
              title: 'level2Silver',
            },
          }),
        },

        /* should have nice attr after */
        stage1CreateLevel3v1: {
          to: ['<< level1.level2.level3', { method: 'at_end' }],
          fn: () => ({
            states: {
              title: 'level3Bronze',
            },
          }),
        },


        stage2MoveLevel2: {
          to: {
            temp: ['<< temp', { method: 'set_many' }],
            level2: ['<< level1.level2', { method: 'set_many' }],
          },
          fn: [
            ['<< @all:level1.level2'],
            (_, list) => ({
              temp: list,
              level2: null,
            }),
          ],
        },
      },
    },
  )


  const { app_model: app, steps } = await init(App)

  // 1 записываем полный список
  // обновляем середину
  // обновлеем конец
  // обновляем начало

  // проверяем атрибут

  // меняем середину (с имеющимся концом)
  // проверяем атрибут

  // меняем конец
  // проверяем атрибут


  await steps([
    () => {
      app.dispatch('stage1CreateLevel1v1')
      app.dispatch('stage1CreateLevel2v1')
      app.dispatch('stage1CreateLevel3v1')
    },
    () => {
      console.log("pvState(app, 'level3ArrayNotEmpty')", pvState(app, 'level3ArrayNotEmpty'))
      // t.is(true, pvState(app, 'level3ArrayNotEmpty'))
    },
    () => {
      app.dispatch('stage2MoveLevel2')
    },
    () => {
      console.log("pvState(app, 'level3ArrayNotEmpty')", pvState(app, 'level3ArrayNotEmpty'))
      // t.is(false, pvState(app, 'level3ArrayNotEmpty'))
    },

    () => {
      process.exit()
    },
  ])


  // создаем одноименную структуру - 2
  // меняем структуру 2
  // зависимости от 1 не должны измиться
}

doTest().catch(console.error)

// test('attr based on deep list', doTest)
