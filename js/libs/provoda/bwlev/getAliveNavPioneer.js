import getNavParentForModelAtPerspectivator from './getNavParentForModelAtPerspectivator'
import isAvailableForNav from './isAvailableForNav'

const getAliveNavPioneer = (perspectivactor, pioneer) => {
  if (isAvailableForNav(pioneer)) {
    return pioneer
  }

  return getAliveNavPioneer(perspectivactor, getNavParentForModelAtPerspectivator(perspectivactor, pioneer))
}

export default getAliveNavPioneer
