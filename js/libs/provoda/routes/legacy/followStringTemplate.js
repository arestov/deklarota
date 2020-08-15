define(function() {
'use strict'

var followStringTemplate = function(app, md, obj, need_constr, full_path, strict, options, extra_states) {
  if (obj.from_root) {
    if (full_path === '') {
      // used just "#" as path
      return app
    }

    // "#page/etc/etc"
    return app.routePathByModels(full_path, app.start_page, need_constr, strict, options, extra_states)
  }

  if (obj.from_parent) {
    // "^page/ect"
    var target_md_start = md
    for (var i = 0; i < obj.from_parent; i++) {
      target_md_start = target_md_start.map_parent
    }
    if (!full_path) {
      return target_md_start
    }
    return app.routePathByModels(full_path, target_md_start, need_constr, strict, options, extra_states)
  }

  return app.routePathByModels(full_path, md, need_constr, strict, options, extra_states)
}

return followStringTemplate
})
