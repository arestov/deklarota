import model from 'pv/model'
import pvPass from 'pv/pass'
import getNesting from 'pv/getRel'
import { expect, test } from '@jest/globals'

import init from '../../init'
import makeStepsRunner from '../../steps'

const mdl = props => model(props)

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

test('interface passed to action should be assigned', async () => {
  const app = await setup()

  const steps = makeStepsRunner(app)

  const getListItem = (num, plnum = 0) => {
    const list = getNesting(
      getNesting(app.start_page, 'all_playlists')[plnum],
      'songs_list',
    ) || []

    if (num == null) {
      return list
    }

    return list[num]
  }

  return steps([
    () => {
      pvPass(app.start_page, 'addWithInterface', {
        states: {
          artist: 'Cloudy beasts',
          title: '1st added to start',
        },
        interfaces: {
          myInterface: {},
        },
      })
    },
    () => {
      expect(getListItem(0).getAttr('$meta$apis$myInterface$used')).toEqual(true)
    },
  ])

  async function setup() {
    const Song = createDeepChild('Song')
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
      zero_map_level: false,
      'chi-start__page': createDeepChild('start', {
        zero_map_level: true,
        model_name: 'startModel',
        rels: {
          all_playlists: ['nest', [['playlists/1', 'playlists/2']]],
        },
        actions: {
          addWithInterface: createAction('at_start'),
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
