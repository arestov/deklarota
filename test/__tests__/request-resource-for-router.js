/* eslint no-lone-blocks: 0 */
import { expect, test } from '@jest/globals'

import model from 'pv/model'


import inputAttrs from 'pv/dcl/attrs/input.js'
import RouterCore from '../../js/models/Router.js'

import modernRoot from '../modernRoot'
import testingInit, { testingReinit } from '../testingInit'
import requireRouter from '../../js/libs/provoda/bwlev/requireRouter.js'
import SessionRoot from '../../js/libs/provoda/bwlev/SessionRoot.js'
import { toReinitableData } from '../../js/libs/provoda/provoda/runtime/app/reinit'

const getMainNavigationRouter = async inited => {
  const { computed } = inited

  const session = inited.app_model.getNesting('common_session_root')

  session.input(() => {
    session.rpc_legacy.requestSpyglass.call(session, {
      key: 'router__main---2',
      bwlev: false,
      context_md: false,
      name: 'main',
    })
  })
  await computed()

  const mainNavigationRouter = requireRouter(session, 'main')
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

beforeEach(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {})
})


test('should execute nested requireRel & reveal resource in router', async () => {
  const Billing = model({
    model_name: 'Billing',
    rels: {
      nav_parent_at_perspectivator_MainRouter: ['input', { linking: '<<<< ^' }],
    },
  })

  const Onboarding = model({
    model_name: 'Onboarding',
    rels: {
      nav_parent_at_perspectivator_MainRouter: ['input', { linking: '<<<< ^' }],
    },
  })

  const User = model({
    model_name: 'User',
    rels: {
      billing: ['model', Billing],
      onboarding: ['model', Onboarding],
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
      'requireRel:billing': {
        to: ['<< billing', { method: 'set_one', can_create: true }],
        fn: [
          ['<<<<'],
          (_, self) => ({
            rels: {
              nav_parent_at_perspectivator_MainRouter: self,
            },
          }),
        ],
      },
      'requireRel:onboarding': {
        to: {
          onboarding: ['<< onboarding', { method: 'set_one', can_create: true }],
        },
        fn: () => ({}),
      },
      pushStuckedOnboaring: {
        to: {
          onboarding: ['<< onboarding', { method: 'set_one', can_create: true }],
        },
        fn: [
          ['<<<<'],
          (_, self) => ({
            onboarding: {
              rels: {
                nav_parent_at_perspectivator_MainRouter: self,
              },
            }
          })
        ],
      },
    },
  })

  const AppRoot = modernRoot({
    rels: {
      $session_root: ['model', model({
        ...RootSession,
        extends: SessionRoot,
      })],
      common_session_root: ['input', {
        linking: '<< $session_root',
      }],
      user: ['nest', [User]],
      start_page: ['input', {
        linking: '<<<<',
      }],
      nav_parent_at_perspectivator_MainRouter: ['comp', ['<<<<'], { linking: '<<<<' }],
    },
    actions: {
      'requireRel:user': {
        to: {
          user: ['<< user', { method: 'set_one', can_create: true }],
        },
        fn: () => ({}),
      },
    },
  })

  const inited = await testingInit(AppRoot, {}, {session_root: true})

  const mainNavigationRouter = await getMainNavigationRouter(inited)
  const getCurrentModelId = () => mainNavigationRouter.readAddr('< @one:_node_id < current_mp_md')

  {
    expect(mainNavigationRouter).toBeTruthy()
    expect(mainNavigationRouter.readAddr('<< @one:current_mp_md')).toBe(inited.app_model)
  }

  {
    mainNavigationRouter.RPCLegacy('dispatch', 'expectRelBeRevealedByRelPath', {
      rel_path: 'user.billing',
      current_md_id: getCurrentModelId(),
    })


    await inited.computed()

    expect(mainNavigationRouter.readAddr('<< @all:wanted_bwlev_branch.pioneer').map(item => item.model_name)).toMatchSnapshot()
    expect(mainNavigationRouter.readAddr('<< @one:current_mp_md').model_name).toMatchSnapshot()

    expect(mainNavigationRouter.readAddr('current_expected_rel')).toMatchSnapshot()
    expect(
      inited.app_model._highway.live_heavy_rel_query_by_rel_name,
    ).toMatchSnapshot()
  }

  {
    // reset
    mainNavigationRouter.RPCLegacy('navigateToResource', inited.app_model._node_id)
    await inited.computed()
  }

  {
    mainNavigationRouter.RPCLegacy('dispatch', 'expectRelBeRevealedByRelPath', {
      rel_path: 'user.onboarding',
      current_md_id: getCurrentModelId(),
    })
    await inited.computed()

    /*
      expect that current_expected_rel got stuck
    */
    const stucked = {
      expected_at: expect.any(Number),
      id: expect.any(String),
      current_md_id: 'ROOT',
      rel_path: 'user.onboarding',
    }
    expect(mainNavigationRouter.readAddr('current_expected_rel')).toMatchSnapshot(stucked)

    {
      /*
        1. reinit app. with stucked current_expected_rel
      */
      const data = toReinitableData(inited.app_model._highway)
      const reinited = await testingReinit(AppRoot, data, {}, {session_root: true})

      {
        const inited = reinited

        const mainNavigationRouter = await getMainNavigationRouter(inited)
        expect(mainNavigationRouter.readAddr('current_expected_rel')).toMatchSnapshot(stucked)
        /*
          2. change state so current_expected_rel can be satisfied
        */
        inited.app_model.readAddr('<< @one:user').dispatch('pushStuckedOnboaring')
        /*
          3. expect that current_expected_rel was satisfied
        */
        await inited.computed()
        expect(mainNavigationRouter.readAddr('current_expected_rel') == null).toBeTruthy()
      }
    }



    // reset
    mainNavigationRouter.RPCLegacy('navigateToResource', inited.app_model._node_id)
    await inited.computed()
    expect(mainNavigationRouter.readAddr('current_expected_rel')).toMatchSnapshot()
    expect(
      inited.app_model._highway.live_heavy_rel_query_by_rel_name,
    ).toMatchSnapshot()
  }

  {
    mainNavigationRouter.RPCLegacy('dispatch', 'expectRelBeRevealedByRelPath', {
      rel_path: 'user.superrandom',
      current_md_id: getCurrentModelId(),
    })

    await expect(inited.computed()).rejects.toThrow('impossible to request')
  }
  //
})
