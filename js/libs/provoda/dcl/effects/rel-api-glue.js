import usedInterfaceAttrName from './usedInterfaceAttrName'
import { createAddrByPart } from '../../utils/multiPath/parse'
import createUpdatedAddr from '../../utils/multiPath/createUpdatedAddr'
import multiPathAsString from '../../utils/multiPath/asString'
import ApiEffectDeclr from './legacy/produce/dcl'

export const __dcls_extended_fxs = [
  ['__dcls_list_api_to_connect'],
  (apis_list) => {

    /*
      connects api from root model to local model
    */

    const result = {}

    for (let i = 0; i < apis_list.length; i++) {
      const api_name = apis_list[i]
      const base_addr = createAddrByPart({ from_base: {
        type: 'root',
        steps: null
      }})
      const remote_api_mark_addr = createUpdatedAddr(base_addr, { state: usedInterfaceAttrName(api_name) })

      const outtask = new ApiEffectDeclr(`__connect_api_${api_name}`, {
        api: ['self'],
        trigger: [ multiPathAsString(remote_api_mark_addr)],
        require: ['_provoda_id'],
        create_when: {
          api_inits: true,
        },
        fn: (self, { value }) => {
          const source_api = value ? (self.readAddr(base_addr)).getInterface(api_name) : null

          self.useInterface(`#${api_name}`, source_api)
        },
      })

      result[outtask.name] = outtask
    }

    return result
  }
]
