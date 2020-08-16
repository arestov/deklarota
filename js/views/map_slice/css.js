
var css = {}

var dom_style_obj = window.document.createElement('div').style
var has_transform_prop
var has_transition_prop

var transition_props = {
  //https://github.com/ai/transition-events/blob/master/lib/transition-events.js
  // Webkit must be on bottom, because Opera try to use webkit
  // prefix.
  'transition':		'transitionend',
  'OTransition':		'oTransitionEnd',
  'WebkitTransition':	'webkitTransitionEnd',
  'MozTransition':	'transitionend'
}

for (var prop in transition_props) {
  if (prop in dom_style_obj) {
    has_transition_prop = transition_props[prop]
    break
  }
}

['transform', '-o-transform', '-webkit-transform', '-moz-transform'].forEach(function(el) {
  if (!has_transform_prop && el in dom_style_obj) {
    has_transform_prop = el
  }
})

if (has_transition_prop) {
  css.transition = has_transition_prop
}

if (has_transform_prop) {
  css.transform = has_transform_prop
}

export default css
