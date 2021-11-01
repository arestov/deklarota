import spv from 'spv'
import pvState from 'pv/getAttr'
import BrowseMap from 'js/libs/BrowseMap'

import init from '../../init'
import waitFlow from '../../waitFlow'
import fakeInterface from '../../fakeInterface'

test('state loaded', async () => {
  const StartPage = spv.inh(BrowseMap.Model, {}, {
    zero_map_level: true,
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

  const app = (await init({
    effects: {
      api: {
        fake() {
          return fakeInterface()
        },
      },
    },
    zero_map_level: false,
  'chi-start__page': StartPage,

    checkActingRequestsPriority() {

    },
  }, self => {
    self.all_queues = []
    self.start_page = self.initChi('start__page')
  })).app_model

  return waitFlow(app).then(app => app.start_page.requestState('bio').then(() => waitFlow(app))).then(app => {
    expect('was born').toBe(pvState(app.start_page, 'bio'))
  })
})
