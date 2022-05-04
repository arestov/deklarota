/* eslint no-lone-blocks: 0 */
import { expect, test } from '@jest/globals'

import model from 'pv/model'


import modernRoot from '../../modernRoot'
import testingInit from '../../testingInit'


test('should request rel list', async () => {
  const sampleList = ['john', 'ivan'].map(name => ({ name }))

  const User = model({
    model_name: 'User',
    attrs: {
      name: ['input'],
    },
  })

  const AppRoot = modernRoot({
    rels: {
      users: ['model', User, { many: true }],
      start_page: ['input', {
        linking: '<<<<',
      }],
    },
    effects: {
      in: {
        users: {
          type: 'nest_request',
          parse: [response => response],
          api: 'fakeapi',
          fn: [[], api => api.fetchFakeData()],
        },
      },
      out: {
        requestUsers: {
          api: ['self', 'fakeapi'],
          create_when: {
            api_inits: true,
          },
          trigger: ['_provoda_id'],
          fn: self => {
            self.requestMoreData('users')
          },
        },
      },
    },
  })

  const fakeapi = {
    fetchFakeData: async () => (sampleList),
    source_name: 'fake',
    errors_fields: [],
  }

  const inited = await testingInit(AppRoot, {
    fakeapi,
  })


  {
    await inited.computed()
    expect(inited.app_model.readAddr('< @all:name < users')).toStrictEqual(['john', 'ivan'])
  }
})
