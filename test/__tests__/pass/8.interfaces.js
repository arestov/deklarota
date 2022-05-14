import model from 'pv/model'
import pvPass from 'pv/pass'
import getNesting from 'pv/getRel'
import { expect, test } from '@jest/globals'

import init from '../../init'
import makeStepsRunner from '../../steps'

const mdl = props => model(props)

const createDeepChild = (num, props) => mdl({
  model_name: `DeepChild${num}`,
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
        attrs: {
          artist: 'Cloudy beasts',
          title: '1st added to start',
        },
        interfaces: {
          myInterface: {},
        },
      })
    },
    () => {
      expect(getListItem(0).getAttr('$meta$apis$myInterface$used')).toBeTruthy()
    },
  ])

  async function setup() {
    const Song = createDeepChild('Song', {
      attrs: {
        artist: ['input'],
        title: ['input'],
      },
    })
    const Playlist = createDeepChild('playlist', {
      attrs: {
        id: ['input'],
      },
      rels: {
        songs_list: ['model', Song, { many: true }],
      },
    })

    const createAction = (method, id = 1) => ({
      to: [`songs_list < playlists/[:id::${id}] < #`, {
        method,
        // 'at_start' || 'at_end' || 'set_one' || 'replace' || 'at_index' || 'move_to',
        // model: Song,
        can_create: true,
      }],
      fn: [
        [],
        data => data,
      ],
    })

    const app = (await init({
      model_name: 'startModel',
      rels: {
        all_playlists: ['nest', [['playlists/[:id::1]', 'playlists/[:id::2]']]],
        playlists: ['model', Playlist, { many: true, uniq: ['id'] }],
      },
      actions: {
        addWithInterface: createAction('at_start'),
      },
      routes: {
        'playlists/[:id]': 'playlists',
      },
    })).app_model

    return app
  }
})
