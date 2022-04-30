/* eslint no-lone-blocks: 0 */
import { expect, test } from '@jest/globals'

import model from 'pv/model'

import modernRoot from '../modernRoot'
import testingInit from '../testingInit'

test('should not init idle rel until its ok to init', async () => {
  const AppRoot = modernRoot({
    attrs: {
      wantUser2: ['input'],
    },
    rels: {
      user1: ['nest', [model({ model_name: 'User1' })]],
      user2: ['nest', [model({ model_name: 'User2' }), {
        idle_until: 'wantUser2',
      }]],
    },
    checkActingRequestsPriority: () => {},
  })

  const inited = await testingInit(AppRoot)

  {
    expect(inited.app_model.readAddr('< @one:_provoda_id < user1')).toBeTruthy()
    expect(inited.app_model.readAddr('< @one:_provoda_id < user2')).toBeUndefined()
  }

  {
    inited.app_model.updateAttr('wantUser2', true)
    await inited.computed()

    expect(inited.app_model.readAddr('< @one:_provoda_id < user1')).toBeTruthy()
    expect(inited.app_model.readAddr('< @one:_provoda_id < user2')).toBeTruthy()
  }
})
