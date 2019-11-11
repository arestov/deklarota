define(function() {
'use strict';

var nestConstructor = function(key, item) {
  if (typeof item == 'string') {
    return {
      type: 'route',
      value: item
    };
  } else {
    return {
      type: 'constr',
      value: item,
      key: key
    };
  }
};

var declarationConstructor = function(key, cur) {
  if (Array.isArray(cur)) {
    var result = [];
    for (var i = 0; i < cur.length; i++) {
      result[i] = nestConstructor(key + '-' + i, cur[i]);
    }
    return result;
  } else {
    return nestConstructor(key, cur);
  }
};

return {
  nestConstructor: nestConstructor,
  declarationConstructor: declarationConstructor
};
});
