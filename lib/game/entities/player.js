ig.module(
	'game.entities.player'
).requires(
	'impact.entity',
	'impact.timer'
).defines(function() {
	
// Create your own entity, subclassed from ig.Entity
EntityPlayer = ig.Entity.extend({

	// Set some of the properties
	collides: ig.Entity.COLLIDES.ACTIVE,
	type: ig.Entity.TYPE.A,
	checkAgainst: ig.Entity.TYPE.B,
	
	size: {x: 36, y: 58},
	gravityFactor: 1,
	
	// Constants
	moveAccel: 4500,
	jumpHeight: 600,
	jumpCut: 1.6,
	
	health: 15,
	
	flip: false,
	
	// Load an animation sheet
	animSheet: new ig.AnimationSheet('media/mario_small.gif', 36, 58),
	
	init: function( x, y, settings ) {

		this.maxVel.x = 200;
		this.maxVel.y = 1200;
		this.friction.x = 1700;
		
		// Add animations for the animation sheet
		this.addAnim('idle', 0.1, [0]);
		this.addAnim('walk', 0.1, [0, 1, 2, 1]);
		this.addAnim('jump', 0.1, [3]);

		this.currentAnim = this.anims.idle;
		
		// Call the parent constructor
		this.parent( x, y, settings );
	},
	
	update: function() {   
		// Call the parent update() method to move the entity
		// according to its physics
		this.parent();
		
		//ig.input.state('right')
		//this.accel = {x: 0, y: 0}
		
		// Movement
		if (ig.input.state('right') && !ig.input.state('left')) {
			this.accel.x = this.moveAccel;
			this.currentAnim = this.anims.walk;
			this.flip = false;
		} else if (ig.input.state('left') && !ig.input.state('right')) {
			this.accel.x = -this.moveAccel;
			this.currentAnim = this.anims.walk;
			this.flip = true;
		} else {
			this.accel.x = 0;
			this.currentAnim = this.anims.idle;
		}
		
		// Jumping
		if (this.standing) {
			if (ig.input.pressed('jump')) {
				this.vel.y -= this.jumpHeight;
			}
		} else {
			this.currentAnim = this.anims.jump;
			if (this.vel.y < 0 && ig.input.released('jump')) {
				this.vel.y /= this.jumpCut;
			}
		}
        
        // Shooting
        if(ig.input.pressed('attack')) {
            var px = this.pos.x + 32 * (this.flip ? -1 : 1);
			var py = this.pos.y + 24;
			var dir = this.flip ? "left" : "right";
			ig.game.spawnEntity(EntityBullet, px, py, {direction: dir});
        }
		
		this.currentAnim.flip.x = this.flip;
	}
	
});
	
})
