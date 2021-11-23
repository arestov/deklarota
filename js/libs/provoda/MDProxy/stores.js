export const init = (self) => {
  self.__attrs_stores = null // will be proxy
  self.__attrs_change_watchers = null // will be map with lists

  self.__rels_stores = null
  self.__rels_change_watchers = null
}

export const dispose = (self) => {
  self.__attrs_stores = null
  self.__attrs_change_watchers = null

  self.__rels_stores = null
  self.__rels_change_watchers = null
}


function getAttrStoreValue() {
  return this.md_proxy.getAttr(this.key_value)
}

function getRelStoreValue() {
  return this.md_proxy.getRel(this.key_value)
}

function subscribe(fn) {
  this.push(fn)
  fn(this.getStoreValue())

  return () => {
    const place = this.indexOf(fn)
    this.splice(place, 1)
  }
}

const makeMiniStore = (md_proxy, key_value, getStoreValue) => {
  // https://svelte.dev/docs#Store_contract
  // hijacking array to be store
  // so we can not wrap list of callbacks in another object

  const store = []
  store.md_proxy = md_proxy
  store.key_value = key_value
  store.getStoreValue = getStoreValue
  store.subscribe = subscribe

  return store
}

const ok = Object.freeze({
  enumerable: true,
  configurable: true
})

const AttrsWrap = function() {}

AttrsWrap.prototype = {
  get: function(md_proxy, name) {
    if (!md_proxy.__attrs_change_watchers) {
      md_proxy.__attrs_change_watchers = new Map()
    }

    if (!md_proxy.__attrs_change_watchers.has(name)) {
      md_proxy.__attrs_change_watchers.set(
        name,
        makeMiniStore(md_proxy, name, getAttrStoreValue)
      )
    }

    return md_proxy.__attrs_change_watchers.get(name)
  },
  set: function() {
    return false
  },
  enumerate: function(md_proxy) {
    const states = md_proxy._assignPublicAttrs({})
    // __getPublicAttrs
    return Object.keys(states)
  },
  ownKeys: function(md_proxy) {
    const states = md_proxy._assignPublicAttrs({})
    // __getPublicAttrs
    return Object.keys(states)
  },
  has: function(md_proxy, name) {
    const states = md_proxy._assignPublicAttrs({})
    // __getPublicAttrs
    return states.hasOwnProperty(name)
  },
  getOwnPropertyDescriptor: function(_md_proxy, _prop) {
    // вызывается для каждого свойства
    return ok
  }
}

const RelsWrap = function() {}

RelsWrap.prototype = {
  get: function(md_proxy, name) {
    if (!md_proxy.__rels_change_watchers) {
      md_proxy.__rels_change_watchers = new Map()
    }

    if (!md_proxy.__rels_change_watchers.has(name)) {
      md_proxy.__rels_change_watchers.set(
        name,
        makeMiniStore(md_proxy, name, getRelStoreValue)
      )
    }
    return md_proxy.__rels_change_watchers.get(name)
  },
  set: function() {
    return false
  },
  enumerate: function(md_proxy) {
    return Object.keys(md_proxy.nestings)
  },
  ownKeys: function(md_proxy) {
    return Object.keys(md_proxy.nestings)
  },
  has: function(md_proxy, name) {
    return md_proxy.nestings.hasOwnProperty(name)
  },
  getOwnPropertyDescriptor: function(_md_proxy, _prop) {
    // вызывается для каждого свойства
    return ok
  }
}


export const methods = {
  /*
    public
  */
  getAttrsStores() {
    if (!this.__attrs_stores) {
      this.__attrs_stores = new Proxy(this, AttrsWrap.prototype)
    }

    return this.__attrs_stores
  },
  getRelsStores() {
    if (!this.__rels_stores) {
      this.__rels_stores = new Proxy(this, RelsWrap.prototype)
    }

    return this.__rels_stores
  },


  __notifyAttrChangeWatchers: function(attr_name, value) {
    if (this.__attrs_change_watchers == null) {return}

    const list = this.__attrs_change_watchers.get(attr_name)
    if (list == null) {return}

    for (var i = 0; i < list.length; i++) {
      const fn = list[i]
      fn(value)
    }
  },
  __notifyRelChangeWatchers: function(rel_name) {
    if (this.__rels_change_watchers == null) {return}
    const list = this.__rels_change_watchers.get(rel_name)
    if (list == null) {return}

    const value = this.getRel(rel_name)
    for (var i = 0; i < list.length; i++) {
      const fn = list[i]
      fn(value)
    }
  }

}
