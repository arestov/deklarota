
import scheduleDelivering from './scheduleDelivering'
import getAllOnwers from './getAllOnwers'


const matchChainsByLink = function(mention_owner, links) {
  const result = []
  for (let i = 0; i < links.length; i++) {
    getAllOnwers(result, mention_owner, links[i])
  }

  const motivation_model = mention_owner

  scheduleDelivering(motivation_model, result)

  return result
}


export default matchChainsByLink
