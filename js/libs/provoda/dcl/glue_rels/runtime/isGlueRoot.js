export default function isGlueRoot(addr) {
  return addr.from_base.type == 'root'
}
