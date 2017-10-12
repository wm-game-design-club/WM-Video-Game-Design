/*
 * A simple plugin that allows you to fade or tint the screen.
 *
 * To use this plugin, require it in main.js.
 * This loads a variety of functions:
 *
 * ig.game.fadeOut(time) - Fade to black over n seconds
 * ig.game.fadeIn(time) - Fade to untinted over n seconds
 *
 * Color values (r, g, and b) are integers from 0 to 255.
 *
 * ig.game.fadeToTint(r, g, b, time) - Fade to a certain tint over n seconds
 * ig.game.setTint(r, g, b) - Immediately tint the screen
 * ig.game.resetTint() - Immediately remove any tint effects
 *
 * ig.game.finishFade() - Finish a fade in progress immediately
 */

ig.module(
	'plugins.screentint'
).requires(
	'impact.game'
).defines(function() {

ig.Game.inject({

	tintColor: {r: 255, g: 255, b: 255},
	tintDest: {r: 255, g: 255, b: 255},
	tintTimer: new ig.Timer(-1),
	targetTime: 1,

	// Fade to this tint value over time.
	// r, g, and b are integers between 0 and 255
	fadeToTint: function(r, g, b, time) {
		this.tintDest.r = r;
		this.tintDest.g = g;
		this.tintDest.b = b;

		this.tintTimer.set(time);
		this.targetTime = time;
	},

	fadeOut: function(time) {
		this.fadeToTint(0, 0, 0, time);
	},

	fadeIn: function(time) {
		this.fadeToTint(255, 255, 255, time);
	},
	
	// Set the current tint value instantly
	// r, g, and b are integers between 0 and 255
	setTint: function(r, g, b) {
		this.tintDest.r = r;
		this.tintDest.g = g;
		this.tintDest.b = b;
		
		this.finishFade();
	},

	resetTint: function() {
		this.setTint(255, 255, 255);
	},

	finishFade: function() {
		this.tintColor.r = this.tintDest.r;
		this.tintColor.g = this.tintDest.g;
		this.tintColor.b = this.tintDest.b;

		this.tintTimer.set(-1);
		this.targetTime = 1;
	},

	update: function() {
		this.parent();
		var factor = 1 + this.tintTimer.delta() / this.targetTime;
		
		this.tintColor.r += (this.tintDest.r - this.tintColor.r) * factor;
		this.tintColor.g += (this.tintDest.g - this.tintColor.g) * factor;
		this.tintColor.b += (this.tintDest.b - this.tintColor.b) * factor;
		
		if (this.tintTimer.delta() > 0) {
			this.finishFade();
		}

		ig.show("Tint-ColorR", Math.floor(this.tintColor.r));
		ig.show("Tint-DestR",  Math.floor(this.tintDest.r));
		ig.show("Tint-Timer",  Math.floor(this.tintTimer.delta()));
	},

	draw: function() {
		this.parent();
		if (this.tintColor.r != 255 ||
		    this.tintColor.g != 255 ||
		    this.tintColor.b != 255) {

			var context = ig.system.context;
			var oldBlend = ig.system.context.globalCompositeOperation;
			context.globalCompositeOperation = 'multiply';
			context.fillStyle = 'rgb(' + Math.floor(this.tintColor.r) + ','
				                     + Math.floor(this.tintColor.g) + ','
				                     + Math.floor(this.tintColor.b) + ')';
			context.fillRect(0, 0, ig.system.realWidth / 1, ig.system.realHeight / 1);
			context.globalCompositeOperation = oldBlend;
		}
	}

});


});
