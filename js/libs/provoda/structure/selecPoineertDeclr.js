
const sel_match_builders = [
  function(model_name, parent_space_name) {
    return model_name + '/' + parent_space_name
  },
  function(model_name) {
    return model_name
  },
  function(_model_name, parent_space_name) {
    return '/' + parent_space_name
  },
  function() {
    return ''
  },
]

export default function(dclrs_fpckgs, dclrs_selectors, nesting_name, model_name, parent_space_name, soft) {
  for (let i = 0; i < sel_match_builders.length; i++) {
    const key = sel_match_builders[i](model_name, parent_space_name)
    if (dclrs_selectors[nesting_name] && dclrs_selectors[nesting_name][key]) {
      const link = dclrs_selectors[nesting_name][key]
      if (link) {
        const dclr = dclrs_fpckgs[link]
        if (!soft && !dclr) {
          throw new Error('reffered dclr does not exist')
        }
        return dclr
      }

    }
  }
};
