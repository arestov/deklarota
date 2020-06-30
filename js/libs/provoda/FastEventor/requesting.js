define(function (require) {
'use strict';
var requestState = require('./requestState')
var requestNesting = require('./requestNesting')


return {
  requestState: requestState,
  resetRequestedState: requestState.resetRequestedState,
  requestNesting: requestNesting,
};

});
