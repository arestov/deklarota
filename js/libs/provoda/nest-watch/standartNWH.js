

export default function standart(callback) {
  return function standart(motivator, fn, lnwatch, args) {
    const md = lnwatch.md
    const old_value = md.current_motivator
    md.current_motivator = motivator

    const one_item = lnwatch.one_item_mode && (lnwatch.ordered_items && lnwatch.ordered_items[0])

    const items = lnwatch.one_item_mode ? (lnwatch.state_name ? [one_item] : one_item) : lnwatch.ordered_items

    callback(md, items, lnwatch, args, motivator, fn)

    md.current_motivator = old_value
  }
};
