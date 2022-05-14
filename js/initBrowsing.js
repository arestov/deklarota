
import { hookSessionRoot } from './libs/provoda/provoda/BrowseMap'

export default function initBrowsing(app, states) {
  const bwroot = hookSessionRoot(app, app.start_page, states)
  if (app.legacy_app) {
    throw new Error('refactor to use modern routing & remove matchNav if you have')
  }
  return bwroot
}
