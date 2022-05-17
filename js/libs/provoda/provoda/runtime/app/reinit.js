import initApis from '../../../dcl/effects/legacy/api/init'
import memorize from '../../../../spv/memorize'
import MentionChain from '../../../Model/mentions/MentionChain'
import { setChain } from '../../../../../models/handleCurrentExpectedRel'
import { addHeavyRelQueryToRuntime } from '../../../Model/mentions/heavy_queries/addHeavyRelQuery'
import handleHeavyRelQueryChange from '../../../Model/mentions/heavy_queries/handleHeavyRelQueryChange'


export const reinitOne = (md) => {
  initApis(md, null)
}

const getId = (item) => item?._provoda_id

const modelAsValue = (someval) => {
  if (getId(someval)) {
    return { _provoda_id: someval._provoda_id }
  }

  return someval
}

const listOrOneItem = (value) => {
  if (!Array.isArray(value)) {
    return modelAsValue(value)
  }

  if (!value.some(getId)) {
    return value
  }

  return value.map(modelAsValue)
}

const modelToData = (self) => {
  const attrs = {}
  for (let i = 0; i < self._attrs_collector.all.length; i++) {
    const cur = self._attrs_collector.all[i]
    attrs[cur] = listOrOneItem(self.getAttr(cur))
  }

  const rels = {}

  for (const rel_name in self.children_models) {
    if (!Object.hasOwnProperty.call(self.children_models, rel_name)) {
      continue
    }

    const cur = self.children_models[rel_name]
    if (!Array.isArray(cur)) {
      rels[rel_name] = getId(cur)
      continue
    }

    rels[rel_name] = cur.map(getId)
  }

  const mentions = {}

  for (const rel_name in self.__mentions_as_rel) {
    if (!Object.hasOwnProperty.call(self.__mentions_as_rel, rel_name)) {
      continue
    }
    const cur = self.__mentions_as_rel[rel_name]
    if (cur == null) {
      continue
    }

    mentions[rel_name] = []

    for (const md of cur) {
      mentions[rel_name].push(getId(md))
    }
  }

  return {
    id: self._provoda_id,
    model_name: self.model_name,
    attrs,
    rels,
    mentions,
    // live_heavy_rel_query_by_rel_name
  }
}

const mentionChainLinkToData = (item) => {
  const { rel } = item
  return rel
}

const mentionChainToData = (value) => {
  return {
    target_type: value.target_type,
    rel_path: value.list.map(mentionChainLinkToData),
    target_matcher: value.target_matcher._provoda_id,
    addr: value.addr,
    target_name: value.target_name,
    handler_payload: value.handler_payload,
  }
}

const dataToMentionChain = (data, current_md) => {
  return new MentionChain(
    data.target_type,
    data.rel_path,
    current_md,
    null,
    null,
    data.handler_payload,
  )
}

export const toReinitableData = (runtime) => {
  const expected_rels_to_chains = runtime.expected_rels_to_chains
    ? Object.fromEntries([...runtime.expected_rels_to_chains.entries()].map(([key, value]) => {
      return [key, mentionChainToData(value)]
    }))
    : {}

  const models = {}
  for (const id in runtime.models) {
    if (!Object.hasOwnProperty.call(runtime.models, id)) {
      continue
    }
    const cur = runtime.models[id]
    if (cur == null) {
      models[id] = null
      continue
    }
    models[id] = modelToData(cur)
  }

  return {
    models,
    expected_rels_to_chains,
  }
}

