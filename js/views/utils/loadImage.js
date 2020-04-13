define(function (require) {
'use strict';
var loadImageS = require('view_serv/loadImage');

return function loadImage(view, opts) {
  var root_view = view.root_view;
  if (!opts.url) {return;}

  var queue;
  if (opts.url.indexOf('last.fm') != -1){
    queue = root_view.lfm_imgq;
  } else if (opts.url.indexOf('discogs.com') != -1) {
    queue = root_view.dgs_imgq;
  } else if (opts.url.indexOf('http://s.pixogs.com') != -1) {
    queue = root_view.dgs_imgq_alt;
  }

  opts.timeout = opts.timeout || 40000;
  opts.queue = opts.queue || queue;

  return loadImageS(opts);
};
})
