import test from 'ava'

import spv from 'spv'
import Model from 'pv/Model'
import pvState from 'pv/getAttr'
import pvPass from 'pv/pass'
import getNesting from 'pv/getRel'

import init from '../../init'
import makeStepsRunner from '../../steps'

const mdl = props => spv.inh(Model, {}, props)
const createDeepChild = (num, props) => mdl({
  attrs: {
    desc: [
      'comp',
      [],
      () => `DeepChild${num}`,
    ],
  },
  ...props,
})

test('auto dispatch and handle `handleInit` pass', async t => {
  const app = await setup()
  const steps = makeStepsRunner(app)
  const getData = (item, keys = ['artist', 'title']) => {
    if (!item) {
      return {}
    }

    return keys.reduce((acc, key) => ({
      ...acc,
      [key]: pvState(item, key),
    }), {})
  }

  const getSong = (num, plnum = 0) => {
    const list = getNesting(
      getNesting(app.start_page, 'all_playlists')[plnum],
      'songs_list',
    ) || []

    if (num == null) {
      return list
    }

    return list[num]
  }

  const getListItem = (num, plnum = 0) => getData(getSong(num, plnum))

  return steps([
    () => {
      t.deepEqual(
        {},
        getListItem(0),
      )
    },
    () => {
      pvPass(app.start_page, 'addToEnd', {
        states: {
          crazy_state: 'new york value',
          artist: 'Cloudy beasts',
          title: 'added to end',
        },
      })
    },
    () => {
      t.deepEqual(
        {
          artist: 'Cloudy beasts',
          title: 'added to end',
          crazy_state: 'new york value',
          special_prop: 'new york value',
        },
        getData(getSong(0), ['artist', 'title', 'crazy_state', 'special_prop']),
        'should add proper states to song of songs_list',
      )
    },
  ])

  async function setup() {
    const Song = createDeepChild('Song', {
      actions: {
        handleInit: {
          to: ['< special_prop'],
          fn: [
            [],
            ({ states }) => states.crazy_state,
          ],
        },
      },
    })
    const Playlist = createDeepChild('playlist', {
      rels: {
        songs_list: ['model', Song],
      },
    })

    const createAction = (method, id = 1) => ({
      to: [`songs_list < /playlists/${id}/ < #`, {
        method,
        // 'at_start' || 'at_end' || 'set_one' || 'replace' || 'at_index' || 'move_to',
        // model: Song,
      }],
      fn: [
        [],
        data => data,
      ],
    })

    const app = (await init({
      'chi-start__page': createDeepChild('start', {
        model_name: 'startModel',
        rels: {
          all_playlists: ['nest', [['playlists/1', 'playlists/2']]],
        },
        actions: {
          addToEnd: createAction('at_end'),
        },
        sub_pager: {
          type: {
            playlists: 'playlist',
          },
          by_type: {
            playlist: {
              head: {
                id: 'by_slash.0',
              },
              title: [[]],
              constr: Playlist,
            },
          },
        },
      }),
    }, self => {
      self.start_page = self.initChi('start__page') // eslint-disable-line
    })).app_model

    return app
  }
})
