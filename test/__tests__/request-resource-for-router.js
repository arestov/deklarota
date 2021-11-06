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


test('should execute nested requestRel & reveal resource in router', async () => {
  const Billing = model({
    model_name: 'Billing',
  })

  const Onboarding = model({
    model_name: 'Onboarding',
  })

  const User = model({
    model_name: 'User',
    rels: {
      billing: ['model', Billing],
      onboarding: ['model', Onboarding],
    },
    actions: {
      'requestRel:billing': {
        to: ['<< billing', { method: 'set_one' }],
        fn: () => ({}),
      },
      'requestRel:onboarding': {
        to: {
          onboarding: ['<< onboarding', { method: 'set_one' }],
        },
        fn: () => ({}),
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
    mainNavigationRouter.RPCLegacy('dispatch', 'expectRelBeRevealedByRelPath', 'user.billing')


    await inited.computed()

    expect(mainNavigationRouter.readAddr('<< @all:wanted_bwlev_chain.pioneer').map(item => item.model_name)).toMatchSnapshot()
    expect(mainNavigationRouter.readAddr('<< @one:current_mp_md').model_name).toMatchSnapshot()

    expect(mainNavigationRouter.readAddr('current_expected_rel')).toMatchSnapshot()
    expect(
      inited.app_model._highway.live_heavy_rel_query_by_rel_name,
    ).toMatchSnapshot()
  }

  {
    // reset
    mainNavigationRouter.RPCLegacy('navigateToResource', inited.app_model._provoda_id)
    await inited.computed()
  }

  {
    mainNavigationRouter.RPCLegacy('dispatch', 'expectRelBeRevealedByRelPath', 'user.onboarding')
    await inited.computed()

    expect(mainNavigationRouter.readAddr('current_expected_rel')).toMatchSnapshot({
      expected_at: expect.any(Number),
      current_mp_md_id: 1,
      rel_path: 'user.onboarding',
    })

    // reset
    mainNavigationRouter.RPCLegacy('navigateToResource', inited.app_model._provoda_id)
    await inited.computed()
    expect(mainNavigationRouter.readAddr('current_expected_rel')).toMatchSnapshot()
    expect(
      inited.app_model._highway.live_heavy_rel_query_by_rel_name,
    ).toMatchSnapshot()
  }

  {
    /*
    2. check fail when missing requestRel

    //  await expect(failingAsyncTest())
    // .rejects
    // .toThrow('I should fail');
    */
  }
  //
})
