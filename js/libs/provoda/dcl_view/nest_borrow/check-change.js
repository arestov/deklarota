
import spv from '../../../spv'
var nil = spv.nil

function checkChange(target, nesname, items, old_value) {
  // пришли изменения одного nest. надо проверить существующие watch
  if (nil(target.nest_borrow_watchers)) {
    return
  }

  for (var i = 0; i < target.nest_borrow_watchers.list.length; i++) {
    // live changes. so we passing old_value
    checkNestingWatch(target, target.nest_borrow_watchers.list[i], nesname, items, old_value)
  }
}

function checkChildren(target, watch) {
  // создан один watch, надо проверить существующие nest
  // it's initialization. so we skipping old_value passing

  const children_models = target.mpx.__getRels()
  for (var i in children_models) {
    checkNestingWatch(target, watch, i, children_models[i])
  }
}


function checkNestingWatch(_target, watch, nesname, items, old_value) {
  if (watch.dcl.source_nesting_name !== nesname) {
    return
  }

  watch.view.collectionChange(watch.view, watch.dcl.name, items, old_value)
}

checkChange.checkChildren = checkChildren

export default checkChange
