/* eslint no-lone-blocks: 0 */
import { expect, test } from '@jest/globals'

import model from 'pv/model'


import inputAttrs from 'pv/dcl/attrs/input.js'
import RouterCore from '../../js/models/Router.js'

import modernRoot from '../modernRoot'
import testingInit from '../testingInit'
import requireRouter from '../../js/libs/provoda/bwlev/requireRouter'


const getMainNavigationRouter = async inited => {
  const { computed } = inited

  inited.rootBwlev.input(() => {
    inited.rootBwlev.rpc_legacy.requestSpyglass.call(inited.rootBwlev, {
      key: 'router__main---2',
      bwlev: false,
      context_md: false,
      name: 'main',
    })
  })
  await computed()

  const mainNavigationRouter = requireRouter(inited.rootBwlev, 'main')
  return mainNavigationRouter
}


const MainRouter = model({
  extends: RouterCore,
  model_name: 'MainRouter',
  attrs: {
    ...inputAttrs({
      url_part: null,
      full_page_need: null,
    }),
  },
})

const RootSession = {
  attrs: {
    closedAt: ['input'],
    isCommonRoot: ['input', false],
  },
  rels: {
    'router-main': ['nest', [MainRouter]],
  },
}


test('should init router', async () => {
  const User = model({
    model_name: 'User',
    rels: {
      nav_parent_at_perspectivator_MainRouter: ['input', { linking: '<<<< ^' }],
    },
    actions: {
      handleInit: {
        to: ['<< nav_parent_at_perspectivator_MainRouter', { method: 'set_one' }],
        fn: [
          ['<<<< ^'],
          (_, parent) => parent,
        ],
      },
    },
  })

  const AppRoot = modernRoot({
    BWLev: RootSession,
    rels: {
      user: ['nest', [User]],
      start_page: ['input', {
        linking: '<<<<',
      }],
      nav_parent_at_perspectivator_MainRouter: ['comp', ['<<<<'], { linking: '<<<<' }],
    },
    checkActingRequestsPriority: () => {},
  })

  const inited = await testingInit(AppRoot)

  const mainNavigationRouter = await getMainNavigationRouter(inited)

  {
    expect(mainNavigationRouter).toBeTruthy()
    expect(mainNavigationRouter.readAddr('<< @one:current_mp_md')).toBe(inited.app_model)
  }

  {
    const another_md = inited.app_model.readAddr('<< @one:user')
    mainNavigationRouter.RPCLegacy('navigateToResource', another_md._provoda_id)

    await inited.computed()

    expect(mainNavigationRouter.readAddr('<< @one:current_mp_md')).toBe(another_md)
  }

  {
    const another_md = inited.app_model
    mainNavigationRouter.RPCLegacy('navigateToResource', another_md._provoda_id)

    await inited.computed()

    expect(mainNavigationRouter.readAddr('<< @one:current_mp_md')).toBe(another_md)
  }

  {
    const another_md = inited.app_model.readAddr('<< @one:user')
    inited.rootBwlev.RPCLegacy('navigateRouterToResource', another_md._provoda_id, 'router-main')

    await inited.computed()

    expect(mainNavigationRouter.readAddr('<< @one:current_mp_md')).toBe(another_md)
  }
})
