/* eslint-disable fp/no-let */
/* eslint-disable fp/no-mutation */
/* eslint no-lone-blocks: 0 */
import { expect, test } from '@jest/globals'

import model from 'pv/model'

import modernRoot from '../../modernRoot'
import testingInit from '../../testingInit'

const wait = ms => new Promise(resolve => setTimeout(resolve, ms))

test('should use api from root & parent', async () => {
  const User = model({
    model_name: 'User',
    attrs: {
      attr1: ['input'],
    },
    actions: {
      action1: {
        to: ['attr1'],
      },
      action2: {
        to: ['prop2'],
      },
    },
    effects: {
      api: {
        localApiFromRoot: [
          ['_node_id'],
          ['#someApi'],
          api => api,
        ],
        // localApiFromParent: [
        //   ['_node_id'],
        //   ['#someApi'],
        //   api => api,
        // ],
      },
      in: {
        action1: {
          type: 'subscribe',
          api: ['localApiFromRoot'],
          fn: (dispatch, api) => {
            api.onChange1(dispatch)

            return () => {}
          },
        },

        // action2: {
        //   type: 'subscribe',
        //   api: ['localApiFromParent'],
        //   fn: (dispatch, api) => {
        //     api.onChange1(dispatch)

        //     return () => {}
        //   },
        // },
      },
    },


  })

  const AppRoot = modernRoot({
    attrs: {
      $meta$apis$someApi$used: ['input'],
    },
    rels: {
      user: ['nest', [User]],
    },
  })

  const inited = await testingInit(AppRoot)
  const { computed } = inited

  const value1 = 'value1-ljfalsjdf88'

  const api = {
    onChange1: fn => {
      setTimeout(() => {
        fn(value1)
      }, 0)
    },
  }
  inited.app_model.useInterface('someApi', api)

  await computed()
  expect(inited.app_model.readAddr('< @one:attr1 < user')).toBe(undefined)

  {
    await wait(500)
    await computed()

    expect(inited.app_model.readAddr('< @one:attr1 < user')).toBe(value1)
  }
})
