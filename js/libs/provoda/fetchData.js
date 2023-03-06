
import pv from './provoda'
import BrowseMap from './provoda/BrowseMap'
import flatStruc from './structure/flatStruc'

throw new Error('use runtime/app/start to init app')

function fetchData(db, App, schema, url) {
  throw new Error('make proper init of proxies = views_proxies')
  const globthis = typeof globalThis !== 'undefined' ? globalThis : window

  const proxies = null

  const calls_flow = new pv.CallbacksFlow(globthis)

  const highway = {
    models_counters: 1,
    sync_sender: new pv.SyncSender(),
    views_proxies: proxies,
    models: {},
    requests: [],
    calls_flow: calls_flow,
    proxies: proxies
  }

  const app = new App({
    _highway: highway
  }, db)

  const md = BrowseMap.routePathByModels(app.start_page, url, false, true)
  if (!md) {
    return Promise.reject([404])
  } else {
    if (schema) {
      const to_load = {
        list: flatStruc(md, schema),
        supervision: {
          greedy: true,
          needy_id: -1,
          store: {},
          reqs: {},
          is_active: {}
        }
      }
      for (let i = 0; i < to_load.list.length; i++) {
        const cur = to_load.list[i]
        if (!cur) {continue}
        md.addReqDependence(to_load.supervision, cur)
      }
    }

    return calcsReady(highway).then(function() {
      return md
    })
  }
}

function calcsReady(highway) {
  const calls_flow = highway.calls_flow
  const requests_promise = Promise.all(highway.requests)

  const flow_promise = calls_flow.flow_end ? new Promise(function(resolve) {
    calls_flow.whenReady(function() {
      resolve()
    })
  }) : Promise.resolve()

  return new Promise(function(resolve, reject) {
    Promise.all([flow_promise, requests_promise]).then(check, reject)

    function check() {
      if (!calls_flow.flow_end && !highway.size) {
        resolve()
      } else {
        calcsReady(highway).then(resolve)
      }
    }

  })
}

fetchData.getWatchStruct = getWatchStruct

function getWatchStruct(schema) {
  // in:
  // {
  //   states: [],
  //   nestings: {
  //     artists: {
  //       states: [],
  //       nesting: {}
  //     }
  //   }
  // }

  // out:
  // struc.main.merged_states
  // struc.main.m_children.children

  const nestings = {}
  for (const nesting_name in schema.nestings) {
    nestings[nesting_name] = getWatchStruct(schema.nestings[nesting_name])
  }

  return {
    main: {
      limit: schema.limit,
      merged_states: schema.states || [],
      m_children: {
        children: nestings
      }
    }
  }
}

export default fetchData
