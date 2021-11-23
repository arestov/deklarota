
import LocalWatchRoot from '../../nest-watch/LocalWatchRoot'

const RouteRunner = function(md, dcl) {
  this.dcl = dcl
  this.md = md

  this.matched = null // will be map: {}

  const nwbase = dcl.nwbase

  this.lnwatch = new LocalWatchRoot(md, nwbase, {
    route_runner: this,
  })
}

export default RouteRunner
