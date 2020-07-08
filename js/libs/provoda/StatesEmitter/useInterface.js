define(function (require) {
'use strict';

var spv = require('spv');
var updateProxy = require('../updateProxy');
var pvUpdate = updateProxy.update;
var runOnApiAdded = require('../dcl/effects/legacy/subscribe/runOnApiAdded');
var runOnApiRemoved = require('../dcl/effects/legacy/subscribe/runOnApiRemoved');

var template = function () {
  return {
    used: {},
    binders: {
      indexes: {},

      /*
        value - true, когда есть все нужные api
        при смене value для state происходит bind.
        при value === false происходит unbind
      */
      values: {},
      removers: {}
    },
  };
};

var update = function(self, interface_name, value) {
  var name_for_used_legacy = '_api_used_' + interface_name
  var name_for_used_modern = '$meta$apis$' + interface_name + '$used'

  self._attrs_collector.defineAttr(name_for_used_legacy, 'bool')
  self._attrs_collector.defineAttr(name_for_used_modern, 'bool')

  pvUpdate(self, name_for_used_legacy, value);
  pvUpdate(self, name_for_used_modern, value);
}

var useInterface = function (self, interface_name, obj, destroy) {
  var using = self._interfaces_using;
  var old_interface = using && using.used[interface_name];
  if (obj === old_interface) {
    return;
  }

  if (!using) {
    using = self._interfaces_using = template();
  }

  var values_original = spv.cloneObj({}, using.binders.values);
  using.used[interface_name] = null;


  using = runOnApiRemoved(self, using, interface_name, values_original)
  self._interfaces_using = using

  if (old_interface && destroy) {
    destroy(old_interface)
  }

  if (!obj) {
    update(self, interface_name, false)
    return;
  }

  var values_original2 = spv.cloneObj({}, using.binders.values);
  using.used[interface_name] = obj;
  using = runOnApiAdded(self, using, interface_name, values_original2)
  self._interfaces_using = using

  update(self, interface_name, Date.now())

};

useInterface.skipAliveCheck = true

return function useInterfaceWrap(self, interface_name, obj, destroy) {
  self.nextTick(useInterface, [self, interface_name, obj, destroy], false, false)
}
});
