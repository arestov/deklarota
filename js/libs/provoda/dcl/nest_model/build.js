define(function(require) {
'use strict'
var structureChild = require('../../structure/child')
var nestModelKey = require('./nestModelKey')

var spv = require('spv')
var build = function(self, nest_rqc) {
  self._chi_nest_rqc = {};
  self._nest_rqc = spv.cloneObj({}, nest_rqc);

  for (var name in nest_rqc) {
    if (!nest_rqc.hasOwnProperty(name)) {
      continue;
    }

    var key = nestModelKey(name)
    var cur = nest_rqc[name];
    if (cur) {

      self._nest_rqc[name] = cur;
      if (cur.type == 'constr') {
        self._chi_nest_rqc[cur.key] = structureChild(name, cur.value, 'nest-model');
      } else {
        self._chi_nest_rqc[key] = null;
      }

    } else {
      self._chi_nest_rqc[key] = null;
      self._nest_rqc[name] = null;
    }
  }
}

return build;
});
