ig.module(
	'game.entities.door'
).requires(
	'impact.entity',
	'game.entities.player'
).defines(function() {
	
// An invisible rectangle that transports the player to another level
// when he/she touches it.
// The level in question can be specified by changing the "targetLevel"
// variable (a string) in the editor.
EntityDoor = ig.Entity.extend({
	
	// Editor properties
	_wmScalable: true,   // .size can be changed in Weltmeister
	_wmDrawBox: true,    // Box drawn around this entity in editor
	
    // This is set up so that:
	// - This will never affect the physicss of an entity
	// - This will never call another entity's .check()
	// - This entity's .check() will be called when a Type-A entity
	//   overlaps it
    collides: ig.Entity.COLLIDES.NONE,
    type: ig.Entity.TYPE.NONE,
    checkAgainst: ig.Entity.TYPE.A,
	
	gravityFactor: 0,
    size: {x: 32, y: 64},
	
	// The level to send the player to.
	targetLevel: "",
    
	check: function(other) {
		// Apparently, levels are stored in ig.global, so we can use
		// a string instead of having to load it directly.
		//
		// However, that level needs to first be required in main.js,
		// so I'm hoping that there's a better solution...
		if (other instanceof EntityPlayer) {
			var level = ig.global[this.targetLevel];
			if (level && ig.input.state('action')) {
				ig.game.loadLevelDeferred(level);
			} else {
				console.error(this.targetLevel + " does not exist");
			}
		}
	}
	
});
	
})
