define(function(require) {
"use strict";

var _updateRel = require('_updateRel');

var pathExecutor = require('./routes/legacy/stringify')
var getSPByPathTemplate = require('./routes/legacy/getSPByPathTemplate')

var preloadStart = function (md) {
  md.preloadStart();
};

var executePreload = function(md, nesting_name) {
  var lists_list = md.getNesting(nesting_name);

  if (!lists_list) {return;}
  if (Array.isArray(lists_list)) {
    for (var i = 0; i < lists_list.length; i++) {
      var cur = lists_list[i];
      if (cur.preloadStart){
        md.useMotivator(cur, preloadStart);
      }

    }
  } else {
    if (lists_list.preloadStart){
      md.useMotivator(lists_list, preloadStart);
    }
  }
};


//если есть состояние для предзагрузки
//если изменилось гнездование

var bindPreload = function(md, preload_state_name, nesting_name) {
  md.lwch(md, preload_state_name, function(state) {
    if (state) {
      executePreload(md, nesting_name);
    }
  });
};

var getSubPByDeclr = function(md, cur) {
  if (cur.type == 'route') {
    return getSPByPathTemplate(md.app, md, cur.value);
  } else {
    var constr = md._all_chi[cur.key];
    return md.initSi(constr);
  }
};

var getSubpages = function(md, el) {
  var array = el.subpages_names_list;
  var result;
  if (Array.isArray( array )) {
    result = new Array(array);
    for (var i = 0; i < array.length; i++) {
      result[i] = getSubPByDeclr(md, array[i]);
    }
  } else {
    result = getSubPByDeclr(md, array);
  }
  return result;
};

var initOneDeclaredNesting = function(md, el) {
  /*
  nesting_name
  subpages_names_list
  preload
  idle_until


  subpages_names_list: ...cur[0]...,
  preload: cur[1],
  idle_until: cur[2]
  */

  if (el.preload_on) {
    bindPreload(md, el.preload_on, el.nesting_name);
  }


  if (!el.idle_until) {
    if (!md.getNesting(el.nesting_name)) {
      _updateRel(md, el.nesting_name, getSubpages( md, el ));
    }
    return
  }

  var init_func = function(state) {
    if (!state) {
      return
    }

    if (!this.getNesting(el.nesting_name)) {
      _updateRel(this, el.nesting_name, getSubpages( this, el ));
    }

    if (el.preload_on && this.state(el.preload_on)) {
      executePreload(this, el.nesting_name);
    }

    md.removeLwch(md, el.idle_until, init_func)
  };

  md.lwch(md, el.idle_until, init_func)

};

var initDeclaredNestings = function(md) {
  for (var i = 0; i < md.nestings_declarations.length; i++) {
    initOneDeclaredNesting(md, md.nestings_declarations[i]);
  }
};

initDeclaredNestings.getSubpages = getSubpages;
initDeclaredNestings.pathExecutor = pathExecutor;


initDeclaredNestings.getConstrByPath = function(app, md, string_template) {
  return getSPByPathTemplate(app, md, string_template, true);
};

return initDeclaredNestings;
});
