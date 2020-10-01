import { bhv, inputAttrs, LoadableList } from '../core'

export const Model = bhv({
	model_name: 'MyData',
	extends: LoadableList,
	attrs: {
		...inputAttrs({
			foo: 1,
			deps1: 2,
			str: '',
      isFlag: false,
      __localValue: null,
		}),
		bar: ['input', 'myInitialState'],
    baz: ['comp', ['deps1', 'deps2'], (deps1, deps2) => deps1 + deps2],
		parentApiReady: ['comp', ['< _api_used_parentApi <<< ^'], Boolean],
		falsyState: ['comp', ['trueState'], arg => !arg],
		alias: ['comp', ['trueState']],
	},
	rels: {
    omnibox: ['nest', [LoadableList]],
    badgeScrapper: [
      'nest',
      [
        '#badgeScrappers/[:recipeId]',
        {
          idle_until: 'recipeId',
          preload_on: 'recipeId',
        },
      ],
    ],
    sessionsList: ['model', LoadableList],
    list: ['model', '[:id]'],
    allSortedServices: ['conj', ['orderedWorkspacePins', 'mapableServices']],
    sites: ['sel', {
      from: 'list',
      where: { '>isSite': ['=', [true]] }
    }],
    sortedSites: ['sel', {
      from: 'all_sources',
      where: {
        '>ready': [['=', 'boolean'], [true]]
      },
      sort: [
        ['>search_name', 'searches_pr'],
        function (a, b, _base) {
          return a - b
        }
      ]
    }],
    tabs: ['sel', {
      from: 'list',
      where: { '>airMode': [(left, right) => left === right, [false]] },
    }],
    activeWS: ['comp', ['<< @one:activeWS << ^^']],
  },
	actions: {
		'handleAttr:attr': {
			to: ['newAttr'],
			fn: ({ next_value, prev_value }) => next_value + prev_value
		},
		'handleRel:rel': {
			to: ['newRel'],
			fn: ({ next_value, prev_value }) => next_value + prev_value
		},
		handleInit: {
			to: { initedWith: ['initedWith'] },
			fn: ({ nestings, states }) => ({ initedWith: { states, nestings } })
		},
	},
	effects: {
		api: {
			parentApi: [
        ['parentApiReady'], // см. attrs parentApiReady
        ['self'],
        self => self.map_parent._interfaces_using.used.parentApi,
      ],
		},
		consume: {
			loadAttr: {
				type: 'state_request',
				states: ['state1', 'state2'],
				api: 'backend',
				parse: data => data,
				fn: [[], async () => {
					return 'some async response'
				}]
			},
			myRel: {
				type: 'nest_request',
				api: 'backend',
				parse: [data => data],
				fn: [[], async () => {
					return 'some async response'
				}]
			},
			subs: {
        type: 'subscribe',
        api: ['self'],
        fn: (pass, _self) => {
          pass({ arg1: 1, arg2: 2 })
          return () => {}
        },
      },
		},
		produce: {
			requestStateAndRel: {
			  api: ['self', 'parentApi'],
			  trigger: ['_provoda_id'],
			  require: ['_provoda_id'],
			  fn: async self => {
			    self.requestState('state1')
          self.requestState('state2')
					self.requestMoreData('myRel')
			  },
			},
			checkboxProduceEffect: {
				api: [],
				trigger: ['checkboxState'],
				require: ['_provoda_id'],
				fn() {},
			},
			falsyProduceEffect: {
				api: [],
				trigger: ['falsyState'],
				require: ['falsyState'],
				fn() {},
			}
    },
  },
})
