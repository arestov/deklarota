
import $ from 'cash-dom'

const find = function(con, selector) {
  return $(con).find(selector)
}

const append = function(place, target) {
  $(place).append(target)
}

const prepend = function(place, target) {
  return $(place).prepend(target)
}

const after = function(place, target) {
  $(place).after(target)
}

const detach = function(target) {
  $(target).detach()
}

const before = function(place, comment_anchor) {
  $(place).before(comment_anchor)
}

const wrap = function(node) {
  return $(node)
}

const unwrap = function(wrapped) {
  if (!wrapped) {
    return null
  }

  if ('nodeType' in wrapped) {
    return wrapped
  }

  if ('length' in wrapped) {
    return wrapped[0]
  }

  return null
}

const parent = function(node) {
  return $(node).parent()
}


const getText = function(node) {
  return $(node).text()
}

const setText = function(node, value) {
  return $(node).text(value)
}

const remove = function(node) {
  return $(node).remove()
}

const prev = function(node) {
  return $(node).prev()
}

const is = function(one, two) {
  return $(one).is(two)
}

const width = function(node) {
  return $(node).width()
}

const offset = function(node) {
  return $(node).offset()
}

export default {
  find: find,
  append: append,
  prepend: prepend,
  after: after,
  detach: detach,
  before: before,
  wrap: wrap,
  unwrap: unwrap,
  parent: parent,
  getText: getText,
  setText: setText,
  remove: remove,
  prev: prev,
  is: is,
  width,
  offset,
}
