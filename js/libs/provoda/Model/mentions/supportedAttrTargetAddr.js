

export default function supportedAttrTargetAddr(addr) {
  if (addr.base_itself) {
    return false
  }
  return addr.result_type == 'nesting' || addr.nesting.path
};
