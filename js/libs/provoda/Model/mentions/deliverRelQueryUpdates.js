import matchChainsByLink from './matchChainsByLink'
import checkHeavyRelQueries from './heavy_queries/checkHeavyRelQueries'

const checkLightRelQueries = (self, rel_name) => {
  const skeleton = self.__global_skeleton

  const list = skeleton.chains_by_rel[rel_name]

  if (list == null) {
    return
  }

  matchChainsByLink(self, list)
}

export default function deliverRelQueryUpdates(self, rel_name) {
  const skeleton = self.__global_skeleton
  if (skeleton == null && self.view_id != null) {
    return
  }

  /*
    light is 1 chain per constructor, so chain shared between istances
    heavy is 1 chain per instance, so many instances -> many chains
  */

  checkLightRelQueries(self, rel_name)

  checkHeavyRelQueries(self, rel_name)
}
