

export default function initSi(Constr, parent_md, data) {
  if (Constr.prototype.conndst_parent && Constr.prototype.conndst_parent.length) {
    if (Constr.prototype.pconstr_id !== true && parent_md.constr_id !== Constr.prototype.pconstr_id) {
      console.log((new Error('pconstr_id should match constr_id')).stack)
    }
  }

  if (Constr.prototype.init) {
    throw new Error('bad initing way')
  }



  const opts = {
    _node_id: parent_md._highway.models_counters++,
    map_parent: parent_md || null,
    app: parent_md.app
  }

  const instancePure = new Constr(opts, data)


  return instancePure
};
