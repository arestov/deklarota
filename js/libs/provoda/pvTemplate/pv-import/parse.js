

export default function parsePVImport(node, sample_name) {

  const possible = node.nodeName === 'SCRIPT'
    ? node
    : node.querySelector('script[type="dk-import-map"]')

  let script
  if (possible === node) {
    script = node
  }

  if (possible.parentNode === node) {
    script = node
    node.removeChild(script)
  }
  const map_string = script && script.textContent
  const map = map_string ? JSON.parse(map_string) : [{}]

  return {
    sample_name: sample_name,
    map: map,
    pv_nest: script.getAttribute('dk-rel') || null
  }
};
