export default function isGlueParent(addr) {
  return addr.from_base.type == 'parent'
}
