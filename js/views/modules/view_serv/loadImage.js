define(function(require) {
'use strict'
var spv = require('spv');
var $ = require('cash-dom');

var loadImage = (function() {
  var loaded_images = {};
  var images_callbacks = {};
  var addImageLoadCallback = function(url, cb) {
    if (!images_callbacks[url]){
      images_callbacks[url] = [];
    }
    images_callbacks[url].push(cb);
  };
  var removeImageLoadCallback = function(url, cb) {
    if (images_callbacks[url]){
      images_callbacks[url] = spv.arrayExclude(images_callbacks[url], cb);
    }
  };

  var triggerImagesCallback = function(url) {
    var array = images_callbacks[url];
    if (array){
      while (array.length){
        var cb = array.shift();
        cb.call();
      }
    }
  };

  return function(opts) {
    if (typeof opts.cache_allowed != 'boolean'){
      throw new Error('cache_allowed must be true or false');
    }
    //queue
    var stop = '';

    var done, accomplished, url = opts.url;
    var node = opts.node || new Image();
    var deferred = $.Deferred();

    var async_obj = deferred.promise({
      abort: function() {
        if (node){
          node.src = '';
        }

        if (this.queued){
          this.queued.abort();
        }
        unbindEvents();

        node = null;
        opts = null;
        stop = 'abort';
      }
    });
    var imageLoadCallback = function(){
      accomplishLoad();
    };

    var unbindEvents = function() {
      if (node) {
        spv.removeEvent(node, "load", loadCb);
        spv.removeEvent(node, "error", errorCb);
      }

      removeImageLoadCallback(url, imageLoadCallback);
    };
    var loadCb = function(e) {
      if (done){
        return;
      }
      done = true;
      deferred.resolve(node);
      unbindEvents();
      if (async_obj && async_obj.queued){
        async_obj.queued.abort();
      }
      if (async_obj.timeout_num){
        clearTimeout(async_obj.timeout_num);
      }
      if (e && e.type == 'load'){
        triggerImagesCallback(opts.url);
      }

      node = null;
      opts = null;
      stop = 'loaded';
    };
    var errorCb = function() {
      deferred.reject(node);
      unbindEvents();

      node = null;
      opts = null;
      stop = 'error';
    };

    spv.addEvent(node, "load", loadCb);
    spv.addEvent(node, "error", errorCb);


    var accomplishLoad = function() {
      if (accomplished){
        return;
      }
      accomplished = true;

      node.src = opts.url;
      if (node.complete){
        if (opts.cache_allowed){
          loaded_images[opts.url] = true;
        }
        loadCb();
      } else {
        if (opts.timeout){
          async_obj.timeout_num = setTimeout(function() {
            deferred.reject(node, 'timeout');
            unbindEvents();

            node = null;
            opts = null;

            stop = 'timeout';
          }, opts.timeout);
        }
      }
    };
    if (opts.queue && !loaded_images[opts.url]){
      addImageLoadCallback(opts.url, imageLoadCallback);
      async_obj.queued = opts.queue.add(accomplishLoad);

    } else {
      accomplishLoad();
    }
    return async_obj;
  };
})();
return loadImage
})
