
function addrToLinks(rel_path, chain) {
  var list = []

  for (var i = 0; i < rel_path.length; i++) {
    var rel = rel_path[i]
    list.push(new MentionChainLink(chain, i, rel))
  }

  return list
}

function MentionChainLink(chain, num, rel) {
  this.chain = chain
  this.num = num
  this.rel = rel
  Object.freeze(this)
}

function MentionChain(target, target_type, addr, target_name) {
  this.target_mc = target
  this.target_type = target_type
  this.addr = addr
  this.list = addrToLinks(addr.nesting.path, this)
  this.target_name = target_name || ''
  Object.freeze(this)
}


export default MentionChain
