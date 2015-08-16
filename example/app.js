

var state = {},
	prevState = {};

setInterval(function() {
	var changes = diff(prevState, state);
	if (changes) {
		ops.run(operations, state, prevState, changes);
		prevState = _.cloneDeep(state);
	}
}, 100);


setTimeout(initState, 300);
setInterval(function() {state.count++;}, 2000);

function initState() {
	state = {
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
}