/* eslint-disable no-unused-vars */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnythingFn = (...args: any) => any

type FunctionWithPossibleCache<CacheResolver> = CacheResolver & {
  __clear?(): void;
}

type FunctionWithCache<CacheResolver> = FunctionWithPossibleCache<CacheResolver> & {
  __clear?(): void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function memorize<Resolver extends AnythingFn>(func: Resolver, getter?: AnythingFn): FunctionWithCache<Resolver> {
  const cache = new Map()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result: FunctionWithPossibleCache<Resolver> = getter ? function chechCacheByGetter(this: any): any {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const key = getter.apply(this, arguments as unknown as any[])
    if (!cache.has(key)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = func.apply(this, arguments as unknown as any[])
      cache.set(key, result)
      return result
    }
    return cache.get(key)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as Resolver : function checkCache(this: any, key: any): any {
    if (!cache.has(key)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = func.apply(this, arguments as unknown as any[])
      cache.set(key, result)
      return result
    }
    return cache.get(key)
  } as Resolver

  result.__clear = (): void => {
    cache.clear()
  }

  return result
};
