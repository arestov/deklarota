
import utils from '../utils'
import getAttrsOfRequestStates from './getAttrsOfRequestStates'

const SendDeclaration = utils.SendDeclaration
const toSchemaFn = utils.toSchemaFn

export default function StateReqMap(num, req_item) {
  this.name = req_item.name || 'default_attrs_request_name'
  this.num = num
  this.state_dep = '__$can_load_req_map_' + this.name
  this.dependencies = null
  this.send_declr = null
  this.states_list = null
  this.boolean_attrs = Array.prototype
  this.parse = null

  if (!Array.isArray(req_item)) {
    this.parse = toSchemaFn(req_item.parse)
    this.states_list = req_item.states
    getAttrsOfRequestStates(this)
    this.dependencies = req_item.fn[0]
    this.send_declr = new SendDeclaration([req_item.api, req_item.fn])
    return
  }

  const relations = req_item[0]
  if (Array.isArray(relations[0])) {
    throw new Error('wrong')
  } else {
  }

  this.states_list = relations
  getAttrsOfRequestStates(this)

  this.parse = toSchemaFn(req_item[1])
  const send_declr = req_item[2]

  if (!Array.isArray(send_declr[0])) {
    this.send_declr = new SendDeclaration(send_declr)
  } else {
    this.dependencies = send_declr[0]
    this.send_declr = new SendDeclaration(send_declr[1])
  }
}
