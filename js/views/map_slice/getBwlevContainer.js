import getLevByBwlev from './getLevelContainer'

const getBwlevContainer = function(perspectivator_view, bwlev, view) {
  const lev_conj = getLevByBwlev(perspectivator_view, bwlev, view.nesting_space == 'detailed')
  view.wayp_scan_stop = true
  return lev_conj.material
}

export default getBwlevContainer
