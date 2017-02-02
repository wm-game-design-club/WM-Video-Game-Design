ig.module(
	'game.entities.player'
).requires(
	'impact.entity',
	'impact.timer',
	'game.entities.enemy',
	'game.entities.hologram'
).defines(function() {

// Create your own entity, subclassed from ig.Entity
EntityPlayer = ig.Entity.extend({

	// Derived properties
	collides: ig.Entity.COLLIDES.ACTIVE,
	type: ig.Entity.TYPE.A,
	checkAgainst: ig.Entity.TYPE.B,

	size: {x: 36, y: 58},
	gravityFactor: 1,

	health: 5,

	// New properties
	moveAccel: 4500,
	jumpHeight: 600,
	jumpCut: 1.6,

	isTeleporting: false,	
	hologram: null,

	invincibilityTime: 0.8,
	invincibilityTimer: new ig.Timer(),
	invincibilityFrame: false,

	flip: false,
	crouching: false,

	// Load an animation sheet
	animSheet: new ig.AnimationSheet('media/mario_small.gif', 36, 58),

	init: function( x, y, settings ) {
		this.maxVel.x = 200;
		this.maxVel.y = 1200;
		this.friction.x = 1700;

		// Add animations for the animation sheet
		this.addAnim('idle', 0.1, [0]);
		//TODO: Add crouch walk animation
		// Don't have a crouch walk animation yet so just using
		// a random sprite.
		this.addAnim('idle_crouch', 0.1, [1]);
		this.addAnim('walk', 0.1, [0, 1, 2, 1]);
		this.addAnim('jump', 0.1, [3]);

		this.currentAnim = this.anims.idle;

		// Call the parent constructor
		this.parent( x, y, settings );
	},

	/*
	 * Respond to input. Flip the animation
	 * when moving backwards.
	 */
	update: function() {
		// Call the parent update() method to move the entity
		// according to its physics
		this.parent();

		//ig.input.state('right')
		//this.accel = {x: 0, y: 0}


		/*
		 * Teleportation
		 */
		
		// When teleportation starts, time slows down, and a hologram appears
		// to direct the player.
		if (ig.input.pressed('hologram')) {
			this.isTeleporting = true;
			ig.system.context.globalAlpha = 0.2;
			ig.Timer.timeScale -= 0.8;
			var px = this.pos.x + 200 * (this.flip ? -1 : 1);
			var py = this.pos.y;
			this.hologram = ig.game.spawnEntity(EntityHologram, 
						px, py, {flip: this.flip});
		}
		
		// When teleportation ends, time resumes and the hologram disappears.
		if (ig.input.released('hologram')) {
			this.isTeleporting = false;
			ig.system.context.globalAlpha = 1;
			ig.Timer.timeScale += 0.8;
			this.maxVel.x = 200;
			this.maxVel.y = 1200;
			this.pos.x += 200 * (this.flip ? -1 : 1);
			this.hologram.kill();
		}
		
		/* this is a speed punishment for using blink-teleport
		
		if (this.slowTimer.delta() > 0) {
			this.maxVel.x = 200;
			this.slowTimer.reset()
		}
		*/
		
		// The player can turn even if she's teleporting
		if (ig.input.state('right') && !ig.input.state('left')) {
			this.flip = false;
		} else if (ig.input.state('left') && !ig.input.state('right')) {
			this.flip = true;
		}
		this.currentAnim.flip.x = this.flip;
		
		// The player can't move if she's teleporting
		if (!this.isTeleporting) {
			// Movement
			if (ig.input.state('right') && !ig.input.state('left')) {
				this.accel.x = this.moveAccel;
				this.currentAnim = this.anims.walk;
			} else if (ig.input.state('left') && !ig.input.state('right')) {
				this.accel.x = -this.moveAccel;
				this.currentAnim = this.anims.walk;
			} else {
				this.accel.x = 0;
				this.currentAnim = this.getIdleAnimation();
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
			};
			// Shooting
			if(ig.input.pressed('attack')) {
				var px = this.pos.x + 32 * (this.flip ? -1 : 1);
				var py = this.pos.y + 24;
				var dir = this.flip ? "left" : "right";
				ig.game.spawnEntity(EntityBullet, px, py, {direction: dir});
			}

			// Crouching
			// Brings head to knees instead of head to knees
			if(ig.input.pressed('crouch')) {
				// Check that player is walking or idle
				if(this.currentAnim = this.anims.walk || this.anims.idle) {
					this.crouching = !this.crouching;
					// Remember where player was standing
					var feetPosY = this.pos.y + this.size.y;
					// Make player taller/shorter
					this.size.y = this.size.y * (this.crouching ? (1/2) : 2);
					// Move pos so that player doesn't "fall"/shift
					this.pos.y = feetPosY - this.size.y;;
					// Toggle crouching animation
					this.currentAnim = this.getIdleAnimation();
				}
			}


		}
	},

	/*
	 * The player is damaged by enemies.
	 */
	collideWith: function(other) {
		if (other instanceof EntityEnemy && this.invincibilityTimer.delta() > 0) {
			this.receiveDamage(1);
			this.invincibilityTimer.set(this.invincibilityTime);
			other.turnAround(this.flip); //enemy turns around after collision, but won't turn immediately if player sits on top of an enemy
		}
		this.parent(other);
	},

	/*
	 * The player flashes while invincible.
	 */
	draw: function() {
		// If invincible, don't draw this every other frame
		if (ig.global.wm || this.invincibilityTimer.delta() > 0 || this.invincibilityFrame) {
			this.parent();
		}
		this.invincibilityFrame = !this.invincibilityFrame;
		ig.system.context.fillStyle = "rgb(150,0,0)"
		ig.system.context.fillRect(this.pos.x, this.pos.y, this.size.x, this.size.y);
	},

	/*
	* Helper function to get the crouching-dependent idle animation
	*/
	getIdleAnimation: function() {
		return this.crouching ? this.anims.idle_crouch : this.anims.idle;
	}

});

})

