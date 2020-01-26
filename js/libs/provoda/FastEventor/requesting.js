define(function (require) {
'use strict';
var requestState = require('./requestState')
var requestNesting = require('./requestNesting')


return {
  requestState: requestState,
  requestNesting: requestNesting,
};

});
