
import getAllOnwers from './getAllOnwers'
import scheduleDelivering from './scheduleDelivering'

export default function deliverAttrQueryUpdates(self, attr_name) {

  const skeleton = self.__global_skeleton
  if (skeleton == null && self.view_id != null) {
    return
  }

  if (self.__mentions_as_rel == null) {
    return
  }

  const list = skeleton.chains_by_attr[attr_name]

  if (list == null) {
    return
  }


  const result = []

  for (let i = 0; i < list.length; i++) {
    const link = list[i]
    const owners = self.__mentions_as_rel[link.rel]
    if (owners == null) {
      continue
    }
    for (const owner of owners) {
      getAllOnwers(result, owner, link)
    }
  }

  scheduleDelivering(self, result)
}
