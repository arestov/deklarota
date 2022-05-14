import model from 'pv/model'
import pvState from 'pv/getAttr'
import pvPass from 'pv/pass'
import getNesting from 'pv/getRel'

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

test('auto dispatch and handle `handleInit` pass', async () => {
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
      expect({}).toEqual(getListItem(0))
    },
    () => {
      pvPass(app.start_page, 'addToEnd', {
        attrs: {
          crazy_state: 'new york value',
          artist: 'Cloudy beasts',
          title: 'added to end',
        },
      })
    },
    () => {
      expect({
        artist: 'Cloudy beasts',
        title: 'added to end',
        crazy_state: 'new york value',
        special_prop: 'new york value',
      }).toEqual(getData(getSong(0), ['artist', 'title', 'crazy_state', 'special_prop']))
    },
  ])

  async function setup() {
    const Song = createDeepChild('Song', {
      attrs: {
        crazy_state: ['input'],
        artist: ['input'],
        title: ['input'],
        special_prop: ['input'],
      },
      actions: {
        handleInit: {
          to: ['< special_prop'],
          fn: [
            [],
            ({ attrs }) => attrs.crazy_state,
          ],
        },
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
        addToEnd: createAction('at_end'),
      },
      routes: {
        'playlists/[:id]': 'playlists',
      },
    })).app_model

    return app
  }
})
