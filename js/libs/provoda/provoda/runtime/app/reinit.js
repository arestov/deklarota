import initApis from '../../../dcl/effects/legacy/api/init'
import memorize from '../../../../spv/memorize'
import MentionChain from '../../../Model/mentions/MentionChain'
import { setChain } from '../../../../../models/handleCurrentExpectedRel'
import { addHeavyRelQueryToRuntime } from '../../../Model/mentions/heavy_queries/addHeavyRelQuery'
import handleHeavyRelQueryChange from '../../../Model/mentions/heavy_queries/handleHeavyRelQueryChange'
import modelToData from '../../../_internal/reinit/modelToData'
import { hasOwnProperty } from '../../../hasOwnProperty'
import { countKeys } from '../../../../spv'
import updateProxy, { calcProvidedCompList } from '../../../updateProxy'
import { APP_ROOT_ID } from '../../../Model/APP_ROOT_ID'


export const reinitOne = (md) => {
  initApis(md, null)
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

const isInputRel = (rel_type) => {
  switch (rel_type) {
    case 'input':
    case 'model':
    case 'nest':
      return true
  }
  return false
}

export const getModelDataSchema = (AppRoot) => {
  const models = {}

  for (const model of AppRoot.prototype.constrs_by_name.values()) {
    const attrs = []

    for (let i = 0; i < model.__defined_attrs_bool.length; i++) {
      const cur = model.__defined_attrs_bool[i]
      const is_input = !hasOwnProperty(model.compx_check, cur.name)

      attrs.push({
        name: cur.name,
        is_input,
        is_bool: cur.type == 'bool'
      })
    }

    const rels = []
    const rels_model_schema = model._extendable_nest_index
    for (const rel_name in rels_model_schema) {
      if (!Object.hasOwnProperty.call(rels_model_schema, rel_name)) {
        continue
      }
      const cur = rels_model_schema[rel_name]
      rels.push({
        name: rel_name,
        is_input: isInputRel(cur.type),
        many: Boolean(cur.dcl.rel_shape.many)
      })
    }

    models[model.model_name] = {
      attrs,
      rels,
    }
  }

  return models
}

const getCompAttrsFromSchema = (schema) => {
  const result = new Set()

  for (let i = 0; i < schema.attrs.length; i++) {
    const cur = schema.attrs[i]
    if (cur.is_input) {
      continue
    }
    result.add(cur.name)
  }

  return result
}

const makeAutomigration = (old_schema, new_schema) => {
  /*
    now we can only auto migrate to added comp attrs

    p.s.
    1. it would be easy to make
      - remove comp attrs
      - add/remove comp rels

    2. medium - signal to recalc exising comp attrs

    3. rename comp (just remove + add)

    4. most hard - rename input attrs/rels?
  */
  const result = {}

  for (const model_name in new_schema) {
    if (!Object.hasOwnProperty.call(new_schema, model_name)) {
      continue
    }

    /*
      there is no model in old schema. new model added. nothing to compare
    */
    if (!hasOwnProperty(old_schema, model_name)) {
      continue
    }


    const old_schema_comp_attrs = getCompAttrsFromSchema(old_schema[model_name])
    const new_schema_comp_attrs = getCompAttrsFromSchema(new_schema[model_name])

    const added = []
    for (const attr_name of new_schema_comp_attrs) {
      if (old_schema_comp_attrs.has(attr_name)) {
        continue
      }
      added.push(attr_name)
    }
    if (!added.length) {
      continue
    }

    result[model_name] = {
      added_comp_attrs: added,
    }
  }

  if (!countKeys(result, true)) {
    return null
  }

  return result
}

const reinitAllAttrsAutoMigration = (new_schema) => {
  const result = {}

  for (const model_name in new_schema) {
    if (!Object.hasOwnProperty.call(new_schema, model_name)) {
      continue
    }

    const new_schema_comp_attrs = getCompAttrsFromSchema(new_schema[model_name])
    result[model_name] = {
      added_comp_attrs: [...new_schema_comp_attrs],
    }
  }


  return result

}

export const reinit = async (AppRoot, runtime, data, interfaces, options) => {
  /* expect reinit_all_attrs to be used in dev mode, not production */
  const reinit_all_attrs = options?.reinit_all_attrs
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

  const app = getById(APP_ROOT_ID)


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

  const old_schema = await runtime.dkt_storage?.getSchema()
  const new_schema = getModelDataSchema(AppRoot)

  const buildAutoMigration = () => {
    if (reinit_all_attrs) {
      return reinitAllAttrsAutoMigration(new_schema)
    }
    if (old_schema) {
      return makeAutomigration(old_schema, new_schema)
    }

    return null
  }

  const auto_migration = buildAutoMigration()

  if (runtime.dkt_storage != null) {
    runtime.dkt_storage.putSchema(new_schema)
  }

  runtime.calls_flow.input(() => {
    const isApiAttr = memorize((str) => str.startsWith('$meta$apis$') && str.endsWith('$used'))

    const initModelAttrs = (self, cur, auto_migration) => {
      /*
        1. add/remove new attrs in schema
        2. acknowledge apis where removed
      */

      const changes = []

      /*
      1.
      */
      const added_comp_attrs = auto_migration?.[self.model_name]?.added_comp_attrs
      if (added_comp_attrs) {
        calcProvidedCompList(self, added_comp_attrs, changes)
      }

      /*
      2
      */
      for (const attr_name in cur.attrs) {
        if (!Object.hasOwnProperty.call(cur.attrs, attr_name)) {
          continue
        }

        if (!isApiAttr(attr_name)) {
          continue
        }

        changes.push(attr_name, false)
      }

      if (!changes.length) {
        return
      }

      updateProxy(self, changes)
    }

    for (let i = 0; i < models_list.length; i++) {
      const cur = models_list[i]
      const self = runtime.models[cur.id]
      initModelAttrs(self, cur, auto_migration)
    }

  })

  runtime.calls_flow.input(() => {

    for (let i = 0; i < models_list.length; i++) {
      const cur = models_list[i]
      const self = runtime.models[cur.id]
      reinitOne(self)
    }

    const app = getById(APP_ROOT_ID)

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

      const app_model = getById(APP_ROOT_ID)

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
