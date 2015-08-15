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