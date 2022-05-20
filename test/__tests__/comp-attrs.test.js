/* eslint-disable fp/no-let */
/* eslint-disable fp/no-loops */
/* eslint-disable fp/no-delete */
/* eslint-disable fp/no-mutation */

import { it } from '@jest/globals'
import appRoot from 'pv/appRoot.js'
import model from 'pv/model'
import mergeModel from 'pv/dcl/merge'
import testingInit, { testingReinit } from '../testingInit'
import { toReinitableData } from '../../js/libs/provoda/provoda/runtime/app/reinit'

it('should compute comp attr before & after reinit', async () => {
  const makeStorage = () => {
    const storage_data = {
      models: {},
      expected_rels_to_chains: {},
    }

    let schema = null

    const storage = {
      getSchema: () => schema,
      putSchema: val => {
        schema = val
      },

      hasData: () => Boolean(Object.keys(storage_data.models).length),
      getSnapshot: () => storage_data,
      createModel: (id, model_name, attrs, rels, mentions) => {
        storage_data.models[id] = {
          id, model_name, attrs, rels, mentions,
        }
      },
      deleteModel: id => {
        storage_data.models[id] = null
      },
      updateModelAttrs: (id, changes_list) => {
        const CH_GR_LE = 2
        for (let i = 0; i < changes_list.length; i += CH_GR_LE) {
          const attr_name = changes_list[i]
          const value = changes_list[i + 1]
          storage_data.models[id].attrs[attr_name] = value
        }
      },
      updateModelRel: (id, rel_name, value) => {
        storage_data.models[id].rels[rel_name] = value
      },
      updateModelMention: (id, mention_name, value) => {
        storage_data.models[id].mentions[mention_name] = value
      },
      createExpectedRel: (key, data) => {
        storage.expected_rels_to_chains[key] = data
      },
      deleteExpectedRel: key => {
        delete storage.expected_rels_to_chains[key]
      },
    }
    return storage
  }

  const dkt_storage = makeStorage()


  const Track = model({
    model_name: 'track',
    attrs: {
      number: ['input'],
      allowedToPlayType: [
        'comp',
        ['< @one:playlistModeB < $parent', '< @one:rootModeB < $root', 'number', '< @one:$meta$rels$tracks$length < $parent'],
        (parentMark, rootMark, number, length) => {
          if (number > (2 / 3 * length)) {
            return 'independent'
          }

          if (number > (1 / 3 * length)) {
            if (!rootMark) {
              return 'rootA'
            }
            return 'rootB'
          }

          if (!parentMark) {
            return 'parentA'
          }

          return 'parentB'
        },
      ],
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
      initTracks: {
        to: ['<< tracks', { method: 'at_end', can_create: true }],
        fn: list => list.map(attrs => ({ attrs })),
      },
    },
  })

  const AppRootSchema = {
    attrs: {
      rootModeB: ['input'],
      resultAttr: ['comp', ['< @all:allowedToPlayType < playlist.tracks']],
    },
    rels: {
      playlist: ['nest', [Playlist]],
    },
  }
  const AppRoot = appRoot(AppRootSchema)

  const inited = await testingInit(AppRoot, {}, { dkt_storage })
  expect(dkt_storage.getSchema()).toMatchSnapshot()

  {
    inited.app_model.getNesting('playlist').dispatch('initTracks', [
      { number: 1 },
      { number: 2 },
      { number: 3 },
    ])

    await inited.computed()

    expect(inited.app_model.getAttr('resultAttr')).toMatchSnapshot()

    const data = toReinitableData(inited.app_model._highway)
    expect(dkt_storage.getSnapshot()).toEqual(data)

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

    {
      const AppRootChanged = appRoot(
        mergeModel(AppRootSchema, {
          attrs: {
            oneMoreAttr: ['comp', ['resultAttr']],
          },
        }),
      )

      const reinited = await testingReinit(AppRootChanged, data, {}, { dkt_storage })
      /* compare with resultAttr */
      expect(
        reinited.app_model.getAttr('oneMoreAttr'),
      ).toBe(
        reinited.app_model.getAttr('resultAttr'),
      )

      /* compare with original rootModeB */
      expect(
        reinited.app_model.getAttr('oneMoreAttr'),
      ).toBe(
        inited.app_model.getAttr('resultAttr'),
      )
    }
  }
})
