
import matchChainsByLink from './matchChainsByLink'

export default function deliverRelQueryUpdates(self, rel_name) {
  var skeleton = self.__global_skeleton
  if (skeleton == null && self.view_id != null) {
    return
  }

  var list = skeleton.chains_by_rel[rel_name]

  if (list == null) {
    return
  }

  matchChainsByLink(self, list)
}
