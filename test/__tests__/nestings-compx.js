import model from 'pv/model'
import pvUpdate from 'pv/updateAttr'
import updateNesting from 'pv/updateNesting'
import getNesting from 'pv/getRel'

import init from 'test/init'
import makeStepsRunner from 'test/steps'

const toIds = md_list => {
  if (!Array.isArray(md_list)) {
    return md_list && md_list._node_id
  }

  return md_list.map(item => item._node_id)
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

test('compx-nests', async () => {
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
      expect(mutated_result).toMatchSnapshot()
    },
  ])

  async function setup() {
    const target_child = mdl({
      model_name: 'target_child',
      rels: {
        indie: ['input', { linking: '<< indie_source << #' }],
        list: ['input', { linking: '<< list_source << #', many: true }],

        calculated_child: [
          'comp',
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
          }, {
            linking: '<< indie',
          },
        ],
      },
    })

    const app = (await init({
      model_name: 'startModel',
      attrs: {
        nickname: ['input'],
        number: ['input'],
      },
      rels: {
        target_child: ['nest', [target_child]],
        list_source: [
          'nest', [[createDeepChild('1.0'), createDeepChild(2)]],
        ],
        indie_source: [
          'nest', [createDeepChild('1.1')],
        ],
      },
    })).app_model

    return app
  }
})
