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
  const getListItem = (num, plnum = 0) => {
    const list = getNesting(
      getNesting(app.start_page, 'all_playlists')[plnum],
      'songs_list',
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
        states: {
          artist: 'Cloudy beasts',
          title: '1st added to start',
        },
      })
      pvPass(app.start_page, 'addToStart', {
        states: {
          artist: 'Cloudy beasts',
          title: '2nd added to start',
        },
      })
      pvPass(app.start_page, 'addToStart', {
        states: {
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
        states: {
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
          states: {
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
          states: {
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
        states: {
          artist: 'Cloudy beasts',
          title: 'just one',
        },
      })
    },
    () => {
      const item = getListItem(null, 1)
      expect(false).toBe(Array.isArray(item))

      expect({
        artist: 'Cloudy beasts',
        title: 'just one',
      }).toEqual(getData(item))

      pvPass(app.start_page, 'setOne', {
        states: {
          artist: 'Cloudy beasts',
          title: 'another one',
        },
      })
    },
    () => {
      const item = getListItem(null, 1)
      expect(false).toBe(Array.isArray(item))

      expect({
        artist: 'Cloudy beasts',
        title: 'another one',
      }).toEqual(getData(item))
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
          addToStart: createAction('at_start'),
          addToEnd: createAction('at_end'),
          addToIndex: createAction('at_index'),
          replace: createAction('replace'),
          setOne: createAction('set_one', 2),
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
