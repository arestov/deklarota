import getModelById from '../libs/provoda/utils/getModelById'
import MentionChain from '../libs/provoda/Model/mentions/MentionChain'
import target_types from '../libs/provoda/Model/mentions/target_types'
import addHeavyRelQuery from '../libs/provoda/Model/mentions/heavy_queries/addHeavyRelQuery'
import { getNestInfo } from '../libs/provoda/utils/multiPath/parse'
import handleExpectedRelChange from './handleExpectedRelChange'

const { TARGET_TYPE_HEAVY_REQUESTER } = target_types

const handleCurrentExpectedRel = (self, data) => {
  if (data.prev_value) {
    console.log('should remove heavy query')
  }

  if (data.next_value) {
    const { current_mp_md_id, rel_path: rel_path_str } = data.next_value
    const rel_info = getNestInfo(rel_path_str)
    const rel_path = rel_info.path
    const current_md = getModelById(self, current_mp_md_id)
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
      {data: data.next_value, handler: handleExpectedRelChange},
    )

    addHeavyRelQuery(current_md, chain)
  }
}

export default handleCurrentExpectedRel
