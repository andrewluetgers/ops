# ops
State Based Routing

Given an app with state in an object this will let you call various functions based
on what the state changes happen to be. Furthermore it allows you to describe these
conditions in a declarative manner.

First you need some app with some state.

```javascript
var state = {
	showMenu: false,
	count: 0,
	finished: false,
	showNextStage: false,
	user: {
		id: null,
		name: null,
		settings: {
			favColor: null
		}
	}
};
```

Next you need some way to observe changes on your state including new, old, the diff.
Immutable data structures are great for this but lets keep it really simple for now.
Using a simple [diff function](https://github.com/andrewluetgers/diff) and lodash,
we can periodically check for changes every so often.

```javascript
var prevState;

setInterval(function() {
	var changes = diff(prevState, state);
	if (changes) {
		// do something with changed state
		prevState = _.cloneDeep(state);
	}
}, 100);

```
Now that we can observe changes in state this is where ops comes in.

You need an operations specification object to define the state changes you 
care about, and what to do when they happen.

```javascript
var operations = {
	
	alwaysExecutes: {
		operation: function(n, o, c) {
			console.log("the changes", c);
		}
	},
	
	prefs: {
		changes: ['user.prefs'],
		operation: function(n, o, c) {
			if (c.user.prefs.color) {
				var oldColor = o.user.prefs.color,
					newColor = n.user.pres.color;
				console.log(oldColor + "changed to " + newColor);
			}
		}
	},
	
	count: {
		changes: ['!count', '!showMenu'],
		operation: function(n, o, c) {
			console.log("something changed but it wasn't count or showMenu. Here it is", c);
		}
	},
	
	showNext: {
		require: ["!finished"],
		changes: ["count"],
		operation: function() {
			state.showNextStage = true;
		}
	}
};
```

Specify the changes with a path string, negation is allowed with leading !.
Multiple may be provided, and requirements of truthyness may be made.

Now we just need to call the ops.run function to make it all happen.


```javascript
setInterval(function() {
	var changes = diff(prevState, state);
	if (changes) {
		ops.run(operations, state, prevState, changes)
		prevState = _.cloneDeep(state);
	}
}, 100);

```

## browser useage
the webpack build output lib/loot-ops.min.js expects lodash to be available globally as _