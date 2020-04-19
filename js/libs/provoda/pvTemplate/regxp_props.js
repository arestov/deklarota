define(function() {
'use strict'

var regxp_props_com = /\S[\S\s]*?\:[\s]*?\{\{[\S\s]+?\}\}/gi;
var regxp_props_com_soft = /\S[\S\s]*?\:[\s]*?(?:\{\{[\S\s]+?\}\})|(?:\S+?(\s|$))/gi;
var regxp_props_spaces = /^\s*|s*?$/;
var regxp_props_coms_part = /\s*\:\s*?(?=\{\{)/;
var regxp_props_statement = /(^\{\{)|(\}\}$)/gi;


return {
  regxp_props_com: regxp_props_com,
  regxp_props_com_soft: regxp_props_com_soft,
  regxp_props_spaces: regxp_props_spaces,
  regxp_props_coms_part: regxp_props_coms_part,
  regxp_props_statement: regxp_props_statement,
}
})
