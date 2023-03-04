const throwInputInterfaces = (current, wanted) => {
  console.error('unexpected api', {
    current,
    wanted,
  })
  throw new Error('unexpected api')
}

const checkInputInterfaces = (current, wanted) => {
  if (!current) {return }

  if (current.size !== wanted.size) {
    throwInputInterfaces(current, wanted)
  }

  for (const api of current) {
    if (!wanted.has(api)) {
      throwInputInterfaces(current, wanted)
    }
  }
}

const useInterfaceAsSource = function(_, fn, self, __, interface_instance) {
  const interfaces = new Set()
  if (Array.isArray(interface_instance) || interface_instance instanceof Set) {
    for (const api of interface_instance) {
      interfaces.add(api)
    }
  } else {
    interfaces.add(interface_instance)
  }




  if (!self._highway.current_transaction) {
    self._highway.current_transaction = {}
  }

  checkInputInterfaces(self._highway.current_transaction.source_api, interfaces)

  self._highway.current_transaction.source_api = interfaces

  fn()
}

export default useInterfaceAsSource
