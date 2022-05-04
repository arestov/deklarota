import model from 'pv/model'
import pvState from 'pv/getAttr'

import init from '../../init'
import waitFlow from '../../waitFlow'
import fakeInterface from '../../fakeInterface'

test('state loaded', async () => {
  let check1 = false
  let check2 = false

  const SomePage = model({
    effects: {
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
      },
    },

    model_name: 'start_page',

    attrs: {
      someid: [
        'comp',
        [],
        function () {
          return 49588
        },
      ],
    },
  })

  const requests_manager = {
    addRequest: jest.fn(),
    considerOwnerAsImportant: jest.fn(),
    stopRequests: jest.fn(),
  }

  const app = (await init({
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
    checkActingRequestsPriority() {},
  }, () => {
    // self.all_queues = []
    // self.start_page = self.initChi('start__page')
  }, undefined, {
    requests_manager,
  })).app_model

  return waitFlow(app).then(app => app.getNesting('somepage').requestState('bio').then(() => waitFlow(app))).then(app => {
    expect('was born').toBe(pvState(app.getNesting('somepage'), 'bio'))

    // check loops breakers: transaction/inspect
    expect(check1).toBe(true)
    expect(check2).toBe(false)

    expect(requests_manager.addRequest).toHaveBeenCalled()
  })
})
