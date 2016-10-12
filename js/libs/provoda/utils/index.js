define(function (require) {
'use strict';
var spv = require('spv');

var NestWatch = function(selector, state_name, zip_func, full_name, handler, addHandler, removeHandler) {
	this.selector = selector;
	this.state_name = state_name;
	this.short_state_name = state_name && getShortStateName(state_name);
	this.full_name = full_name;
	this.zip_func = zip_func;
	this.handler = handler; // mainely for 'stch-'
	this.addHandler = addHandler;
	this.removeHandler = removeHandler;
};

var encoded_states = {};
var enc_states = {
	'^': (function(){
		// parent

		var parent_count_regexp = /^\^+/gi;

		return function parent(string) {
			//example: '^visible'

			if (!encoded_states[string]){
				var state_name = string.replace(parent_count_regexp, '');
				var count = string.length - state_name.length;
				encoded_states[string] = {
					rel_type: 'parent',
					full_name: string,
					ancestors: count,
					state_name: state_name
				};
			}

			return encoded_states[string];
		};
	})(),
	'@': function nesting(string) {
		// nesting

		//example:  '@some:complete:list'
		if (!encoded_states[string]){
			var nesting_and_state_name = string.slice(1);
			var parts = nesting_and_state_name.split(':');

			var nesting_name = parts.pop();
			var state_name = parts.pop();
			var zip_func = parts.pop();

			encoded_states[string] = {
				rel_type: 'nesting',
				full_name: string,
				nesting_name: nesting_name,
				state_name: state_name,
				zip_func: zip_func || itself,
				nwatch: new NestWatch(nesting_name.split('.'), state_name, zip_func, string)
			};
		}

		return encoded_states[string];
	},
	'#': function(string) {
		// root

		//example: '#vk_id'
		if (!encoded_states[string]){
			var state_name = string.slice(1);
			if (!state_name) {
				throw new Error('should be state_name');
			}
			encoded_states[string] = {
				rel_type: 'root',
				full_name: string,
				state_name: state_name
			};
		}

		return encoded_states[string];
	}
};

function getEncodedState(state_name) {
	if (!encoded_states.hasOwnProperty(state_name)) {

		var start = state_name.charAt(0);
		if (enc_states[start]) {
			enc_states[start](state_name);
		} else {
			encoded_states[state_name] = null;
		}

	}
	return encoded_states[state_name];
}


function getShortStateName(state_path) {
	var enc = getEncodedState(state_path);
	return enc ? state_path : spv.getFieldsTree(state_path)[0];
}

function itself(item) {return item;}

return {
	getShortStateName: getShortStateName,
	getEncodedState: getEncodedState,
	NestWatch: NestWatch
};
});
