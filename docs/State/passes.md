`actions`

​	routing: параметры должны содержаться в данных передаваемых в pass (pass без выполнения должен знать к какие ресурсы будет вестись запись)

`to` - цель для записи. одна [цель], или множественные {название_цели1: [цель1]...},

​	сейчас поддерживается attr и rel (см. addresses - modernPath)

- `< attr_name`
- `<< rel_name`

`fn` обработчик

-  компактная запись `fn: function(passed_data) {}` - просто обработчик для данных

- запись с зависимостями

- ```
  fn: [
    ['<title', '<<list'],
    (passed_data, title, list) => {

    }
  ]
  ```

  позволяет получить дополнительные данные из attr (вытащить части из global attr) для выполнения обработчика. зависимости указываются в формате addresses - modernPath

-

```
markAsLastActive: {
  to: ['<< lastActiveService << ^', { method: 'set_one' }],
  fn: [
    ['<<<<'],
    (data, self) => self,
  ],
},
```

```
remove: {
  to: { // результат раскидывается по разным частям стейта. fn может вернуть {} или {list, mark, isActive, activeService} - каждое поле опциональное
    list: ['<< services-list << ^', { method: 'set_many' }],
    mark: ['< removed'],
    activeService: ['<< activeService << ^', { method: 'set_one' }],
    isActive: ['< isActive'],
  },
  fn: [
    ['<<<<', '<< services-list << ^', 'activationWanted'],
    (_, self, list, activationWanted) => {
      const newList = without(list, self)

      if (!activationWanted) {
        return {
          list: newList,
          isActive: false,
          mark: true,
        }
      }

      return {
        list: newList,
        mark: true,
        isActive: false,
        activeService: null,
      }
    },
  ],
},
```





autodispatched `actions`
`handleAttr:attr_name` - on attr changes
`handleRel:rel_name` - on rel changes
