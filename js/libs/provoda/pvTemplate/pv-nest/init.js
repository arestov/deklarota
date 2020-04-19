define(function(require) {
'use strict'
var PvSimpleSampler = require('../PvSimpleSampler');
var BnddChunk = require('../BnddChunk')

return function(node, data) {
  //coll_name for_model filter
  if (typeof data.coll_name == 'string'){
    var pv_view = {
      views: [],
      node: node,
      sampler: new PvSimpleSampler(node, this.struc_store, this.getSample),
      coll_name: data.coll_name,
      controller_name: data.controller_name,
      for_model: data.for_model,
      space: data.space,
      filterFn: data.filterFn,
      destroyers: null,
      onDie: function(cb) {
        if (!pv_view.destroyers) {
          pv_view.destroyers = [];
        }
        pv_view.destroyers.push(cb);
      }
    };
    return new BnddChunk('pv_view', pv_view);
  }
}
})
