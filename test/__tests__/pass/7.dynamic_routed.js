import spv from 'spv'
import pvPass from 'pv/pass'
import LoadableList from 'pv/LoadableList'

import init from '../../init'
import makeStepsRunner from '../../steps'

const mdl = props => spv.inh(LoadableList, {}, props)

test('change for dynamic routed resource calculated', async () => {
  const app = await setup()
  const steps = makeStepsRunner(app)

  return steps([
    () => {
      pvPass(app.start_page, 'change', {
        head: {
          name: 'nice_resource',
        },
        attrs: {
          title: 'hey!',
        },
      })
    },
    app => {
      expect('hey!').toEqual(app.start_page.getSPI('nice_resource', { autocreate: false }).state('title'))
      expect('dup some Data').toEqual(app.start_page.getSPI('nice_resource', { autocreate: false }).state('dup_default_title'))
    },
  ])

  async function setup() {
    const SubResource = mdl({
      model_name: 'SubResource',
      attrs: {
        name: ['input'],
        title: ['input'],
        dup_default_title: ['input'],
        default_title: [
          'comp',
          [], () => 'some Data',
        ],
      },
    })

    const StartPage = {
      routes: {
        '[:name]': 'something',
      },
      rels: {
        placeholder: ['nest', ['nice_resource']],
        something: ['model', SubResource, { many: true, uniq: 'name' }],
      },
      actions: {
        change: {
          to: {
            title: ['< title << [:name:head.name]', { autocreate_routed_target: true }],
            copy: ['< dup_default_title << [:name:head.name]', { autocreate_routed_target: true }],
          },
          autocreate_routed_deps: true,
          fn: [
            ['< default_title << [:name:head.name]'],
            (data, default_title) => ({
              title: data.attrs.title,
              copy: `dup ${default_title}`,
            }),
          ],
        },
      },
    }

    const app = (await init({
      ...StartPage,
    })).app_model

    return app
  }
})
