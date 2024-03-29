import bhv from 'pv/bhv'
import mergeBhv from 'pv/dcl/merge'
import pvState from 'pv/getAttr'
import init from 'test/init'

test('attr based on deep list', async () => {
  const modelForLevel = (levelName, model, { many, attrs } = {}) => ({
    attrs: attrs ?? {
      title: ['input'],
    },
    rels: {
      [levelName]: ['model', model, { many }],
    },
    actions: {
      add: {
        to: [`<< ${levelName}`, { method: 'at_end' }],
      },
    },
  })

  const deepLevel3 = bhv({ model_name: 'deepLevel3', attrs: { title: ['input'] } })
  const deepLevel2 = bhv({ ...modelForLevel('level3', deepLevel3, { many: true }), model_name: 'deepLevel2' })
  const deepLevel1 = bhv({ ...modelForLevel('level2', deepLevel2, { many: true }), model_name: 'deepLevel1' })


  const base1 = bhv({ model_name: 'base1' })
  const base2 = bhv({ model_name: 'base2' })


  const App = mergeBhv(
    modelForLevel('level1', deepLevel1, { many: true, attrs: {} }),
    {
      attrs: {
        title: ['input'],
        level3ArrayNotEmpty: [
          'comp',
          ['<< @all:level1.level2.level3 <<'], list => list ? Boolean(list.length) : null,
        ],
      },
      rels: {
        base1: ['nest', [base1]],
        base2: ['nest', [base2]],
        temp: ['input', { linking: '<< level1.level2', many: true }],
      },
      actions: {
        /* no nice attr */
        stage1CreateLevel1v1: {
          to: ['<< level1', { method: 'at_end', can_create: true }],
          fn: () => ({
            attrs: {
              title: 'level1Gold',
            },
          }),
        },

        /* no nice attr */
        stage1CreateLevel2v1: {
          to: ['<< level1.level2', { method: 'at_end', can_create: true }],
          fn: () => ({
            attrs: {
              title: 'level2Silver',
            },
          }),
        },

        /* should have nice attr after */
        stage1CreateLevel3v1: {
          to: ['<< level1.level2.level3', { method: 'at_end', can_create: true }],
          fn: () => ({
            attrs: {
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
      expect(true).toBe(pvState(app, 'level3ArrayNotEmpty'))
    },
    () => {
      app.dispatch('stage2MoveLevel2')
    },
    () => {
      expect(false).toBe(pvState(app, 'level3ArrayNotEmpty'))
    },
  ])

  // создаем одноименную структуру - 2
  // меняем структуру 2
  // зависимости от 1 не должны измиться
})
