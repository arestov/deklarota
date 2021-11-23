
import getDepValue from '../../utils/multiPath/getDepValue'
import saveResult from './targetedResult/save'
import noopForPass from './noop'
import now from './deps/now'

/* EXEC

1. один результат, адресат результата определен, обычное указание адресата
1.1 один результат, адресат результата определен "*" способом указания, обычное указание адресата
2. множественный результат, адресат результатов определен, обычное указание адресата
3. множественный результат - ответ пропускается
4. множественный результат, не обычное, а указание адресата через аргумент
5. один результат, адресат результата nesting определен любым способом типа записи nesting, обычное указание адресата

*/

/* PLAN


#КУДА ПИСАТЬ
### ожидаемый результат
  #### кол-во
  - обычный
  - множественный

  #### определённость
  - указанный
  - неопределенный (*) - сделать потом

  #### способ поиска места для записи
  - обычный
  - через аргумент - сделать потом

*/

/*
#АРГУМЕНТЫ ДЛЯ ОБРАБОТЧИКА
  собрать зависимости
    специальный аргумент для получения модели по id - $ (будет работать, но запрещен. сделать потом)
    перемножающиеся nestings
    динамические пути в resource part
*/


const getDep = function(md, dep, data) {
  if (dep === noopForPass) {
    return noopForPass
  }

  if (dep === now) {
    return now()
  }

  return getDepValue(md, dep, data)
}

const getDepsValues = function(md, deps, data) {
  if (deps == null) {
    return null
  }


  const args = new Array(deps.length)
  for (let i = 0; i < deps.length; i++) {
    const cur = deps[i]
    args[i] = getDep(md, cur, data)
  }

  return args
}

export default function pass(md, pass_name, data) {
  const pass_handlers = md._extendable_passes_index
  if (!pass_handlers.hasOwnProperty(pass_name)) {
    throw new Error('missing pass ' + pass_name)
  }


  const dcl = pass_handlers[pass_name]

  const fn = dcl.fn
  const deps = dcl.deps

  const deps_values = getDepsValues(md, deps, data)
  const args = [data]
  if (deps_values) {
    Array.prototype.push.apply(args, deps_values)
  }

  const result = fn.apply(null, args)
  if (result === noopForPass) {
    return
  }

  saveResult(md, dcl, result, data)
}
