define(function (require) {
'use strict';
var spv = require('spv');
var structureChild = require('../../structure/child')

var subPageHeaded = function(Constr, head, key, getKey, name, prefix) {
  if (!key) {
    throw new Error('should be key');
  }

  return {
    key: key,
    constr: structureChild(name, Constr, [prefix]),
    byType: null,
    can_be_reusable: null,
    head: head,
    getKey: getKey,
    getHead: head && spv.mmap({
      props_map: head
    })
  };
};

return function getSubpageItem(cur, key, byType, name, prefix) {
  var item;
  if (Array.isArray(cur)) {
    if (!cur[1] && !cur[2]) {
      /* EXAMPLE
      'sub_page-similar': [
        SimilarTags
      ]
      */
      throw new Error('keep code clean: use short `sub_page` declaration if you do not have special title');
      // instance = cur[0];
    } else {
      /* EXAMPLE
      'sub_page-similar': [
        SimilarTags,
        [
          ['locales.Tags', 'locales.Similar-to', 'tag_name'],
          function (tags, similar, name) {
            return similar + ' ' + name + ' ' + tags.toLowerCase();
          }
        ]
      ]
      */

      var hasCompx = cur[1] && cur[1][0].length

      var instance = hasCompx ? spv.inh(cur[0], {
        skip_code_path: true
      }, {
        attrs: {
          nav_title: [
            'compx'
          ].concat(cur[1])
        }
      }) : cur[0];
      item = subPageHeaded(instance, cur[2], key, null, name, prefix);
    }
  } else if (typeof cur == 'object') {
    // semi compatibility (migration) mode

    /* EXAMPLE
    'sub_page-similar': {
      constr: SimilarTags,
      title: [[...]]
    }
    */

    if (!cur.constr.prototype.compx_check['nav_title'] && (!cur.title || typeof cur.title != 'object')) {
      // title should be. in array or object presentation
      throw new Error('keep code clean: use short `sub_page` declaration if you do not have special title');
    }

    var extend = {};
    if (cur.title && cur.title[0].length) {
      extend['nav_title'] = ['compx'].concat(cur.title);
    }
    if (cur.reusable) {
      extend['$$reusable_url'] = ['compx'].concat(cur.reusable);
    }

    item = subPageHeaded(spv.inh(cur.constr, {
      skip_code_path: true
    }, {
      attrs: extend
    }), cur.head, key, cur.getKey, name, prefix);

    item.can_be_reusable = Boolean(cur.reusable);

  } else {
    /* EXAMPLE
    'sub_page-similar': SimilarTags
    */
    item = subPageHeaded(cur, null, key, null, name, prefix);
  }

  item.byType = Boolean(byType);

  return item;
};
});
