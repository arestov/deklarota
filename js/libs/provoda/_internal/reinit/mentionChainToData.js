const mentionChainLinkToData = (item) => {
  const { rel } = item
  return rel
}

export const mentionChainToData = (value) => {
  return {
    target_type: value.target_type,
    rel_path: value.list.map(mentionChainLinkToData),
    target_matcher: value.target_matcher._provoda_id,
    addr: value.addr,
    target_name: value.target_name,
    handler_payload: value.handler_payload,
  }
}
