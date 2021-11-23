
import spv from '../../spv'
import isSpecialState from './isSpecialState'

export default function getShortStateName(state_path) {
  const enc = isSpecialState(state_path)
  return enc ? state_path : spv.getFieldsTree(state_path)[0]
}
