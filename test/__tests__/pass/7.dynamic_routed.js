import test from 'ava'


import spv from 'spv'
import pvPass from 'pv/pass'
import LoadableList from 'pv/LoadableList'

import init from '../../init'
import makeStepsRunner from '../../steps'

const mdl = props => spv.inh(LoadableList, {}, props)

test('change for dynamic routed resource calculated', async t => {
  const app = await setup()
  const steps = makeStepsRunner(app)

  return steps([
    () => {
      pvPass(app.start_page, 'change', {
        head: {
          name: 'nice_resource',
        },
        states: {
          title: 'hey!',
        },
      })
    },
    app => {
      t.deepEqual(
        'hey!',
        app.start_page.getSPI('nice_resource').state('title'),
      )
      t.deepEqual(
        'dup some Data',
        app.start_page.getSPI('nice_resource').state('dup_default_title'),
      )
    },
  ])

  async function setup() {
    const SubResource = mdl({
      attrs: {
        default_title: [
          'comp',
          [], () => 'some Data',
        ],
      },
    })

    const StartPage = {
      zero_map_level: true,
      sub_pager: {
        item: [
          SubResource,
          [[]],
          {
            name: 'simple_name',
          },
        ],
      },
      rels: {
        placeholder: ['nest', ['nice_resource']],
      },
      actions: {
        change: {
          to: {
            title: ['< title << [:head.name]'],
            copy: ['< dup_default_title << [:head.name]'],
          },
          fn: [
            ['< default_title << [:head.name]'],
            (data, default_title) => ({
              title: data.states.title,
              copy: `dup ${default_title}`,
            }),
          ],
        },
      },
    }

    const app = (await init({
      ...StartPage,
      // 'chi-start__page': StartPage,
    })).app_model

    return app
  }
})
