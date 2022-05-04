/* eslint no-lone-blocks: 0 */
import { expect, test } from '@jest/globals'

import model from 'pv/model'

import modernRoot from '../modernRoot'
import testingInit from '../testingInit'

test('should init router', async () => {
  const User = model({
    model_name: 'User',
    attrs: {
      computed1b: ['comp', ['< @one:attr1 < $root']],
      computed2b: ['comp', ['< @one:attr2 < $parent']],

    },
  })

  const AppRoot = modernRoot({
    attrs: {
      attr1: ['input', 'SomeValue, 34'],
      attr2: ['input', 'hey! :)'],
    },
    rels: {
      user: ['nest', [User]],
    },
  })

  const inited = await testingInit(AppRoot)
  await inited.computed()
  expect(inited.app_model.readAddr('< @one:computed1b < user')).toBe('SomeValue, 34')
  expect(inited.app_model.readAddr('< @one:computed2b < user')).toBe('hey! :)')
})
