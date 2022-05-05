

export default function initSi(Constr, parent_md, data) {
  if (Constr.prototype.conndst_parent && Constr.prototype.conndst_parent.length) {
    if (Constr.prototype.pconstr_id !== true && parent_md.constr_id !== Constr.prototype.pconstr_id) {
      console.log((new Error('pconstr_id should match constr_id')).stack)
    }
  }

  if (Constr.prototype.init) {
    throw new Error('bad initing way')
    const instance = new Constr()
    const initsbi_opts = parent_md.getSiOpts()


    return instance
  }

  const motivator = parent_md.current_motivator

  const parent_is_usable = ((parent_md && parent_md.zero_map_level) || parent_md != parent_md.app)

  const opts = {
    _motivator: motivator || null,
    map_parent: parent_is_usable ? parent_md : null,
    app: parent_md.app
  }

  const instancePure = new Constr(opts, data)

  instancePure.current_motivator = null

  return instancePure
};
