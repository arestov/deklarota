
function addrToLinks(rel_path, chain) {
  var list = []

  for (var i = 0; i < rel_path.length; i++) {
    var rel = rel_path[i]
    list.push(new MentionChainLink(chain, i, rel))
  }

  Object.freeze(list)

  return list
}

function MentionChainLink(chain, num, rel) {
  this.chain = chain
  this.num = num
  this.rel = rel
  Object.freeze(this)
}

function MentionChain(target_type, rel_path, target_matcher, addr, target_name) {
  this.target_matcher = target_matcher
  this.target_type = target_type
  this.addr = addr
  this.list = addrToLinks(rel_path, this)
  if (!target_name) {
    throw new Error('target_name should be provided')
  }
  this.target_name = target_name
  Object.freeze(this)
}


export default MentionChain
