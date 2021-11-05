import matchChainsByLink from './matchChainsByLink'

const checkLightRelQueries = (self, rel_name) => {
  const skeleton = self.__global_skeleton

  var list = skeleton.chains_by_rel[rel_name]

  if (list == null) {
    return
  }

  matchChainsByLink(self, list)
}

export default function deliverRelQueryUpdates(self, rel_name) {
  var skeleton = self.__global_skeleton
  if (skeleton == null && self.view_id != null) {
    return
  }

  checkLightRelQueries(self, rel_name)

}
