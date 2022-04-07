export function hasOwnProperty(obj: object, prop: string) {
  return Object.prototype.hasOwnProperty.call(obj, prop)
}
