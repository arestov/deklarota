define(function(require) {
'use strict'
var spv = require('spv')
var parsePath = require('./parse.js')


var isFromRoot = function(first_char, string_template) {
  var from_root = first_char == '#';
  if (!from_root) {return;}

  return {
    cutted: string_template.slice( 1 )
  };
};

var parent_count_regexp = /^\^+/gi;
var isFromParent = function (first_char, string_template) {
  if (first_char != '^') {return;}

  var cutted = string_template.replace(parent_count_regexp, '');
  return {
    cutted: cutted,
    count: string_template.length - cutted.length
  };
};

var getParsedPath = spv.memorize(function(string_template) {
  //example "#tracks/[:artist],[:track]"
  //example "^^tracks/[:artist],[:track]"
  //example "^"
  var first_char = string_template.charAt(0);
  var from_root = isFromRoot(first_char, string_template);
  var from_parent = !from_root && isFromParent(first_char, string_template);

  var full_usable_string = from_root
    ? from_root.cutted
    : (from_parent
        ? from_parent.cutted
        : string_template);



  if (!full_usable_string && !from_parent && !from_root) {
    throw new Error('path cannot be empty');
  }

  var parsed = parsePath(full_usable_string)

  return {
    full_usable_string: full_usable_string,
    from_root: Boolean(from_root),
    from_parent: from_parent && from_parent.count,
    parsed: parsed,
  };
});

return getParsedPath
})
