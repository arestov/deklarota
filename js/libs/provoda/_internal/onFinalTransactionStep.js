const make = (runtime) => function onFinalTransactionStep(step) {
  if (!runtime.constructor.name || !step) {
    console.error('wrong')
  }
}

export default make