export const reinit = (AppRoot, runtime, data, interfaces) => {
  const {models, expected_rels_to_chains} = data

  const models_list = []
  for (const id in models) {
    if (!Object.hasOwnProperty.call(models, id)) {
      continue
    }

    const cur = models[id]
    if (cur == null) {
      runtime.models[id] = null
      continue
    }

    runtime.models_counters = Math.max(runtime.models_counters, cur.id + 1)

    const Constr = AppRoot.prototype.constrs_by_name.get(cur.model_name).constructor
    const opts = {
      _highway: runtime,
      _provoda_id: cur.id,
      map_parent: null,
      app: null,
      reinit: true,
    }

    const item = new Constr(opts)
    if (runtime.models[item._provoda_id] !== item) {
      throw new Error()
    }

    models_list.push(cur)
  }

  const getById = (id) => runtime.models[id]

  const listToRefs = (list) => list.map(getById)

  const toRefs = (value) => {
    if (value == null) {
      return value
    }

    if (!Array.isArray(value)) {
      return getById(value)
    }

    return listToRefs(value)
  }

  const hasProvodaId = (item) => Boolean(item?._provoda_id)

  const getByProvodaId = (item) => getById(item._provoda_id)

  const toRuntimeAttrValue = (val) => {
    if (!Array.isArray(val)) {
      if (!hasProvodaId(val)) {
        return val
      }

      return getById(val._provoda_id)
    }
    if (!val.some(hasProvodaId)) {
      return val
    }
    return val.map(getByProvodaId)
  }

  const root_id = models_list[0].id
  const app = getById(root_id)


  for (let i = 0; i < models_list.length; i++) {
    const cur = models_list[i]
    const self = runtime.models[cur.id]

    for (const rel_name in cur.rels) {
      if (!Object.hasOwnProperty.call(cur.rels, rel_name)) {
        continue
      }

      self.children_models[rel_name] = toRefs(cur.rels[rel_name])
    }

    self.map_parent = self.children_models.$parent || null
    self.app = app

    self.__mentions_as_rel = {}
    for (const rel_name in cur.mentions) {
      if (!Object.hasOwnProperty.call(cur.mentions, rel_name)) {
        continue
      }

      self.__mentions_as_rel[rel_name] = new Set(listToRefs(cur.mentions[rel_name]))
    }

    for (const attr_name in cur.attrs) {
      if (!Object.hasOwnProperty.call(cur.attrs, attr_name)) {
        continue
      }

      const value = cur.attrs[attr_name]
      self.states[attr_name] = toRuntimeAttrValue(value)
    }
  }

  const expected_rels = []
  for (const key in expected_rels_to_chains) {
    if (!Object.hasOwnProperty.call(expected_rels_to_chains, key)) {
      continue
    }

    const element = expected_rels_to_chains[key]
    const curremt_md_id = element.target_matcher
    const current_md = getById(curremt_md_id)
    const expected_rel = element.handler_payload.data

    const chain = dataToMentionChain(element, current_md)

    setChain(current_md, expected_rel, chain)
    addHeavyRelQueryToRuntime(current_md, chain)

    expected_rels.push(
      [current_md, chain]
    )
  }

  runtime.calls_flow.input(() => {
    const isApiAttr = memorize((str) => str.startsWith('$meta$apis$') && str.endsWith('$used'))

    for (let i = 0; i < models_list.length; i++) {
      const cur = models_list[i]
      const self = runtime.models[cur.id]

      for (const attr_name in cur.attrs) {
        if (!Object.hasOwnProperty.call(cur.attrs, attr_name)) {
          continue
        }

        if (!isApiAttr(attr_name)) {
          continue
        }

        self.updateAttr(attr_name, false)
      }
    }

  })

  runtime.calls_flow.input(() => {

    for (let i = 0; i < models_list.length; i++) {
      const cur = models_list[i]
      const self = runtime.models[cur.id]
      reinitOne(self)
    }

    const root_id = models_list[0].id
    const app = getById(root_id)

    for (const api_name in interfaces) {
      if (!Object.hasOwnProperty.call(interfaces, api_name)) {
        continue
      }

      const cur = interfaces[api_name]
      app.useInterface(api_name, cur)
    }
  })

  runtime.calls_flow.input(() => {
    expected_rels.forEach(([current_md, chain]) => {
      handleHeavyRelQueryChange(current_md, chain)
    })
  })

  return new Promise(resolve => {
    runtime.calls_flow.input(() => {

      const root_id = models_list[0].id
      const app_model = getById(root_id)

      resolve({
        runtime,
        app_model: app_model,
        flow: runtime.calls_flow,
        sync_sender: runtime.sync_sender,
        views_proxies: runtime.views_proxies,
      })
    })

  })

}
