`effects` - предназначено для взаимодействия состояния с внешним миром, посредством интерфейсов. все сайд эффекты приложения должны быть описаны с помощью effects

если части `attrs` `rels` и `actions` следует писать в чистом, функциольном стиле, то `effects` это место для кода с мутируемым вызовами

эффекты могут быть двух типов 

- `consume` для ввода новых данных в состояние
  - `subscribe` - данные передаются в соотвествующий `pass`
  
    - ```
      fillCurrentDomain: {
        type: 'subscribe', // при type: 'subscribe' и отсутствии поля state_name данные буду переданы в соотвествующий имени ключа pass. в данном случае key - fillCurrentDomain
        api: ['chromeForCurrenUser'], // используемый API
        fn: (pass, chrome) => { // первый аргумент - функция которая вызовет соотвествующий pass и передаст в нее данные
          const handleChange = url => {
            if (!url) {
              pass(url)
              return
            }
      
            const parsed = new URL(url)
            pass(parsed.hostname)
          }
      
          return currentChromeURL({ chrome }, handleChange)
        },
      },
      ```
  
    - 
  
  - `state_request` (legacy) выполняется запрос, данные записываются в соотвествующие states
  
  - `nest_request` (legacy) выполняется запрос, данные записываются в соответсвующий nest
  
  - `request` (not done) - данные передаются в соотвествующий `pass`
- `produce` для вызова сайд эффектов предначначеных для пользователя, или для других целей не связанных с вводом данных в состояние
  
  - (отправка данных на сервер, сохранение данных на диск, вызов api в качестве реакции на изменение состояния)
  
  - ```
    produce: {
      canBeDeleted: {
        api: ['self', '#chrome'],
        trigger: ['_provoda_id'],
        require: ['_provoda_id'],
        fn: (self, chrome) => {
          // TODO: use subscribe. Don't use getSPI!
          chrome.tabs.onUpdated.addListener((tabId, changes) => {
            const states = pick(changes, fields)
            if (isEmpty(states)) {
              return
            }
            const md = self.getSPI(`${tabId}`)
            if (!md) {
              return
            }
            md.input(() => {
              md.updateManyStates(states)
            })
          })
        },
      },
    },
    ```
  
  - 

помимо непосредственно эффектов в секции `effects` описываются сами интерфейсы с которыми взаимодействует данная модель

- `api` - описывает api связанные с данной моделью

  - короткая запись
  
  - ```
    "window": function() {
      return window
    }
    ```
  
  - расширенная запись
  
  - ```
    "someCustomAPI": [
      ['_provoda_id'], // набор состояний ожидаемый до выполнения функции
      ['#api1', 'api2', 'self'], // список других api требуемый для выполнения функции
      function(api1, api2, self) { // функция возвращает интеферфейс который будет известен модели как someCustomAPI
      	// api1 - api с корневой модели
      	// api2 - другой api с данной модели
      	// self - инстанс данной модели в runtime
        return notf.getStore('song-files');
      }
    ],
    ```
  
    



