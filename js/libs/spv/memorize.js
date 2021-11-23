

export default function memorize(func, getter) {
  const cache = new Map()

  const result = getter ? function chechCacheByGetter() {
    const key = getter.apply(this, arguments)
    if (!cache.has(key)) {
      const result = func.apply(this, arguments)
      cache.set(key, result)
      return result
    }
    return cache.get(key)
  } : function checkCache(key) {
    if (!cache.has(key)) {
      const result = func.apply(this, arguments)
      cache.set(key, result)
      return result
    }
    return cache.get(key)
  }

  result.__clear = () => {
    cache.clear()
  }

  return result
};
