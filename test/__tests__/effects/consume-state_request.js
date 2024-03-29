import model from 'pv/model'
import pvState from 'pv/getAttr'

import init from '../../init'
import waitFlow from '../../waitFlow'
import fakeInterface from '../../fakeInterface'

test('state loaded', async () => {
  let check1 = false
  let check2 = false
  let check3 = false

  const SomePage = model({

    model_name: 'start_page',

    attrs: {
      bio: ['input'],
      $meta$attrs$bio$complete: ['input'],
      someid: [
        'comp',
        [],
        function () {
          return 49588
        },
      ],
    },

    effects: {
      api: {
      },
      in: {
        0: {
          type: 'state_request',
          states: ['bio'],

          parse: function parse(data) {
            return [data && data.bio]
          },

          api: '#fake',

          fn: [
            ['someid'],
            function (api, opts, msq) {
              return api.get(`profiles/${55}`, {}, opts)
            },
          ],
        },
      },
      out: {
        check1: {
          api: ['self'],
          create_when: {
            api_inits: true,
          },
          trigger: ['bio'],
          require: ['bio'],
          fn: () => {
            check1 = true
          },
        },
        check2: {
          api: ['#fake'],
          create_when: {
            api_inits: true,
          },
          trigger: ['bio'],
          require: ['bio'],
          fn: () => {
            check2 = true
          },
        },
        check3: {
          api: ['self', '#fake'],
          create_when: {
            api_inits: true,
          },
          trigger: ['_node_id'],
          fn: () => {
            check3 = true
          },
        },
      },
    },

  })

  const requests_manager = {
    addRequest: jest.fn(),
    considerOwnerAsImportant: jest.fn(),
    stopRequests: jest.fn(),
  }

  const app = (await init({
    attrs: {
      $meta$apis$requests_manager$used: ['input'],
    },
    rels: {
      somepage: ['nest', [SomePage]],
    },
    effects: {
      api: {
        fake() {
          return fakeInterface()
        },
      },
    },
  }, () => {
  }, undefined, {
    requests_manager,
  })).app_model

  await waitFlow(app)

  expect(check3).toBe(true)

  return waitFlow(app).then(app => app.getNesting('somepage').requestState('bio').then(() => waitFlow(app))).then(app => {
    expect('was born').toBe(pvState(app.getNesting('somepage'), 'bio'))

    // check loops breakers: transaction/inspect
    expect(check1).toBe(true)
    expect(check2).toBe(false)

    expect(requests_manager.addRequest).toHaveBeenCalled()
  })
})
