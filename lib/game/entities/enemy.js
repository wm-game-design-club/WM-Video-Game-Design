ig.module(
	'game.entities.enemy'
).requires(
	'impact.entity'
).defines(function() {
	
// This is an abstract enemy class that can take damage and hurt the
// player.  All enemy types will descend from it.
EntityEnemy = ig.Entity.extend({

	// Enemies will be in collision type B; they won't collide with
	// each other, but will collide with the player and his weapons
	// in type A.
	collides: ig.Entity.COLLIDES.ACTIVE,
	type: ig.Entity.TYPE.B,
	checkAgainst: ig.Entity.TYPE.A,
	
	//size: {x: 64, y: 64},
	//animSheet: new ig.AnimationSheet('media/_.png', 64, 64),
	
	maxHealth: 5,   // Starting health; bullets do 1 damage
	
	// init: set up health
	init: function( x, y, settings ) {
		// this.addAnim('idle', 0.1, [0]);
		// this.currentAnim = this.anims.idle;
		this.health = this.maxHealth;
		this.parent( x, y, settings );
	},
});
	
})
