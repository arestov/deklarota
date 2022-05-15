import getModelById from '../libs/provoda/utils/getModelById'
import MentionChain from '../libs/provoda/Model/mentions/MentionChain'
import target_types from '../libs/provoda/Model/mentions/target_types'
import addHeavyRelQuery from '../libs/provoda/Model/mentions/heavy_queries/addHeavyRelQuery'
import removeHeavyRelQuery from '../libs/provoda/Model/mentions/heavy_queries/removeHeavyRelQuery'
import { getNestInfo } from '../libs/provoda/utils/multiPath/parse'
import { REL_QUERY_TYPE_REL } from './handleExpectedRelChange'

const { TARGET_TYPE_HEAVY_REQUESTER } = target_types

const setChain = (self, expected_rel_entry, chain) => {
  if (!self._highway.expected_rels_to_chains) {
    self._highway.expected_rels_to_chains = new Map()
  }
  self._highway.expected_rels_to_chains.set(expected_rel_entry.id, chain)
}

const deleteChain = (self, expected_rel_entry) => {
  self._highway.expected_rels_to_chains.delete(expected_rel_entry.id)
}

const getChain = (self, expected_rel_entry) => {
  if (!self._highway.expected_rels_to_chains) {return null}

  return self._highway.expected_rels_to_chains.get(expected_rel_entry.id)
}

const handleCurrentExpectedRel = (self, data) => {
  if (data.prev_value) {
    const { current_md_id } = data.prev_value
    const current_md = getModelById(self, current_md_id)
    const chain = getChain(self, data.prev_value)
    if (chain) {
      deleteChain(self, data.prev_value)
      removeHeavyRelQuery(current_md, chain)
    } else {
      console.error('missing chain for', {expected_rel_entry: data.prev_value})
    }
  }

  if (data.next_value) {
    const { current_md_id, rel_path: rel_path_str } = data.next_value
    const rel_info = getNestInfo(rel_path_str)
    const rel_path = rel_info.path
    const current_md = getModelById(self, current_md_id)
    const chain = new MentionChain(
      TARGET_TYPE_HEAVY_REQUESTER,
      rel_path,
      current_md,
      null,
      null, // it's fake sting, just to pass validation

      /*
        why is this handler is separate from TARGET_TYPE_HEAVY_REQUESTER/deliverChainUpdates?
        handleExpectedRelChange contain logic related to router,
        but i want to keep TARGET_TYPE_HEAVY_REQUESTER kinda universal for now
        (so importing handleExpectedRelChange to deliverChainUpdates will make TARGET_TYPE_HEAVY_REQUESTER less universal)
      */
      {data: data.next_value, handler_type: REL_QUERY_TYPE_REL},
    )

    setChain(self, data.next_value, chain)

    addHeavyRelQuery(current_md, chain)
  }
}

export default handleCurrentExpectedRel
