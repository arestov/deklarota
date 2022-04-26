const usedInterfaceAttrName = (interface_name: string): string => {
  return '$meta$apis$' + interface_name + '$used'
}

export default usedInterfaceAttrName
