
import spv from '../../spv'
import _getInterface from '../_internal/interfaces/_getInterface'
const startsWith = spv.startsWith

export default function getNetApiByDeclr(send_declr, sputnik, app) {
  const api_name = send_declr.api_name
  if (typeof api_name == 'function') {
    return api_name.call(sputnik)
  }

  if (typeof api_name !== 'string') {
    return
  }

  if (startsWith(api_name, '#')) {
    return _getInterface((app || sputnik.app), api_name.replace('#', ''))
  }

  return _getInterface(sputnik, api_name)
}
