define(function() {
'use strict'

return function getAllOnwers(mut_result_list, mention_owner, link) {
  var cur_link = link

  if (cur_link.num == 0) {
    if (cur_link.chain.target_mc == mention_owner.constructor.prototype) {
      mut_result_list.push({
        mention_owner: mention_owner,
        link: cur_link,
      })
    }
    return
  }

  if (mention_owner.__mentions_as_rel == null) {
    return
  }

  var next_link = cur_link.chain.list[cur_link.num - 1]

  var owners = mention_owner.__mentions_as_rel[next_link.rel]
  if (owners == null) {
    return
  }


  for (var cur_owner of owners) {
    getAllOnwers(mut_result_list, cur_owner, next_link)
  }

  return mut_result_list
}

})
