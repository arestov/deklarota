const _initSubscribeRuntime = (runtime) => {
  runtime._subscribe_effect_handlers = null
  runtime.__interfaces_to_subscribers_removers_by_name_by_node_id = new Map()
}

export default _initSubscribeRuntime
