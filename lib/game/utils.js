ig.module(
	'game.utils',
	'game.entities.player'
).requires(
).defines(function() {

/**
 * A set of miscellaneous functions for game programming
 *
 * Utils should only be used for functions that don't rely on the outside
 * state of the game and have nowhere else to go.
 */
Utils = {
	/**
	 * Linearly interpolate between two values.
	 *
	 * Linear interpolation returns a value c percent of the way between
	 * a and b, with c being between 0 and 1.  For example, lerp(3, 5, 0.5)
	 * returns the midpoint between 3 and 5, or 4.
	 *
	 * Recursive linear interpolation can lead to some very smooth movement;
	 * look at the camera code in main.js for a good example.
	 */
	lerp: function(a, b, c) {
		 return a + (b - a) * c;
	},
	
	/**
	 * Get the player entity. If the player doesn't exist, return undefined.
	 */
	getPlayer: function() {
		return ig.game.getEntitiesByType(EntityPlayer)[0];
	},
	
	/**
	 * Run a function f(me, player) if the player exists.
	 * me is the context in which the function is run (you should
	 * usually just pass in the this keyword).
	 */
	doWithPlayer: function(me, func, default_=function(me){}) {
		var player = Utils.getPlayer();
		if (player === undefined) {
			default_(me);
		} else {
			func(me, player);
		}
	}
}

});
