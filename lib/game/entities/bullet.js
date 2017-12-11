ig.module(
	'game.entities.bullet'
).requires(
	'impact.entity'
	//'impact.entity-pool'
).defines(function() {

/*
 * The player's bullet. Moves in a straight line, destroys when it hits terrain or enemies.
 * Hurts enemies.
 *
 * EntityBullet was originally made to give the player something to shoot with, but it
 * could be made more flexible and generic over time. (In general, we probably ought to
 * make a general weapons system.)
 */
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

	/*
	 * Upon colliding with terrain, kill the bullet.
	 */
	handleMovementTrace: function(res) {
		this.parent(res);
		if (res.collision.x || res.collision.y || res.collision.slope)
			this.kill();
	},

	/*
	 * On collision with enemies, damage the enemy and destroy the
	 * bullet.
	 */
	check: function(other) {
		this.parent(other);
		// Check this method closely if bullets are destroyed
		// unintentionally
		if (other instanceof EntityEnemy) {
			if(other instanceof EntityEnemyPursuer) {
				if(other.attackDetection>0) {
					var dir = (this.direction=="left");
					if(dir==this.xFlip && !(this.state instanceof JumpState)) this.xFlip=!this.xFlip;
				}
			}
			other.receiveDamage(1);
		}
		this.kill();
	}

})

// Enable Pooling!
//ig.EntityPool.enableFor( EntityBullet );

});
