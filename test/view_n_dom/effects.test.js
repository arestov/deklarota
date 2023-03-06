import path from 'path'
import { expect, test } from '@jest/globals'
import model from 'dkt/model'
import modernRoot from '../modernRoot'
import testingInit from '../testingInit'
import testingInitView from './testingInitView'
import spv from '../../js/libs/spv'

const takeDefault = ({ default: val }) => val

test('should init', async () => {
  const spec_var = {}
  const api = { updateSpecVar: (key, val) => { spec_var[key] = val } }

  const User = model({
    model_name: 'User',
    attrs: {
      name: ['input', 'George'],
    },
  })

  const AppRoot = modernRoot({
    attrs: {},
    rels: {
      common_session_root: ['input', {
        linking: '<< $session_root',
      }],
      user: ['nest', [User]],
    },
  })

  const inited = await testingInit(AppRoot, {}, { proxies: true, session_root: true })
  const { computed } = inited

  await computed()

  {
    const getRootView = async () => {
      const [AppView, createRootBwlevView, View] = await Promise.all([
        import('./AppView.js').then(takeDefault),
        import('./SessionView.js').then(takeDefault),
        import('dkt/view/View').then(takeDefault),
      ])

      const AppViewChanged = spv.inh(AppView, null, {
        attrs: {
        },
        effects: {
          api: {
            someApi: () => api,
          },
        },
        children_views: {
          user: spv.inh(View, null, {
            attrs: {
              myValue: ['input', 5781],
            },
            effects: {
              api: {
                localApiFromRoot: [
                  ['_node_id'],
                  ['#someApi'],
                  api => api,
                ],
              },
              out: {
                updateVal1: {
                  api: ['localApiFromRoot'],
                  trigger: ['myValue'],
                  require: ['myValue'],
                  create_when: {
                    api_inits: true,
                  },
                  fn: (api, { value }) => {
                    api.updateSpecVar('key1', value)
                  },
                },
              },
            },

          }),
        },
      })
      const RootView = createRootBwlevView(AppViewChanged)
      return RootView
    }


    const { whenViewReady, document } = await testingInitView(inited, {
      getRootView,
      document_path: path.resolve(__dirname, './main.html'),
    })

    await whenViewReady()

    expect(spec_var.key1).toBe(5781)
  }
})
