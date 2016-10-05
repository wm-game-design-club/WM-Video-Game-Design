ig.module(
	'game.entities.bullet'
).requires(
	'impact.entity'
).defines(function() {
	
// Create your own entity, subclassed from ig.Enitity
EntityBullet = ig.Entity.extend({

	// Set some of the properties
	collides: ig.Entity.COLLIDES.ACTIVE,
	type: ig.Entity.TYPE.A,
	checkAgainst: ig.Entity.TYPE.B,
	
	gravityFactor: false,
	
	size: {x: 32, y: 16},
	
	direction: 'right',
	
	// Load an animation sheet
	animSheet: new ig.AnimationSheet('media/bullet.png', 32, 16),
	
	/**
	 * Create a new Bullet that flies in a certain direction.
	 * This is controlled by settings.direction ('left' or 'right').
	 **/
	init: function( x, y, settings ) {
		this.vel.x = 1000;
		this.maxVel.x = 1000;
		if (settings.direction == 'left') {
			this.vel.x *= -1;
		}
		
		this.addAnim("flying", 1, [0], false);
		this.currentAnim = this.anims.flying;
		this.currentAnim.flip = (settings.direction == 'left');
		// Call the parent constructor
		this.parent( x, y, settings );
	},
	
	handleMovementTrace: function(res) {
		this.parent(res);
		if (res.collision.x || res.collision.y || res.collision.slope)
			this.kill();
	},

	check: function(other) {
		this.parent(other);
		// Check this method closely if bullets are destroyed
		// unintentionally
		if (other instanceof EntityEnemy) {
			if(other instanceof EntityEnemyPursuer) {
				other.revengeFlag=true;
				other.turnAround(this.direction=="left");
			}
			other.receiveDamage(1);
		}
		this.kill();
	}
	
})
});
