define(function(require) {
'use strict';
var d_parsers = require('./directives_parsers');
var getCachedPVData = require('./getCachedPVData');
var getTemplateOptions = require('./pv-import/getTemplateOptions');
// var patching_directives = d_parsers.patching_directives;
var patchPvWhen = require('./pv-when/patch')
var patchPvReplace = require('./pv-replace/patch')
var getIndexList = d_parsers.getIndexList;
var setStrucKey = getCachedPVData.setStrucKey;



var patching_directives = {
  'pv-import': (function(){
    var counter = 1;

    function createKey() {
      return counter++;
    }

    return function(node, params, getSample, opts) {
      var template_options = getTemplateOptions(params, createKey);
      var instance = getSample(params.sample_name, true, template_options);

      var parent_node = node.parentNode;
      parent_node.replaceChild(instance, node);

      return instance;
    };
  })(),
  'pv-when': patchPvWhen,
  'pv-replace': patchPvReplace,
};

var patching_directives_list = getIndexList(patching_directives);

var patchNode = function(node, struc_store, directives_data, getSample, opts) {
  var instructions = directives_data && directives_data.instructions;

  if (instructions) {
    if (instructions['pv-when'] && instructions['pv-nest']) {
      throw new Error('do not use pv-when and pv-nest on same node');
      /*
        1 - it's not osbiois what should be handled 1st
        2 - there is bug:
          when pv-when is true it appends node,
          pv-nest remove it. clone it.
          so when pv-when is false it tries to remove wrong node
      */
    }

  }

  for (var i = 0; i < patching_directives_list.length; i++) {
    var cur = patching_directives_list[i];
    if (!directives_data || !instructions[cur]) {
      continue;
    }
    // cur
    // node, params, getSample, opts
    var result = patching_directives[cur].call(null, node, instructions[cur], getSample, opts);
    if (!result) {
      return;
    }

    if (!result.directives_data && !result.pvprsd) {
      throw new Error('should be directives_data');
    }
    if (result.directives_data) {
      setStrucKey(result, struc_store, result.directives_data);
    }
    return result;
  }
};

return patchNode;
});
