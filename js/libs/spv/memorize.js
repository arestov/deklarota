define(function() {
'use strict'
return function memorize(func, getter) {
  var cache = new Map();
  return getter ? function chechCacheByGetter(){
    var key = getter.apply(this, arguments);
    if (!cache.has(key)) {
      var result = func.apply(this, arguments);
      cache.set(key, result)
      return result;
    }
    return cache.get(key);
  } : function checkCache(key) {
    if (!cache.has(key)) {
      var result = func.apply(this, arguments);
      cache.set(key, result)
      return result;
    }
    return cache.get(key);
  };
};

})
