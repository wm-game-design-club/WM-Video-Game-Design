ig.module(
	'game.utils'
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
	 * Bind a number to be between min and max inclusive.
	 *
	 * This is useful for keeping a value within two boundaries; e.g.
	 * keeping health between 0 and 100.
	 */
	clamp: function(n, min, max) {
		return Math.min(max, Math.max(min, n));
	},
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
	 }
}

});