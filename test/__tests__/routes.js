const test = require('ava')

const requirejs = require('../../requirejs-config')

const pvState = requirejs('pv/state')
const BrowseMap = requirejs('pv/Model')

const init = require('../init')
const waitFlow = require('../waitFlow')


test('routes', async t => {
  const app = (await init({
    zero_map_level: true,
    '+nests': {
      tracklist: ['model', BrowseMap],
    },
    actions: {
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
    app.getSPI('tracks/super-hit-0', { autocreate: false }),
    undefined,
  )

  t.is(
    app.getSPI('tracks/super-hit-1', { autocreate: false }),
    app.getNesting('tracklist')[0],
  )

  t.is(
    app.getSPI('tracks/super-hit-2', { autocreate: false }),
    app.getNesting('tracklist')[1],
  )

  // STEP 1. CHANGE STATE AND ROUTES

  const track = app.getNesting('tracklist')[0]
  track.updateState('trackName', 'cloud-remix')

  await waitFlow(app)

  t.is(
    app.getSPI('tracks/super-hit-1', { autocreate: false }),
    undefined,
  )

  t.is(
    app.getSPI('tracks/cloud-remix', { autocreate: false }),
    app.getNesting('tracklist')[0],
  )

  const created = app.getSPI('tracks/fresh-cover', { autocreate: true })
  t.is(
    created && pvState(created, 'trackName'),
    'fresh-cover',
  )

  t.is(
    created && pvState(created, 'url_part'),
    '/tracks/fresh-cover',
  )

  // get proper routes
  // miss wrong routes
})
