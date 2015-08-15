
var _ = require('lodash'),
	deep = require('loot-deep');

var listeners = {},
	LKEY = "__listeners__";

module.exports = {
	/**
	 * @param operations {Object} defines condtions for executing an operation see description below
	 * @param n new value from change handler
	 * @param o old value from change handler
	 * @param changes the difference between n and o use something like github.com/andrewluetgers/diff
	 *
	 * the following values make up and operations description object
	 *
	 * conditions
	 *
	 *		require:	optional array of state members that must all be truthy (uses grab.js notation)
	 *					supports negation with leading ! eg. require jobRunId to be falsey = "!jobRunId"
	 *
	 * 		change:     treated the same as below, use one or the other
	 *		changes:	optional array of state members, any of which must have changed (uses grab.js notation)
	 *					supports negation with leading ! eg. require jobRunId to not have changed = "!jobRunId"
	 *
	 * operation: the function to execute if the above conditions are met
	 *
	 * eg.
	 * var operations = {
		 *		fetchClients: {
		 *			require: ["clientId"],
		 *			changes: ["user"],
		 *			operation: function() {
		 *				clientService.fetchClients(state);
		 *			}
		 *		}
		 *	};
	 */
	run: function(operations, n, o, changes, eventNameSpace) {
		eventNameSpace = eventNameSpace || "defaultNS";
		each(function(op, name) {
			var opChanges = op.change || op.changes, // support change or changes
				requireMatch = !op.require,
				changeMatch = !opChanges;

			// filter on requires
			if (op.require) {
				requireMatch = all(op.require, function(requireVal) {
					if (requireVal.substr(0,1) == "!") {
						return requireVal && !deep.get(n, requireVal.substr(1));
					} else {
						return requireVal && deep.get(n, requireVal);
					}
				});
			}

			// filter on changes
			if (opChanges) {
				changeMatch = any(opChanges, function(change) {
					if (change.substr(0,1) == "!") {
						return changes && !deep.get(changes, change.substr(1));
					} else {
						return changes && deep.get(changes, change);
					}
				});
			}

			// if all conditions met, execute the operation
			if (requireMatch && changeMatch) {
				op.operation(n, o, changes, name, eventNameSpace);
			}
		});
	},

	// should be used just before the final render operation
	// this allows us to schedule events to happen after the user defined operations such as
	// targeted renders based on state changes
	// whereas the final render is a full app render, that happens when the url changes
	callMatching: {
		operation: function (n, o, c, eventName, eventNameSpace) {
			if (c) {
				callMatchingListeners(listeners[eventNameSpace], n, o, c);
			}
		}
	},

	// configure the event nameSpace ahead of time so subscriers need not care about it
	eventSubscriber: function(eventNameSpace) {
		var self = this;
		return function (path, cb) {
			return self.subscribe(eventNameSpace, path, cb);
		}
	},

	/**
	 *
	 * @param path (string) period separated key path
	 * @param cb (function) to call e.g. to render a component
	 * @returns {Function} unsubscriber
	 */
	subscribe: function(eventNameSpace, path, cb) {
		//console.log("subscribe", path);
		var listenersPath = path + "." + LKEY,
			eventListeners = listeners[eventNameSpace] = listeners[eventNameSpace] || {},
			subscribersNs = deep.get(eventListeners, listenersPath);

		if (subscribersNs) {
			subscribersNs.push(cb);
		} else {
			subscribersNs = [cb];
			deep.set(eventListeners, listenersPath, subscribersNs);
		}

		return function unsubFinishCb() {
			//console.log("unsubscribe", listenersPath);
			var subscribersNs = deep.get(eventListeners, listenersPath),
				idx = subscribersNs.indexOf(cb);

			if (idx > -1) {
				subscribersNs.splice(idx, 1);
			}
		};
	},

	// configure the event name ahead of time so subscriers need not care about it
	eventSubscriber: function(eventNameSpace) {
		var self = this;
		return function(path, cb) {
			return self.subscribe(eventNameSpace, path, cb);
		}
	}

};


// recursively traverse listeners for matches against changes
function getMatches(listeners, changes, matches) {
	var matches = matches || [];

	for (prop in listeners) {
		if (prop !== LKEY && changes && prop in changes) {
			if (LKEY in listeners[prop]) {
				matches = matches.concat(listeners[prop][LKEY]);
			}
			if (typeof changes[prop] == 'object') {
				matches = matches.concat(getMatches(listeners[prop], changes[prop], matches));
			}
		}
	}

	return matches;
}

function callMatchingListeners(listeners, n, o, c, r) {
	var called = [];
	if (c) {
		getMatches(listeners, c).forEach(function (v) {
			if (called.indexOf(v) < 0) {
				called.push(v);
				v(n, o, c, r);
			}
		});
	}
}