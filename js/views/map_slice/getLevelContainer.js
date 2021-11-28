import spv from '../../libs/spv'
import css from './css'

const can_animate = css.transform && css.transition

const LevContainer = function(con, scroll_con, material, tpl, context) {
  this.c = con
  this.scroll_con = scroll_con
  this.material = material
  this.tpl = tpl
  this.context = context
  this.callbacks = []
  const _this = this
  if (can_animate) {
    spv.addEvent(this.c[0], can_animate, function() {
      //console.log(e);
      _this.completeAnimation()
    })
  }
}

LevContainer.prototype = {
  onTransitionEnd: function(cb) {
    this.callbacks.push(cb)
  },
  completeAnimation: function() {
    while (this.callbacks.length) {
      const cb = this.callbacks.shift()
      this.context.nextLocalTick(cb)
    }
  }
}

const getLevelContainer = (perspectivator_view, bwlev, deeper) => {
  const self = perspectivator_view
  const raw_num = bwlev.getAttr('map_level_num')
  if (raw_num < -1) {
    throw new Error('wrong map_level_num')
  }

  const is_very_start = bwlev.getAttr('is_main_perspectivator_resident')
  const num_erl = raw_num + (deeper ? 1 : 0)
  if (num_erl == -1 && is_very_start) {
    return self.lev_containers.start_page
  }

  if (deeper) {
    throw new Error('wont use `deeper` here')
  }

  const num = raw_num
  if (self.lev_containers[num]) {
    return self.lev_containers[num]
  }
  /*
  if (!view){
    throw new Error('give me "view"');
  }*/
  if (num == -1 && !self.lev_containers.start_page) {
    throw new Error('start_screen must exist')
  }

  const node = self.root_view.getSample('complex-page')

  const tpl = self.parent_view.pvtemplate(node, false, false, {
    '$lev_num': num
  })

  self.addTpl(tpl)

  let next_lev_con
  for (let i = num; i <= self.max_level_num; i++) {
    if (self.lev_containers[i]) {
      next_lev_con = self.lev_containers[i]
      break
    }
  }
  if (next_lev_con) {
    node.insertBefore(next_lev_con.c)
  } else {
    node.appendTo(self.getInterface('app_map_con'))
  }

  const lev_con = new LevContainer(
    node,
    tpl.ancs['scroll_con'],
    tpl.ancs['material'],
    tpl,
    this
  )
  self.lev_containers[num] = lev_con

  self.max_level_num = Math.max(self.max_level_num, num)
  return lev_con
}

export default getLevelContainer
