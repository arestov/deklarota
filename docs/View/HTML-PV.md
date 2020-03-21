



HTML атрибуты для data-binding

- `pv-nest='services-list controller:service-card'`

  - отрендерит каждый элемент из `nest` `services-list`,
  - `<span pv-nest='services-list' class="nice-card" ></span>` отрендерится в 7 span, когда в services-list 7 элементов
  - `controller:service-card` позволяет использовать особенный Controller/View с которым будет связан отрендеренный DOM
  - `pv-nest='services-list for_model:Service'` отрендерит html только для модели, где `model_name: "Service"`
  - pv-nest создает новый `scope`, внутри которого декларации состояния и события связываются с соответствтующим элементом из nest

- `pv-class="mdc-tab--active: !selectedNav" pv-class="mdc-tab-indicator--active: {{!selectedNav}}"`

  - описывает как классы данного элемента связаны с состоянием, в {{}} можно писать сложные выражения используя операторы !,&&, ||, +, -, ?, :

- `pv-props="style.backgroundImage: {{'url(' + selectedIcon + ')'}}" pv-props="value:{{customUrl}}" `

  - описывает как DOM свойства ноды связаны с состоянием. чаще всего нужно для связывания с `<input>.value`, `<input>.checked` (и т.д.) `<div>.title`, `<img>.src`,

- `pv-text="{{name}}"` связывае node.textContent с состояни



- `pv-events` - описывает как обрабатывать события

  - есть два режима обработки - внутри view и напрямую в model (в том числе удаленную)

    - `click:` - обработка событий локально, внутри view. данные не попадают в `truth` state. обработчики должны быть объявлены в `tpl_events`. существую встроенные обработчики:
      - `requestPage`, `requestPageById`, `followTo`, `followURL`, `toggleSpyglass`, `updateSpyglass`
    - `click::` - обработка событий "удаленно" в модели (может применяться задержка на обработку), данные попадают напрямую в `truth` state.
      - есть два основных способа `click::dispatch:changeNav` и

  - pv-events="click::dispatch:changeNav:all" - отправит pass `changeNav` и data = `'all'` в модель, которой принадлежит данная view

  - pv-events="click:updateState:changeNav:all" обновит состояние `changeNav` в view на значение `all`

  - pv-events="click::^^^updateState:recipeId:%attrs%id" - отправит в качестве аргумента для updateState состояние id из локального контроллера. updateState будет отправлено в модель которой принаждлежит 3я view вверх по иерархии рендеринга

  - перед отправкой в обработчик можно собрать дополнительные данные: с помощью записи `:%attrs%id`. данные можно изьять из

    - состояния локальной view. через `:%attrs%some_state`
    - свойства DOM event, `:%event%timestamp`
    - свойства DOM node, `:%node%value` (полезно при использовании с input), `:%node%!value` - работает как `!true` в js



  - чтобы создать два обработчика просто перечислите их через пробел: `pv-events="click::dispatch:setActive click::^dispatch:setActive">`






- ```
  <div
    pv-repeat="image in image_previews | limitTo: 13"
    >
  </div>
  ```

  работает по аналогии с nest но в качестве источника для повторения использует массив с обычного state модели, а не nest. `{states: {image_previews: []}, nest:{'services-list': []}}`


```
<div pv-import="imp-area_for_button">
  <script type="pv-import-map">
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
