

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
	},
	prevState = _.cloneDeep(state)

setInterval(function() {
	var changes = diff(state, prevState);
	console.log(state, prevState, changes);
	if (changes) {
		ops.run(operations, state, prevState, changes)
		prevState = _.cloneDeep(state);
	}
}, 200);