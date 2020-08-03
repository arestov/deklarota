const test = require('ava')
const requirejs = require('../../requirejs-config')

const spv = requirejs('spv')
const Model = requirejs('pv/Model')
const pvUpdate = requirejs('pv/updateAttr')
const updateNesting = requirejs('pv/updateNesting')
const getNesting = requirejs('pv/getRel')

const init = require('../init')
const makeStepsRunner = require('../steps')

const toIds = md_list => {
  if (!Array.isArray(md_list)) {
    return md_list && md_list._provoda_id
  }

  return md_list.map(item => item._provoda_id)
}

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

test('compx-nests', async t => {
  let mutated_result = null // eslint-disable-line

  const app = await setup()
  const steps = makeStepsRunner(app)

  return steps([
    () => {
      pvUpdate(app, 'number', 629)
      pvUpdate(app.start_page, 'nickname', 'nikolay')
      const target_child = getNesting(app.start_page, 'target_child')
      updateNesting(target_child, 'indie', getNesting(app.start_page, 'indie_source'))
      updateNesting(target_child, 'list', getNesting(app.start_page, 'list_source'))
    },
    () => {
      t.snapshot(mutated_result)
    },
  ])

  async function setup() {
    const target_child = mdl({
      rels: {
        calculated_child: [
          'compx',
          [
            'number <<< #', 'nickname <<< ^',
            '<< @one:indie', '<< @all:indie', '< @all:desc < indie',
            '<< @all:list', '<< @one:list', '< @one:desc < list',
          ],
          (num, nickname,
            one_indie, all_indie, all_desc_indie,
            all_list, one_list, one_desc_list) => {
            mutated_result = { // eslint-disable-line
              num,
              nickname,
              one_indie: toIds(one_indie),
              all_indie: toIds(all_indie),
              all_desc_indie,
              all_list: toIds(all_list),
              one_list: toIds(one_list),
              one_desc_list,
            }

            return null
          },
        ],
      },
    })

    const app = (await init({
      'chi-start__page': createDeepChild('start', {
        model_name: 'startModel',
        rels: {
          target_child: ['nest', [target_child]],
          list_source: [
            'nest', [[createDeepChild(1), createDeepChild(2)]],
          ],
          indie_source: [
            'nest', [createDeepChild(1)],
          ],
        },
      }),
    }, self => {
      self.start_page = self.initChi('start__page') // eslint-disable-line
    })).app_model

    return app
  }
})
