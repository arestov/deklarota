const isAvailableForNav = (pioneer) => {
  const ok = pioneer.getAttr('prpt_navigation_available')
  if (ok != null) {
    return ok
  }

  return !pioneer.getAttr('$meta$removed')
}

export default isAvailableForNav
