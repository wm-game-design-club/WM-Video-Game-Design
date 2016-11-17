ig.module(
	'game.entities.target'
).requires(
	'game.entities.enemy'
).defines(function() {
	
/*
 * A simple test enemy.
 * It floats in the air, damages the player, and takes damage.
 */
EntityTarget = EntityEnemy.extend({
	
	size: {x: 64, y: 64},
	gravityFactor: 0,
	
	// Load an animation sheet
	animSheet: new ig.AnimationSheet('media/enemy-target.png', 64, 64),
	
	maxHealth: 5,
	
	init: function( x, y, settings ) {
		
		this.parent( x, y, settings );
		
		this.addAnim('idle', 0.1, [0]);
		this.currentAnim = this.anims.idle;
		
		this.gravityFactor=0;
	}
	
});
	
})
