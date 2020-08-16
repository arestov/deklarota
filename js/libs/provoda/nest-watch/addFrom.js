
var addRemove = require('./add-remove')
var addRootNestWatch = addRemove.addRootNestWatch
var getStartModel = require('./getStartModel')

export default function addFrom(target, lnest_watch) {
  var start_md = getStartModel(target, lnest_watch.nwatch)
  addRootNestWatch(start_md, lnest_watch)
};
