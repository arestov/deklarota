/* eslint-disable fp/no-let */
/* eslint-disable fp/no-mutation */
/* eslint no-lone-blocks: 0 */
import { expect, test } from '@jest/globals'

import model from 'pv/model'

import modernRoot from '../../modernRoot'
import testingInit from '../../testingInit'


test('should use api from root & parent', async () => {
  const User = model({
    model_name: 'User',
    effects: {
      api: {
        localApiFromRoot: [
          ['_node_id'],
          ['#someApi'],
          api => api,
        ],
        localApiFromParent: [
          ['_node_id'],
          ['#someApi'],
          api => api,
        ],
      },
      out: {
        updateVal1: {
          api: ['localApiFromRoot'],
          trigger: ['< rootMarker1 <<< #'],
          require: ['< rootMarker1 <<< #'],
          create_when: {
            api_inits: true,
          },
          fn: (api, { value }) => {
            api.updateSpecVar('key1', value)
          },
        },
        updateVal2: {
          api: ['localApiFromParent'],
          trigger: ['< rootMarker2 <<< ^'],
          require: ['< rootMarker2 <<< ^'],
          create_when: {
            api_inits: true,
          },
          fn: (api, { value }) => {
            api.updateSpecVar('key2', value)
          },
        },
      },
    },


  })

  const AppRoot = modernRoot({
    attrs: {
      rootMarker1: ['input'],
      rootMarker2: ['input'],
      $meta$apis$someApi$used: ['input'],
    },
    rels: {
      user: ['nest', [User]],
    },
    effects: {
      out: {
        customOutTask: {
          api: ['someApi'],
          trigger: [],
          create_when: {
            api_inits: false,
          },
          fn: (api, { payload }) => {
            api.updateSpecVar('key3', payload)
          },
        },
      },
    },
  })

  const inited = await testingInit(AppRoot)
  const { computed } = inited


  const spec_var = {}

  const api = { updateSpecVar: (key, val) => { spec_var[key] = val } }
  inited.app_model.useInterface('someApi', api)

  await computed()

  {
    inited.app_model.updateAttr('rootMarker1', 'MyValue!')
    await computed()
    expect(spec_var.key1).toBe('MyValue!')
  }

  {
    inited.app_model.updateAttr('rootMarker2', 'Another:')
    await computed()
    expect(spec_var.key2).toBe('Another:')
  }

  {
    inited.app_model.dispatch('createOutputTask', ['customOutTask', 'valueForCustomTask'])
    await computed()
    expect(spec_var.key3).toBe('valueForCustomTask')
  }
})
