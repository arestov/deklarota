define(function(require) {
'use strict'
var getDepValue = require('../../utils/multiPath/getDepValue')
var saveResult = require('./targetedResult/save')
var noopForPass = require('./noop')
var now = require('./deps/now')

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


var getDep = function(md, dep, data) {
  if (dep === noopForPass) {
    return noopForPass
  }

  if (dep === now) {
    return now()
  }

  return getDepValue(md, dep, data)
}

var getDepsValues = function(md, deps, data) {
  if (deps == null) {
    return null
  }


  var args = new Array(deps.length)
  for (var i = 0; i < deps.length; i++) {
    var cur = deps[i]
    args[i] = getDep(md, cur, data)
  }

  return args
}

return function pass(md, pass_name, data) {
  var pass_handlers = md._extendable_passes_index
  if (!pass_handlers.hasOwnProperty(pass_name)) {
    throw new Error('missing pass ' + pass_name)
  }


  var dcl = pass_handlers[pass_name]

  var fn = dcl.fn
  var deps = dcl.deps

  var deps_values = getDepsValues(md, deps, data)
  var args = [data]
  if (deps_values) {
    Array.prototype.push.apply(args, deps_values)
  }

  var result = fn.apply(null, args)
  if (result === noopForPass) {
    return
  }

  saveResult(md, dcl, result, data)
}

})
