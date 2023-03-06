

export default function watcherKey(name, target_view) {
  return name + target_view.mpx.md._node_id + target_view.location_name
};
