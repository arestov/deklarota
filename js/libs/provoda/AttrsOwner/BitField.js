
// https://github.com/fb55/bitfield

function getByteSize(num) {
  let out = num >> 3
  if (num % 8 !== 0) {out++}
  return out
}

function BitField(data_raw, opts) {
  const data = data_raw == null ? 0 : data_raw
  const grow = opts != null && opts.grow
  this.grow = (grow && isFinite(grow) && getByteSize(grow)) || grow || 0
  this.buffer = typeof data === 'number' ? new Uint8Array(getByteSize(data)) : data
  Object.seal(this)
}

BitField.prototype = {

  get: function(i) {
    const j = i >> 3
    return (j < this.buffer.length) &&
      !!(this.buffer[j] & (128 >> (i % 8)))
  },

  set: function(i, b_raw) {
    const b = b_raw == null ? true : b_raw

    const j = i >> 3
    if (b) {
      if (this.buffer.length < j + 1) {
        const length = Math.max(j + 1, Math.min(2 * this.buffer.length, this.grow))
        if (length <= this.grow) {
          const newBuffer = new Uint8Array(length)
          newBuffer.set(this.buffer)
          this.buffer = newBuffer
        }
      }
      // Set
      this.buffer[j] |= 128 >> (i % 8)
    } else if (j < this.buffer.length) {
      // Clear
      this.buffer[j] &= ~(128 >> (i % 8))
    }
  }
}

export default BitField
