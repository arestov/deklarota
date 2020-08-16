

export default function(parent_view, nesting_name, nesting_space) {
  if (!nesting_name) {
    throw new Error('no nesting_name')
  }
  /*
    check perfomance:
    1 create ID for nesting_name, nesting_space combo
    2 save full concat result to  parent_view.child_location_cache
  */
  /*
  помогает определить есть ли у модели вьюха, ассоциированная с локацией - с родительской вьюхой (а также с гнездом внутри родительской вьюхи)

  */
  return parent_view.view_id + ':' + nesting_space + ':' + nesting_name
};
