define(function(require) {
"use strict";

var spv = require('spv');
var parsePath = require('./routes/legacy/parse')
var pathExecutor = require('./routes/legacy/stringify')
var utils_simple = require('./utils/simple')

var getTargetField = spv.getTargetField

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

var getPath = pathExecutor(function(chunkName, app, md) {
  return md._provoda_id && md.state(chunkName);
});

var getPathBySimpleData = pathExecutor(function(chunkName, app, data) {
  return data && getTargetField(data, chunkName);
});

var followStringTemplate = function (app, md, obj, need_constr, full_path, strict, options, extra_states) {
  if (obj.from_root) {
    if (full_path === '') {
      // used just "#" as path
      return app;
    }

    // "#page/etc/etc"
    return app.routePathByModels(full_path, app.start_page, need_constr, strict, options, extra_states);
  }

  if (obj.from_parent) {
    // "^page/ect"
    var target_md_start = md;
    for (var i = 0; i < obj.from_parent; i++) {
      target_md_start = target_md_start.map_parent;
    }
    if (!full_path) {
      return target_md_start;
    }
    return app.routePathByModels(full_path, target_md_start, need_constr, strict, options, extra_states);
  }

  return app.routePathByModels(full_path, md, need_constr, strict, options, extra_states);
};

var executeStringTemplate = function(app, md, obj, need_constr, md_for_urldata) {
  var full_path = getPath(obj, app, md_for_urldata || md);
  return followStringTemplate(app, md, obj, need_constr, full_path);
};

var isFromRoot = function(first_char, string_template) {
  var from_root = first_char == '#';
  if (!from_root) {return;}

  return {
    cutted: string_template.slice( 1 )
  };
};

var parent_count_regexp = /^\^+/gi;
var isFromParent = function (first_char, string_template) {
  if (first_char != '^') {return;}

  var cutted = string_template.replace(parent_count_regexp, '');
  return {
    cutted: cutted,
    count: string_template.length - cutted.length
  };
};

var getParsedPath = spv.memorize(function(string_template) {
  //example "#tracks/[:artist],[:track]"
  //example "^^tracks/[:artist],[:track]"
  //example "^"
  var first_char = string_template.charAt(0);
  var from_root = isFromRoot(first_char, string_template);
  var from_parent = !from_root && isFromParent(first_char, string_template);

  var full_usable_string = from_root
    ? from_root.cutted
    : (from_parent
        ? from_parent.cutted
        : string_template);



  if (!full_usable_string && !from_parent && !from_root) {
    throw new Error('path cannot be empty');
  }

  var parsed = parsePath(full_usable_string)

  return {
    full_usable_string: full_usable_string,
    from_root: Boolean(from_root),
    from_parent: from_parent && from_parent.count,
    parsed: parsed,
  };
});


var getSPByPathTemplateAndData = function (app, start_md, string_template, need_constr, data, strict, options, extra_states) {
  var parsed_template = getParsedPath(string_template);
  var full_path = getPathBySimpleData(parsed_template, app, data);
  return followStringTemplate(app, start_md, parsed_template, need_constr, full_path, strict, options, extra_states);
};

var getSPByPathTemplate = function(app, start_md, string_template, need_constr, md_for_urldata) {
  var parsed_template = getParsedPath(string_template);
  return executeStringTemplate(app, start_md, parsed_template, need_constr, md_for_urldata);
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
      md.updateNesting(el.nesting_name, getSubpages( md, el ));
    }
    return
  }

  var init_func = function(state) {
    if (!state) {
      return
    }

    if (!this.getNesting(el.nesting_name)) {
      this.updateNesting(el.nesting_name, getSubpages( this, el ));
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

initDeclaredNestings.getParsedPath = getParsedPath;
initDeclaredNestings.getSubpages = getSubpages;
initDeclaredNestings.pathExecutor = pathExecutor;
initDeclaredNestings.executeStringTemplate = executeStringTemplate;


initDeclaredNestings.getConstrByPath = function(app, md, string_template) {
  return getSPByPathTemplate(app, md, string_template, true);
};
initDeclaredNestings.getSPByPathTemplate = getSPByPathTemplate;
initDeclaredNestings.getSPByPathTemplateAndData = getSPByPathTemplateAndData;

return initDeclaredNestings;
});
