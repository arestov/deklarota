define(function() {
'use strict'
// https://github.com/fb55/bitfield

function getByteSize (num) {
  var out = num >> 3
  if (num % 8 !== 0) {out++}
  return out
}

function BitField (data_raw, opts) {
  var data = data_raw == null ? 0 : data_raw
  var grow = opts != null && opts.grow
  this.grow = (grow && isFinite(grow) && getByteSize(grow)) || grow || 0
  this.buffer = typeof data === 'number' ? new Uint8Array(getByteSize(data)) : data

}

BitField.prototype = {

  get: function(i) {
    var j = i >> 3
    return (j < this.buffer.length) &&
      !!(this.buffer[j] & (128 >> (i % 8)))
  },

  set: function (i, b_raw) {
    var b = b_raw == null ? true : b_raw

    var j = i >> 3
    if (b) {
      if (this.buffer.length < j + 1) {
        var length = Math.max(j + 1, Math.min(2 * this.buffer.length, this.grow))
        if (length <= this.grow) {
          var newBuffer = new Uint8Array(length)
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

return BitField
})
