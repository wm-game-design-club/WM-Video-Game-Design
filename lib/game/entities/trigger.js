/*
 * When a "trigger" entity enters this box, call the function of
 * a "target" entity.
 *
 * To use this, set target.1 to the trigger entity.
 * Set target.2 to the target entity, and enter the name of the function
 * you wish to call (like "kill") in the box.
 *
 * Some use examples:
 *   - Planes that kill the player if they fall below the screen
 */
ig.module(
	'game.entities.trigger'
).requires(
	'impact.entity'
).defines(function() {

EntityTrigger = ig.Entity.extend({

	_wmScalable: true,
	_wmDrawBox: true,

	checkAgainst: ig.Entity.TYPE.BOTH,

	size: {x: 64, y: 64},
	gravityFactor: 0,

	check: function(other) {
		var trigger_ent = ig.game.getEntityByName(this.target["1"]);
		var target_ent = ig.game.getEntityByName(this.target["2"]);
		var func = this["function"];

		if (other == trigger_ent) {
			target_ent[func]();
		}
	}
});

});
