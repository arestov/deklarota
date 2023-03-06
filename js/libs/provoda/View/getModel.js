

export default function getModel(view, _node_id) {
  if (!view._highway.views_proxies) {
    return view._highway.sync_r.models_index[_node_id]
  }

  const proxies_space = view.proxies_space || view.root_view.proxies_space
  const mpx = view._highway.views_proxies.spaces[proxies_space].mpxes_index[_node_id]
  return mpx.md
};
