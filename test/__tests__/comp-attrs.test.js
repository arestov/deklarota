
import { it } from '@jest/globals'
import testingInit, { testingReinit } from '../testingInit'
import appRoot from 'pv/appRoot.js'
import model from 'pv/model'
import { toReinitableData } from '../../js/libs/provoda/provoda/runtime/app/reinit'

it('should compute comp attr before & after reinit', async () => {
  const Track = model({
    model_name: 'track',
    attrs: {
      number: ['input'],
      allowedToPlayType: [
        'comp',
        ['< @one:playlistModeB < $parent', '< @one:rootModeB < $root', 'number', '< @one:$meta$rels$tracks$length < $parent'],
        (parentMark, rootMark, number, length) => {
          if (number > (2/3 * length)) {
            return "independent"
          }

          if (number > (1/3 * length)) {
            if (!rootMark) {
              return "rootA"
            }
            return "rootB"
          }

          if (!parentMark) {
            return "parentA"
          }

          return "parentB"
        }
      ]
    },
  })

  const Playlist = model({
    model_name: 'Playlist',
    attrs: {
      playlistModeB: ['input'],
    },
    rels: {
      tracks: ['model', Track, { many: true }],
    },
    actions: {
      initTracks:  {
        to: ['<< tracks', {method: 'at_end', can_create: true}],
        fn: (list) => {

          debugger
          return list.map(attrs => ({attrs}))
        }
      }
    },
  })


  const AppRoot = appRoot({
    attrs: {
      rootModeB: ['input'],
      resultAttr: ['comp', ['< @all:allowedToPlayType < playlist.tracks']],
    },
    rels: {
      playlist: ['nest', [Playlist]],
    },
  })

  const inited = await testingInit(AppRoot, {})

  {
    inited.app_model.getNesting('playlist').dispatch('initTracks', [
      {number: 1},
      {number: 2},
      {number: 3},
    ])

    await inited.computed()

    expect(inited.app_model.getAttr('resultAttr')).toMatchSnapshot()

    const data = toReinitableData(inited.app_model._highway)
    {
      const reinited = await testingReinit(AppRoot, data, {})
      const inited = reinited
      expect(inited.app_model.getAttr('resultAttr')).toMatchSnapshot()


      /*
        2. change state
      */
      inited.app_model.updateAttr('rootModeB', true)
      inited.app_model.getNesting('playlist').updateAttr('playlistModeB', true)


      /*
        3. expect all changed propagated
      */
      await inited.computed()
      expect(inited.app_model.getAttr('resultAttr')).toMatchSnapshot()
    }
  }
})
