import looksLikeWrappedJSON from './utils/looksLikeWrappedJSON'
import { tryParse } from './match'

export const decodeValueChunk = (raw_value) => {
  const decoded = decodeURIComponent(raw_value)

  const unparsed = looksLikeWrappedJSON(decoded)
    ? tryParse(decoded)
    : decoded

  return unparsed
}
