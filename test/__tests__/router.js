/* eslint no-lone-blocks: 0 */
import { expect, test } from '@jest/globals'

import model from 'pv/model'


import inputAttrs from 'pv/dcl/attrs/input.js'
import RouterCore from '../../js/models/Router.js'

import modernRoot from '../modernRoot'
import testingInit from '../testingInit'


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

  const mainNavigationRouter = inited.rootBwlev.sub_pages['router-main']
  return mainNavigationRouter
}


const MainRouter = model({
  extends: RouterCore,
  attrs: {
    ...inputAttrs({
      url_part: null,
      full_page_need: null,
    }),
  },
})

const RootSession = {
  sub_page: {
    'router-main': {
      constr: MainRouter,
      title: [['nav_title_nothing']],
    },
  },
  attrs: {
    closedAt: ['input'],
    isCommonRoot: ['input', false],
  },
  rels: {
    fake_spyglass: ['nest', ['router-main']],
  },
}


test('should init router', async () => {
  const User = model({
    model_name: 'User',
  })

  const AppRoot = modernRoot({
    BWLev: RootSession,
    rels: {
      user: ['nest', [User]],
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