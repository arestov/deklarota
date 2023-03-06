import usedInterfaceAttrName from './usedInterfaceAttrName'
import { createAddrByPart } from '../../utils/multiPath/parse'
import createUpdatedAddr from '../../utils/multiPath/createUpdatedAddr'
import multiPathAsString from '../../utils/multiPath/asString'
import ApiEffectDeclr from './legacy/produce/dcl'
import followRelPath from '../../followRelPath'

const models_base_addr = Object.freeze(createAddrByPart({
  zip_name: 'one',
  nesting: { path: [ '$root' ], base: [], target_nest_name: '$root' },
}))

const views_base_addr = createAddrByPart({
  nesting: Object.freeze({
    path: ['$v_root'],
    base: [],
    target_nest_name: '$v_root',
  })
})

const getInstance = (self, base_addr, isView) => {
  if (!isView) {
    return self.readAddr(base_addr)
  }
  return followRelPath(self, base_addr.nesting.path)
}

export const __dcls_extended_fxs = [
  ['__dcls_list_api_to_connect', '__isView'],
  (apis_list, isView) => {
    /*
      connects api from root model to local model
    */

    if (!apis_list) {
      return
    }

    const result = {}

    const base_addr = isView ? views_base_addr : models_base_addr

    for (let i = 0; i < apis_list.length; i++) {
      const api_name = apis_list[i]
      const remote_api_mark_addr = createUpdatedAddr(base_addr, {
        state: usedInterfaceAttrName(api_name),
        zip_name: 'one',
      })

      const outtask = new ApiEffectDeclr(`__connect_api_${api_name}`, {
        api: ['self'],
        trigger: [ multiPathAsString(remote_api_mark_addr)],
        require: ['_node_id'],
        create_when: {
          api_inits: true,
        },
        fn: (self, { value }) => {
          const instance = getInstance(self, base_addr, isView)
          const source_api = value ? instance.getInterface(api_name) : null

          self.useInterface(`#${api_name}`, source_api)
        },
      })

      result[outtask.name] = outtask
    }

    return result
  }
]
