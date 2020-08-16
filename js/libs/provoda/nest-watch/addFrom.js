
import addRemove from './add-remove'
var addRootNestWatch = addRemove.addRootNestWatch
import getStartModel from './getStartModel'

export default function addFrom(target, lnest_watch) {
  var start_md = getStartModel(target, lnest_watch.nwatch)
  addRootNestWatch(start_md, lnest_watch)
}
