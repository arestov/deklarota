// 5. один результат,
// адресат результата nesting определен любым способом типа записи nesting,
// обычное указание адресата
// a - передача nesting

/*
инициализировать /playlists/1
  добавть Song в /playlists/1 в songs_list
*/

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

test('special nestings by pass calculated', async () => {
  const app = await setup()
  const steps = makeStepsRunner(app)
  const getData = item => {
    if (!item) {
      return {}
    }

    return {
      artist: pvState(item, 'artist'),
      title: pvState(item, 'title'),
    }
  }
  const getListItem = (num, plnum = 0, rel = 'songs_list') => {
    const list = getNesting(
      getNesting(app.start_page, 'all_playlists')[plnum],
      rel,
    ) || []

    if (num == null) {
      return list
    }

    return getData(list[num])
  }

  return steps([
    () => {
      expect({}).toEqual(getListItem(0))
      pvPass(app.start_page, 'addToStart', {
        attrs: {
          artist: 'Cloudy beasts',
          title: '1st added to start',
        },
      })
      pvPass(app.start_page, 'addToStart', {
        attrs: {
          artist: 'Cloudy beasts',
          title: '2nd added to start',
        },
      })
      pvPass(app.start_page, 'addToStart', {
        attrs: {
          artist: 'Cloudy beasts',
          title: '3rd added to start',
        },
      })
    },
    () => {
      expect({
        artist: 'Cloudy beasts',
        title: '3rd added to start',
      }).toEqual(getListItem(0))
      expect({
        artist: 'Cloudy beasts',
        title: '2nd added to start',
      }).toEqual(getListItem(1))
      expect({
        artist: 'Cloudy beasts',
        title: '1st added to start',
      }).toEqual(getListItem(2))
    },

    () => {
      pvPass(app.start_page, 'addToEnd', {
        attrs: {
          artist: 'Cloudy beasts',
          title: 'added to end',
        },
      })
    },
    () => {
      expect({
        artist: 'Cloudy beasts',
        title: 'added to end',
      }).toEqual(getListItem(3))
    },

    () => {
      // add at index
      pvPass(app.start_page, 'addToIndex', [
        1,
        {
          attrs: {
            artist: 'Cloudy beasts',
            title: 'added to index 1',
          },
        },
      ])
    },
    () => {
      expect({
        artist: 'Cloudy beasts',
        title: 'added to index 1',
      }).toEqual(getListItem(1))
    },

    () => {
      // replace at index
      pvPass(app.start_page, 'replace', [
        1,
        {
          attrs: {
            artist: 'Cloudy beasts',
            title: 'replaced at index 1',
          },
        },
      ])
    },
    () => {
      expect({
        artist: 'Cloudy beasts',
        title: 'replaced at index 1',
      }).toEqual(getListItem(1))
      expect({
        artist: 'Cloudy beasts',
        title: '2nd added to start',
      }).toEqual(getListItem(2))
    },

    () => {
      // set one
      pvPass(app.start_page, 'setOne', {
        attrs: {
          artist: 'Cloudy beasts',
          title: 'just one',
        },
      })
    },
    () => {
      const item = getListItem(null, 1, 'one_song')
      expect(false).toBe(Array.isArray(item))

      expect({
        artist: 'Cloudy beasts',
        title: 'just one',
      }).toEqual(getData(item))

      pvPass(app.start_page, 'setOne', {
        attrs: {
          artist: 'Cloudy beasts',
          title: 'another one',
        },
      })
    },
    () => {
      const item = getListItem(null, 1, 'one_song')
      expect(false).toBe(Array.isArray(item))

      expect({
        artist: 'Cloudy beasts',
        title: 'another one',
      }).toEqual(getData(item))
    },
  ])

  async function setup() {
    const Playlist = createDeepChild('playlist', {
      rels: {
        songs_list: ['model', createDeepChild('songs_list'), { many: true }],
        one_song: ['model', createDeepChild('one_song'), { many: false }],
      },
    })

    const createAction = (method, id = 1, rel = 'songs_list') => ({
      to: [`${rel} < playlists/[:id::${id}] < #`, {
        method,
        can_create: true,
        // 'at_start' || 'at_end' || 'set_one' || 'replace' || 'at_index' || 'move_to',
        // model: Song,
      }],
      fn: [
        [],
        data => data,
      ],
    })

    const app = (await init({
      rels: {
        all_playlists: ['nest', [['playlists/[:id::1]', 'playlists/[:id::2]']]],
        playlists: ['model', Playlist, { many: true, uniq: ['id'] }],
      },
      actions: {
        addToStart: createAction('at_start'),
        addToEnd: createAction('at_end'),
        addToIndex: createAction('at_index'),
        replace: createAction('replace'),
        setOne: createAction('set_one', 2, 'one_song'),
      },
      routes: {
        'playlists/[:id]': 'playlists',
      },
    })).app_model

    return app
  }
})
