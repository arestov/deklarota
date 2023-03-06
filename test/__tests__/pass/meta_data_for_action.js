/* eslint no-lone-blocks: 0 */
import { expect, test } from '@jest/globals'
import modernRoot from '../../modernRoot'
import testingInit from '../../testingInit'


test('should pass meta data for action', async () => {
  // eslint-disable-next-line fp/no-let
  let result = null

  const AppRoot = modernRoot({
    attrs: {
      $meta$apis$requests_manager$used: ['input'],
    },
    rels: {
      start_page: ['input', {
        linking: '<<<<',
      }],
    },
    actions: {
      doSomethingWithMeta: {
        to: ['_node_id'],
        fn: [
          ['$noop', '$meta$payload', '$meta$timestamp'],
          (str, noop, input, timestamp) => {
            // eslint-disable-next-line fp/no-mutation
            result = {
              input,
              timestamp,
            }
            return noop
          },
        ],
      },
    },
  })

  const inited = await testingInit(AppRoot)

  {
    inited.app_model.dispatch('doSomethingWithMeta', 'some-data', 1657536179958, {
      more_data: 'hi!',
    })

    await inited.computed()
    expect(result).toStrictEqual({
      input: { more_data: 'hi!' },
      timestamp: 1657536179958,
    })
  }
})
