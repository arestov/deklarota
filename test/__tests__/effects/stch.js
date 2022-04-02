/* eslint no-lone-blocks: 0 */
import { expect, test } from '@jest/globals'

import modernRoot from '../../modernRoot'
import testingInit from '../../testingInit'

test('should request rel list', async () => {
  // eslint-disable-next-line fp/no-let
  let value = null

  const AppRoot = modernRoot({
    checkActingRequestsPriority: () => {},
    rels: {
      start_page: ['input', {
        linking: '<<<<',
      }],
    },
    attrs: {
      someattr: ['input', 'randomg75658'],
    },
    'stch-someattr': (self, val) => {
      // eslint-disable-next-line fp/no-mutation
      value = val
    },
  })


  const inited = await testingInit(AppRoot, {
  })
  inited.app_model.updateState('someattr', 'vrrry2929848')

  {
    await inited.computed()
    expect(value).toBe('vrrry2929848')
  }
})
