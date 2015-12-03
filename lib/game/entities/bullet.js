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
		this.vel.x = 450;
		if (settings.direction == 'left') {
			this.vel.x *= -1;
		}
		
		this.addAnim("flying", 1, [0]);
		this.currentAnim = this.anims.flying;
		
        // Call the parent constructor
        this.parent( x, y, settings );
    },
	
	handleMovementTrace: function(res) {
		this.parent(res);
		if (res.collision.x) {
			this.kill();
		}
	}
	
});
	
})