const test = require('ava')

const requirejs = require('../../requirejs-config')

const BrowseMap = requirejs('pv/Model')

const init = require('../init')
const waitFlow = require('../waitFlow')


test('routes', async t => {
  const app = (await init({
    zero_map_level: true,
    '+nests': {
      tracklist: ['model', BrowseMap],
    },
    '+passes': {
      handleInit: {
        to: ['<< tracklist', { method: 'set_many' }],
        fn: () => ([
          {
            states: {
              trackName: 'super-hit-1',
            },
          },
          {
            states: {
              trackName: 'super-hit-2',
            },
          },
        ]),
      },
    },
    '+routes': {
      'tracks/[:trackName]': 'tracklist',
    },
  })).app_model
  // init some list

  // STEP 1. GET ROUTES
  await waitFlow(app)

  t.is(
    app.getSPI('tracks/super-hit-0'),
    undefined,
  )

  t.is(
    app.getSPI('tracks/super-hit-1'),
    app.getNesting('tracklist')[0],
  )

  t.is(
    app.getSPI('tracks/super-hit-2'),
    app.getNesting('tracklist')[1],
  )

  // STEP 1. CHANGE STATE AND ROUTES

  const track = app.getNesting('tracklist')[0]
  track.updateState('trackName', 'cloud-remix')

  await waitFlow(app)

  t.is(
    app.getSPI('tracks/super-hit-1'),
    undefined,
  )

  t.is(
    app.getSPI('tracks/cloud-remix'),
    app.getNesting('tracklist')[0],
  )

  // get proper routes
  // miss wrong routes
})
