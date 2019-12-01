
const test = require('ava')

const requirejs = require('../../../requirejs-config')

const spv = requirejs('spv')
const pvPass = requirejs('pv/pass')
const LoadableList = requirejs('pv/LoadableList')

const init = require('../../init')
const makeStepsRunner = require('../../steps')

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
      '+states': {
        default_title: [
          'compx',
          [], () => 'some Data',
        ],
      },
    })

    const StartPage = mdl({
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
      '+nests': {
        placeholder: ['nest', ['nice_resource']],
      },
      '+passes': {
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
    })

    const app = (await init({
      'chi-start__page': StartPage,
    }, self => {
      self.start_page = self.initChi('start__page') // eslint-disable-line
    })).app_model

    return app
  }
})
