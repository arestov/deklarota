

function ba_inUse(bwlev) {
  return bwlev.state('mp_show')
}

function ba_isOpened(bwlev) {
  return !!bwlev.map && !bwlev.closed
}



function ba_canReuse(bwlev) {
  //если модель прикреплена к карте
  return bwlev && (ba_inUse(bwlev) || !ba_isOpened(bwlev))
}

ba_canReuse.ba_inUse = ba_inUse


export default ba_canReuse
