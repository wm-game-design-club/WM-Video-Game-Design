ig.module(
	'game.entities.player'
).requires(
	'impact.entity',
	'impact.timer',
	'game.entities.enemy',
	'game.entities.corpse'
).defines(function() {

// Create your own entity, subclassed from ig.Entity
EntityPlayer = ig.Entity.extend({

	// Derived properties
	collides: ig.Entity.COLLIDES.ACTIVE,
	type: ig.Entity.TYPE.A,
	checkAgainst: ig.Entity.TYPE.B,

	size: {x: 32, y: 64},
	gravityFactor: 1,

	health: 5,

	// New properties
	moveAccel: 4500,
	jumpHeight: 600,
	jumpCut: 1.6,

	isTeleporting: false,
	teleportPos: {x: 0, y:0},
	teleportLerpPos: {x: 0, y: 0},
	teleportSlowdown: 0.95,

    normalImage:   new ig.Image('media/main-character.png'),
    hologramImage: new ig.Image('media/main-character.png'),

	invincibilityTime: 0.8,
	invincibilityTimer: new ig.Timer(),
	invincibilityFrame: false,

	slowTimer: new ig.Timer(3),

	flip: false,
	vertiflip: false,
	crouching: false,

	// Load an animation sheet
	animSheet: new ig.AnimationSheet('media/main-character.png', 32, 64),

	corpsePath: 'media/default-corpse.png',
    corpseWidth: 48,
    corpseHeight: 32,

	init: function( x, y, settings ) {
		this.maxVel.x = 200;
		this.maxVel.y = 1200;
		this.friction.x = 1700;

		// Add animations for the animation sheet
		this.addAnim('idle', 0.9, [44, 45, 46, 47]);
		//TODO: Add crouch walk animation
		// Don't have a crouch walk animation yet so just using
		// a random sprite.
		this.addAnim('idle_crouch', 0.1, [1], true);
		this.addAnim('walk', 0.09, [22, 23, 24, 25, 26, 27, 28, 29, 30, 31]);
		this.addAnim('jump', 0.1, [6, 7, 8], true);

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

		/*
		 * Teleportation
		 */
		// When teleportation starts, time slows down, and a hologram appears
		// to direct the player.
		if (ig.input.pressed('teleport') && this.slowTimer.delta() > 3) {
			this.isTeleporting = true;
			ig.system.context.globalAlpha = 0.2;
			ig.Timer.timeScale = 0;
			this.teleportLerpPos.x = this.pos.x;
			this.teleportLerpPos.y = this.pos.y;
		}

		// When teleportation ends, time resumes and the hologram disappears.
		if (ig.input.released('teleport') && this.slowTimer.delta() > 3) {
			this.isTeleporting = false;
			ig.system.context.globalAlpha = 1;
			ig.Timer.timeScale = 1 //this.teleportSlowdown;
			// this.maxVel.x = 200;
			// this.maxVel.y = 1200;
			this.pos.x = this.teleportPos.x;
			this.pos.y = this.teleportPos.y;
			// Jumping up and teleporting, by default, continues the jump.
			// This felt a little unnatural, so I decided to cut vertical
			// velocity a little
			this.vel.y /= 1.2;
			this.slowTimer.reset()
		}

		/* this is a speed punishment for using blink-teleport

		if (this.slowTimer.delta() > 0) {
			this.maxVel.x = 200;
			this.slowTimer.reset()
		}
		*/

		// The player can turn even while she's teleporting
		if (ig.input.state('right') && !ig.input.state('left')) {
			this.flip = false;
		} else if (ig.input.state('left') && !ig.input.state('right')) {
			this.flip = true;
		}
		if (ig.input.state('down') && !ig.input.state('jump')) {
			this.vertiflip = false;
		} else if (ig.input.state('jump') && !ig.input.state('down')) {
			this.vertiflip = true;
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
			if(ig.input.pressed('crouch') && !this.standing) {
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
		} else {
            // Update the hologram's position.
            // We might want to move this code to the hologram.js.
			this.teleportPos.x = this.pos.x
			this.teleportPos.y = this.pos.y
			if (ig.input.state('right') || ig.input.state('left') && !ig.input.state('jump') && !ig.input.state('down')) {
				this.teleportPos.x = this.pos.x + 200 * (this.flip ? -1 : 1);
				this.teleportPos.y = this.pos.y
		}
			if (ig.input.state('jump') || ig.input.state('down')) {
				this.teleportPos.x = this.pos.x
				this.teleportPos.y = this.pos.y + 200 * (this.vertiflip ? -1 : 1);
		}
			this.teleportLerpPos.x = Utils.lerp(this.teleportLerpPos.x, this.teleportPos.x, 0.2);
			this.teleportLerpPos.y = Utils.lerp(this.teleportLerpPos.y, this.teleportPos.y, 0.2);
			// The player reflects her ground/air position correctly
			if (this.standing) {
				this.currentAnim = this.anims.walk;
			} else {
				this.currentAnim = this.anims.jump;
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
		// If invincible, don't draw the player every other frame
		if (ig.global.wm || this.invincibilityTimer.delta() > 0 || this.invincibilityFrame) {
            this.parent();
            if (this.isTeleporting) {
                this.currentAnim.sheet.image = this.hologramImage;
                this.currentAnim.draw(this.teleportLerpPos.x - ig.game._rscreen.x,
                                      this.teleportLerpPos.y - ig.game._rscreen.y)
                this.currentAnim.sheet.image = this.normalImage;
            }
		}
		this.invincibilityFrame = !this.invincibilityFrame;
	},

	/*
	* Helper function to get the crouching-dependent idle animation
	*/
	getIdleAnimation: function() {
		return this.crouching ? this.anims.idle_crouch : this.anims.idle;
	},

	/*
	 * The player is killed and leaves a corpse
	 */
	kill: function() {
		if (this.corpsePath) {
      var settings = {
        animPath: this.corpsePath,
        animWidth: this.corpseWidth,
        animHeight: this.corpseHeight
      };
      ig.game.spawnEntity(EntityCorpse, this.pos.x, this.pos.y, settings);
    }
		this.parent();
		setTimeout(function() { ig.game.gameOver(); }, 2000);
	}

});

})
