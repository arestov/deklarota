import spv from 'spv'
import Model from 'pv/Model'
import pvUpdate from 'pv/updateAttr'
import pvState from 'pv/getAttr'
import getNesting from 'pv/getRel'
import updateNesting from 'pv/updateNesting'

import init from 'test/init'

const toIds = md_list => {
  if (!Array.isArray(md_list)) {
    return md_list && md_list._provoda_id
  }

  return md_list.map(item => item._provoda_id)
}

test('nestings updated', async () => {
  const Appartment = spv.inh(Model, {}, {
    attrs: {
      number: [
        'comp',
        [],
        () => 49588,
      ],
    },
  })

  const { app_model: person, steps } = await init({
    rels: {
      appartment: ['nest', [Appartment]],
    },
  })


  await steps([
    () => {
      expect(undefined).toBe(getNesting(person, 'garage'))
      expect(undefined).toBe(pvState(getNesting(person, 'appartment'), 'nothing'))
      expect(49588).toBe(pvState(getNesting(person, 'appartment'), 'number'))
    },
  ])
})

test('compx with nestings calculated', async () => {
  const Brother = spv.inh(Model, {}, {})

  const { app_model: person, steps } = await init({
    rels: {
      brother: ['nest', [Brother]],
    },
    attrs: {
      richest: [
        'comp',
        ['@one:money:brother', 'money'],
        (broher_money, my_money) => broher_money < my_money,
      ],
    },
  })


  await steps([
    () => {
      pvUpdate(getNesting(person, 'brother'), 'money', 15)
      pvUpdate(person, 'money', 12)
    },
    () => {
      expect(false).toBe(pvState(person, 'richest'))

      pvUpdate(person, 'money', 20)
    },
    () => {
      expect(true).toBe(pvState(person, 'richest'))
    },
  ])
})

test('state compx calculated from parent and root states', async () => {
  const DeepestChild = spv.inh(Model, {}, {
    attrs: {
      description_name: [
        'comp',
        ['#family_name', '^name', 'name'],
        (family_name, parent_name, name) => `${name} ${family_name}, son of ${parent_name}`,
      ],
    },
  })
  const DeepChild = spv.inh(Model, {}, {
    rels: {
      child: ['nest', [DeepestChild]],
    },
  })
  const Child = spv.inh(Model, {}, {
    rels: {
      child: ['nest', [DeepChild]],
    },
  })
  const { app_model: app, steps } = (await init({
    rels: {
      child: ['nest', [Child]],
    },
  }))

  await steps([
    () => {
      const {
        deep_child,
        deepest_child,
      } = getModels(app)

      pvUpdate(app, 'family_name', 'Smith')
      pvUpdate(deep_child, 'name', 'John')
      pvUpdate(deepest_child, 'name', 'Mike')
    },
    () => {
      const { deepest_child } = getModels(app)
      expect('Mike Smith, son of John').toBe(pvState(deepest_child, 'description_name'))
    },
  ])


  function getModels(app) {
    const child = getNesting(app, 'child')
    const deep_child = getNesting(child, 'child')
    const deepest_child = getNesting(deep_child, 'child')

    return {
      child,
      deep_child,
      deepest_child,
    }
  }
})


test('nest compx calculated', async () => {
  const createDeepChild = (num, props) => {
    const DeepChild = spv.inh(Model, {}, {
      attrs: {
        desc: [
          'comp',
          [],
          () => `DeepChild${num}`,
        ],
      },
      ...props,
    })
    return DeepChild
  }

  const indie = createDeepChild('indie')

  const TargetChild = spv.inh(Model, {}, {
    rels: {
      indie: ['nest', [indie]],
      list: [
        'nest', [[createDeepChild(1), createDeepChild(2)]],
      ],
      calculated_child: [
        'comp',
        ['number <<< #', 'nickname <<< ^', '<< @all:indie', '<< @all:list'],
        (num, nickname, indie_value, list) => {
          if (num === 100) {
            return list && list.slice(0, 1)
          }

          if (nickname === 'smith') {
            return indie_value
          }

          return list
        },
      ],
    },
  })

  const startModel = createDeepChild('start', {
    model_name: 'startModel',
    rels: {
      target_child: ['nest', [TargetChild]],
    },
  })


  const { app_model: app, steps } = (await init({
    'chi-start__page': startModel,
  }, self => {
    self.start_page = self.initChi('start__page') // eslint-disable-line
  }))


  const targetChild = () => (
    getNesting(app.start_page, 'target_child')
  )

  await steps([
    () => {
      const target_child = targetChild()

      const expected = getNesting(target_child, 'list')
      const calculated = getNesting(target_child, 'calculated_child')

      expect(toIds(expected)).toEqual(toIds(calculated))
    },
    () => pvUpdate(app.start_page, 'nickname', 'smith'),
    () => {
      const target_child = targetChild()

      const expected = [getNesting(target_child, 'indie')]
      const calculated = getNesting(target_child, 'calculated_child')

      expect(toIds(expected)).toEqual(toIds(calculated))
    },
    () => pvUpdate(app, 'number', 100),
    () => {
      const target_child = targetChild()

      const expected = getNesting(target_child, 'list').slice(0, 1)
      const calculated = getNesting(target_child, 'calculated_child')
      const notExpected = [getNesting(target_child, 'indie')]

      expect(toIds(expected)).toEqual(toIds(calculated))

      expect(toIds(notExpected)).not.toEqual(toIds(calculated))
    },
    () => {
      const target_child = targetChild()
      const change = getNesting(target_child, 'list')[1]

      updateNesting(target_child, 'indie', change)
      pvUpdate(app, 'number', null)
    },
    () => {
      const target_child = targetChild()

      const expected = [getNesting(target_child, 'list')[1]]
      const calculated = getNesting(target_child, 'calculated_child')

      expect(toIds(expected)).toEqual(toIds(calculated))
    },
  ])
})
