



HTML атрибуты для data-binding

- `dk-rel='services-list controller:service-card'`

  - отрендерит каждый элемент из `rel` `services-list`,
  - `<span dk-rel='services-list' class="nice-card" ></span>` отрендерится в 7 span, когда в services-list 7 элементов
  - `controller:service-card` позволяет использовать особенный Controller/View с которым будет связан отрендеренный DOM
  - `dk-rel='services-list for_model:Service'` отрендерит html только для модели, где `model_name: "Service"`
  - dk-rel создает новый `scope`, внутри которого декларации состояния и события связываются с соответствтующим элементом из rel

- `dk-class="mdc-tab--active: !selectedNav" dk-class="mdc-tab-indicator--active: {{!selectedNav}}"`

  - описывает как классы данного элемента связаны с состоянием, в {{}} можно писать сложные выражения используя операторы !,&&, ||, +, -, ?, :

- `dk-props="style.backgroundImage: {{'url(' + selectedIcon + ')'}}" dk-props="value:{{customUrl}}" `

  - описывает как DOM свойства ноды связаны с состоянием. чаще всего нужно для связывания с `<input>.value`, `<input>.checked` (и т.д.) `<div>.title`, `<img>.src`,

- `dk-text="{{name}}"` связывае node.textContent с состояни



- `dk-events` - описывает как обрабатывать события

  - есть два режима обработки - внутри view и напрямую в model (в том числе удаленную)

    - `click:` - обработка событий локально, внутри view. данные не попадают в `truth` state. обработчики должны быть объявлены в `tpl_events`. существую встроенные обработчики:
      - `requestPage`, `requestPageById`, `followTo`, `followURL`, `toggleSpyglass`, `updateSpyglass`
    - `click::` - обработка событий "удаленно" в модели (может применяться задержка на обработку), данные попадают напрямую в `truth` state.
      - есть два основных способа `click::dispatch:changeNav` и

  - dk-events="click::dispatch:changeNav:all" - отправит pass `changeNav` и data = `'all'` в модель, которой принадлежит данная view

  - dk-events="click:updateAttr:changeNav:all" обновит состояние `changeNav` в view на значение `all`

  - dk-events="click::^^^updateAttr:recipeId:%attrs%id" - отправит в качестве аргумента для updateState состояние id из локального контроллера. updateState будет отправлено в модель которой принаждлежит 3я view вверх по иерархии рендеринга

  - перед отправкой в обработчик можно собрать дополнительные данные: с помощью записи `:%attrs%id`. данные можно изьять из

    - состояния локальной view. через `:%attrs%some_attr`
    - свойства DOM event, `:%event%timestamp`
    - свойства DOM node, `:%node%value` (полезно при использовании с input), `:%node%!value` - работает как `!true` в js



  - чтобы создать два обработчика просто перечислите их через пробел: `dk-events="click::dispatch:setActive click::^dispatch:setActive">`






- ```
  <div
    dk-repeat="image in image_previews | limitTo: 13"
    >
  </div>
  ```

  работает по аналогии с nest но в качестве источника для повторения использует массив с обычного attr модели, а не nest. `{attrs: {image_previews: []}, rels:{'services-list': []}}`


```
<div dk-import="imp-area_for_button">
  <script type="dk-import-map">
    [
      {
        "imp-desc_item": "imp-desc_item-tag"
      },
      {
        "nav_title": "nav_title"
      },
      {
        "previews": [
          [{
            "title": "full_title"
          }],
          "songs"
        ]
      }
    ]
  </script>
</div>
```
