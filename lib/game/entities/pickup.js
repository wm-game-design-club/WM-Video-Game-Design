ig.module(
	'game.entities.pickup'
).requires(
	'impact.entity',
	'game.entities.player'
).defines(function() {

// When the player touches a pickup, something happens, and
// the entity destroys itself.
//
// This is an Abstract Base Class; subclass it to make specific
// pickups
EntityPickup = ig.Entity.extend({

    // This is set up so that:
	// - This will never affect the physics of an entity
	// - This will never call another entity's .check()
	// - This entity's .check() will be called when a Type-A entity
	//   overlaps it
    collides: ig.Entity.COLLIDES.NONE,
    type: ig.Entity.TYPE.NONE,
    checkAgainst: ig.Entity.TYPE.A,

    gravityFactor: 0,

	check: function(other) {
		this.parent(other);
		if (other instanceof EntityPlayer) {
			this.onItemPickup(other);
		}
	},

	// Default item pickup behavior
	onItemPickup: function(player) {
		this.kill();
	}

});

})
