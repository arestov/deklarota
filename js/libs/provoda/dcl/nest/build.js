
import structureChild from '../../structure/child'
import CompxAttrDecl from '../attrs/comp/item'
import { nestingMark } from '../effects/legacy/nest_req/nestingMark'
import ActionDcl from '../passes/dcl'
import initRelByDcl from './runtime/initRelByDcl'

const build = function(self, result) {
  self.nestings_declarations = []
  self.idx_nestings_declarations = result
  self._chi_nest = {}

  for (const name in result) {
    if (!result.hasOwnProperty(name)) {
      continue
    }
    const cur = result[name]
    if (!cur) {
      continue
    }
    self.nestings_declarations.push(cur)
    const item = cur.subpages_names_list
    if (Array.isArray(item)) {
      for (let kk = 0; kk < item.length; kk++) {
        const cur = item[kk]
        if (cur.type == 'constr') {
          self._chi_nest[item[kk].key] = structureChild(cur.name, cur.value, ['nest', 'nest'])
        }
      }
    } else {
      if (item.type == 'constr') {
        self._chi_nest[item.key] = structureChild(item.name, item.value, ['nest', 'nest'])
      }
    }
  }
}

export default build

const lockValue = (current_value, ext_value) => {
  return Boolean(current_value || ext_value)
}

const bool = 'bool'

/*
  should be used to init added rels.nest on app reinit
*/
export const $attrs$from_autoinited_rels$ = [
  ['_nest_by_type_listed'],
  (by_type) => {
    if (!by_type.nest) {
      return undefined
    }

    const result = {}
    for (let i = 0; i < by_type.nest.length; i++) {
      const cur = by_type.nest[i]
      result[nestingMark(cur.nesting_name, 'autoinited')] = false
    }

    return result
  }
]

export const $rels$idle = [
  ['_nest_by_type_listed'],
  (by_type) => {
    if (!by_type.nest) {
      return undefined
    }

    const attrs = {}
    const actions = {}

    for (let i = 0; i < by_type.nest.length; i++) {
      const cur = by_type.nest[i]
      if (!cur.idle_until) {
        continue
      }

      const infra_attr_name = `$meta$idle_rel$${cur.name}$ready`
      const infra_attr = new CompxAttrDecl(infra_attr_name, [
        [cur.idle_until],
        lockValue,
        bool
      ])

      const actionName = `handleAttr:${infra_attr_name}`

      const many = Array.isArray(cur.subpages_names_list)
        ? 'set_many'
        : 'set_one'

      const action = new ActionDcl(actionName, {
        to: {
          rel: [`<< ${cur.name}`, {method: many}],
          rel_mark: [nestingMark(cur.name, 'autoinited')],
        },
        fn: [
          ['$noop', '<<<<', `<< @notEmpty:${cur.name}`],
          ({next_value}, noop, self, inited) => {
            if (!next_value || inited) {
              return noop
            }

            return {
              rel: initRelByDcl(self, cur),
              rel_mark: true,
            }
          }

        ]
      })

      attrs[infra_attr_name] = infra_attr
      actions[actionName] = action
    }

    return {
      attrs,
      actions,
    }
  }
]

export const $comp_attrs$derived$from_idle_rels = [
  ['$rels$idle'],
  (idle_rels) => idle_rels?.attrs
]


export const $actions$derived$from_idle_rels = [
  ['$rels$idle'],
  (idle_rels) => idle_rels?.actions
]
