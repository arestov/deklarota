
import BrowseMap from './libs/BrowseMap'

export default function initBrowsing(app, states) {
  const bwroot = BrowseMap.hookRoot(app, app.start_page, states)
  if (app.legacy_app) {
    throw new Error('refactor to use modern routing & remove matchNav if you have')
  }
  return bwroot
}
