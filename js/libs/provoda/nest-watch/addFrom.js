
import addRemove from './add-remove'
import getStartModel from './getStartModel'
const addRootNestWatch = addRemove.addRootNestWatch

export default function addFrom(target, lnest_watch) {
  const start_md = getStartModel(target, lnest_watch.nwatch)
  addRootNestWatch(start_md, lnest_watch)
}
