
var LocalWatchRoot = require('../../nest-watch/LocalWatchRoot')

var RouteRunner = function(md, dcl) {
  this.dcl = dcl
  this.md = md

  this.matched = null // will be map: {}

  var nwbase = dcl.nwbase

  this.lnwatch = new LocalWatchRoot(md, nwbase, {
    route_runner: this,
  })
}

export default RouteRunner
