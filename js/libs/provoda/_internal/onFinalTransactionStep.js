import stopUsingApiAsSource from '../dcl/effects/transaction/end'

const make = (runtime) => function onFinalTransactionStep(_step) {
  stopUsingApiAsSource(runtime)

  if (runtime.current_transaction) {
    runtime.current_transaction = null
  }
}

export default make
