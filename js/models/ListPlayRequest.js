define(function(require) {
'use strict';
var spv = require('spv');
var PlayRequest = require('./PlayRequest')

return spv.inh(PlayRequest, {}, {
  rels: {
    wanted_song: [
      'compx',
      ['<< @one:wanted_playlist.possible_playlist_song'],
    ],
  },
})
})
