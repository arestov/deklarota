
const assertAttrUpdating = (self) => {
  var motivator = self._currentMotivator()

  if (!motivator) {
    throw new Error('wrap your call with `.input()`')
  }

  if (motivator.is_transaction_end) {
    throw new Error('are you in product.effect? wrap your call with `.input()`')
  }
}


export default assertAttrUpdating
