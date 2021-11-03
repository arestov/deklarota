import pvState from 'pv/getAttr'
import model from 'pv/model'

import init from 'test/init'

const waitFlow = require('../waitFlow')

const input = (app, fn) => new Promise(resolve => {
  app.input(() => {
    fn(app)
    resolve()
  })
})


test('routes', async () => {
  const app = (await init({
    zero_map_level: true,
    rels: {
      tracklist: ['model', model({}), { many: true }],
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
    routes: {
      'tracks/[:trackName]': 'tracklist',
    },
  })).app_model
  // init some list

  // STEP 1. GET ROUTES
  await waitFlow(app)

  expect(app.getSPI('tracks/super-hit-0', { autocreate: false })).toBe(undefined)

  expect(app.getSPI('tracks/super-hit-1', { autocreate: false })).toBe(app.getNesting('tracklist')[0])

  expect(app.getSPI('tracks/super-hit-2', { autocreate: false })).toBe(app.getNesting('tracklist')[1])

  await input(app, () => {
    // STEP 1. CHANGE STATE AND ROUTES

    const track = app.getNesting('tracklist')[0]
    track.updateState('trackName', 'cloud-remix')
  })

  await waitFlow(app)

  await input(app, () => {
    expect(app.getSPI('tracks/super-hit-1', { autocreate: false })).toBe(undefined)

    expect(app.getSPI('tracks/cloud-remix', { autocreate: false })).toBe(app.getNesting('tracklist')[0])

    const created = app.getSPI('tracks/fresh-cover', { autocreate: true })
    expect(created && pvState(created, 'trackName')).toBe('fresh-cover')

    expect(created && pvState(created, 'url_part')).toBe('/tracks/fresh-cover')
  })

  // get proper routes
  // miss wrong routes
})
