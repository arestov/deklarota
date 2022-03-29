/* eslint no-lone-blocks: 0 */
import { expect, test } from '@jest/globals'

import model from 'pv/model'


import modernRoot from '../modernRoot'
import testingInit from '../testingInit'

beforeEach(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {})
})


test('should keep uniq items of rel', async () => {
  const sampleList = [
    { id: 'a1', name: 'john' },
    { id: 'b2', name: 'ivan' },
    { id: 'a1', name: 'jack' },
  ]

  const sampleList2 = [
    { id: 'c3', name: 'nick' },
    { id: 'd4', name: 'sam' },
    { id: 'c3', name: 'tom' },
  ]


  const User = model({
    model_name: 'User',
    attrs: {
      id: ['input'],
      name: ['input'],
    },
  })

  const AppRoot = modernRoot({
    checkActingRequestsPriority: () => {},
    rels: {
      users: ['model', User, { many: true, uniq: ['id'] }],
      start_page: ['input', {
        linking: '<<<<',
      }],
    },
    actions: {
      addUsers: {
        to: ['<< users', { method: 'at_end', can_create: true }],
      },
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

  expect(
    inited.app_model.readAddr('<< @all:users').map(item => ({
      id: item.getAttr('id'),
      name: item.getAttr('name'),
    })),
  ).toMatchSnapshot()

  inited.app_model.dispatch('addUsers', sampleList2.map(attrs => ({ attrs })))

  {
    await inited.computed()
    expect(
      inited.app_model.readAddr('<< @all:users').map(item => ({
        id: item.getAttr('id'),
        name: item.getAttr('name'),
      })),
    ).toMatchSnapshot()
  }

  {
    const list = inited.app_model.readAddr('<< @all:users')
    const md = list[0]
    {
      md.updateAttr('id', 'j7')
      await inited.computed()

      expect(md.getAttr('id')).toBe('j7')
    }

    {
      md.updateAttr('id', 'c3')
      expect(inited.computed()).rejects.toMatchSnapshot()
    }
  }
})
