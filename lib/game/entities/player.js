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
	gravityFactor: 2,
	bounciness: 0,

	health: 5,

	// New properties
	moveAccel: 4500,
	jumpHeight: 600,
	jumpCut: 1.6,

	teleportSlowdown: 0.05,
	teleportRechargeTime: 1,
	teleportDistance: 192,

	teleportPos: {x: 0, y:0},
	teleportLerpPos: {x: 0, y: 0},

	invincibilityTime: 0.8,
	invincibilityTimer: new ig.Timer(),
	invincibilityFrame: false,

	slowTimer: new ig.Timer(this.teleportRechargeTime),

	flip: false,
	vertiflip: false,
	crouching: false,
	jumping: false,
	teleporting: false,
	animationNeedsRewind: false,

	// Load an animation sheet
	animSheet: new ig.AnimationSheet('media/main-character.png', 32, 64),

	corpsePath: 'media/default-corpse.png',
    corpseWidth: 48,
    corpseHeight: 32,

  deathSound: new ig.Sound('media/sounds/power down synth.ogg'),

	init: function( x, y, settings ) {
		this.maxVel.x = 200;
		this.maxVel.y = 1200;
		this.friction.x = 1700;

		// Add animations for the animation sheet
		this.addAnim('idle', 0.9, [44, 45, 46, 47]);
		this.addAnim('walk', 0.09, [22, 23, 24, 25, 26, 27, 28, 29, 30, 31]);
		this.addAnim('jump', 0.06, [6, 7, 7, 7, 8], true);
		this.addAnim('fall', 0.1, [9], true);
		this.addAnim('land', 0.1, [10, 7, 6, 5, 4, 3, 2], true);
		this.addAnim('crouch', 0.1, [77, 78, 79, 80, 81, 82], true);
		this.addAnim('teleport', 0.1 * this.teleportSlowdown, [99, 100, 101, 102, 103, 104, 105], true);
		this.addAnim('hologram', 0.1 * this.teleportSlowdown, [176, 177, 178, 179, 180, 181, 182, 183]);
		this.currentAnim = this.anims.idle;

		this.deathSound.volume = 0.8;

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

		// The player can turn at any time.
		if (ig.input.state('right') && !ig.input.state('left')) {
			this.flip = false;
		} else if (ig.input.state('left') && !ig.input.state('right')) {
			this.flip = true;
		}

		// Influences the player's teleportation direction
		if (ig.input.state('down') && !ig.input.state('jump')) {
			this.vertiflip = false;
		} else if (ig.input.state('jump') && !ig.input.state('down')) {
			this.vertiflip = true;
		}

		// When teleportation starts, time slows down, and a hologram appears
		// to direct the player. The !this.teleporting
		if (ig.input.pressed('teleport') && !this.teleporting
				&& this.slowTimer.delta() > this.teleportRechargeTime) {
			this.startTeleport();
			this.animationNeedsRewind = true;
		}

		// When teleportation ends, time resumes and the hologram disappears.
		if (ig.input.released('teleport') && this.teleporting
				&& this.slowTimer.delta() > this.teleportRechargeTime) {
			this.endTeleport();
		}

		if (this.teleporting) {
            this.whileTeleporting();
		} else {
			if (!this.crouching) {
				// Movement
				if (ig.input.state('right') && !ig.input.state('left')) {
					this.accel.x = this.moveAccel;
				} else if (ig.input.state('left') && !ig.input.state('right')) {
					this.accel.x = -this.moveAccel;
				} else {
					this.accel.x = 0;
				}
			}

			// Jumping
			if (this.standing) {
				if (ig.input.pressed('jump')) {
					this.vel.y -= this.jumpHeight;
					this.jumping = true;
					this.animationNeedsRewind = true;
				} else {
					this.jumping = false;
				}
			} else {
				if (this.vel.y < 0 && ig.input.released('jump')) {
					this.vel.y /= this.jumpCut;
				}
			}

			// Shooting
			if(ig.input.pressed('attack')) {
				var px = this.pos.x + 32 * (this.flip ? -1 : 1);
				var py = this.pos.y - 12 + (this.size.y - this.offset.y) * 0.5;
				var dir = this.flip ? "left" : "right";
				ig.game.spawnEntity(EntityBullet, px, py, {direction: dir});
			}

			// Start Crouching
			if (ig.input.state('down') && this.standing && !this.crouching) {
				this.crouching = true;
				this.animationNeedsRewind = true;
				var feetPosY = this.pos.y + this.size.y;
				this.size.y = this.size.y * 0.5;
				this.pos.y = feetPosY - this.size.y;
				this.offset.y += this.size.y;
				this.accel.x = 0;
			}

			// Stop crouching
			if ((ig.input.released('down') || !this.standing) && this.crouching) {
				this.crouching = false;
				this.pos.y -= this.size.y * 0.5;
				this.offset.y -= this.size.y;
				this.size.y *= 2;
			}
		}

		// Animation control
		this.currentAnim.flip.x = this.flip;
		if (this.teleporting) {
			this.currentAnim = this.anims.teleport;
		} else if (!this.standing && this.vel.y > 0) {
			this.currentAnim = this.anims.fall;
			this.jumping = false;
		} else if (this.jumping) {
			this.currentAnim = this.anims.jump;
		} else if (this.crouching) {
			this.currentAnim = this.anims.crouch;
		} else if (Math.abs(this.vel.x) < 0.01) {
			this.currentAnim = this.anims.idle;
		} else {
			this.currentAnim = this.anims.walk;
		}

		if (this.animationNeedsRewind) {
			this.currentAnim.rewind();
			this.animationNeedsRewind = false;
		}
	},

	startTeleport: function() {
		this.teleporting = true;
		//ig.system.context.globalAlpha = 0.5;
		ig.Timer.timeScale = this.teleportSlowdown;
		this.teleportLerpPos.x = this.pos.x;
		this.teleportLerpPos.y = this.pos.y;
	},

	whileTeleporting: function() {
		// Slowly dim the screen
		var ga = ig.system.context.globalAlpha;
		if (ga > 0.5)
			ig.system.context.globalAlpha -= 0.5 / 15;
		else
			ig.system.context.globalAlpha = 0.5;

		// Stop if on the ground; sort of a hack
		if (this.standing) this.accel.x = 0;

		this.teleportPos.x = this.pos.x
		this.teleportPos.y = this.pos.y
		if (ig.input.state('right') || ig.input.state('left') && !ig.input.state('jump') && !ig.input.state('down')) {
			this.teleportPos.x = this.pos.x + this.teleportDistance * (this.flip ? -1 : 1);
			this.teleportPos.y = this.pos.y
		}
		if (ig.input.state('jump') || ig.input.state('down')) {
			this.teleportPos.x = this.pos.x
			this.teleportPos.y = this.pos.y + this.teleportDistance * (this.vertiflip ? -1 : 1);
		}
		this.teleportLerpPos.x = Utils.lerp(this.teleportLerpPos.x, this.teleportPos.x, 0.2);
		this.teleportLerpPos.y = Utils.lerp(this.teleportLerpPos.y, this.teleportPos.y, 0.2);
	},

	endTeleport: function() {
		this.teleporting = false;
		ig.system.context.globalAlpha = 1;
		ig.Timer.timeScale = 1;

		if (this.teleportPos.x < ig.game.collisionMap.width*ig.game.collisionMap.tilesize && this.teleportPos.y < ig.game.collisionMap.height*ig.game.collisionMap.tilesize && this.teleportPos.x > 0 && this.teleportPos.y > 0)
		{
			// Checks if the coordinates of the teleport destination is a wall or the ground. Teleports if it's in air, does nothing otherwise.
			var headTeleport = ig.game.collisionMap.getTile( this.teleportPos.x, this.teleportPos.y );
			//Checks the tiles the legs of the player inhabits so you can't teleport in between some walls.
			var feetTeleport = ig.game.collisionMap.getTile( this.teleportPos.x, this.teleportPos.y + 40 );
			if( headTeleport == 0 || headTeleport == 12) {
				if (feetTeleport == 0 || feetTeleport == 12)
				{
					// Jumping up and teleporting, by default, continues the jump.
					// This felt a little unnatural, so I decided to cut vertical
					// velocity a little
					this.vel.y /= 1.2;
					this.pos.x = this.teleportPos.x;
					this.pos.y = this.teleportPos.y;
				}
			}
	}
		// We shouldn't reset the timer if we haven't dashed
		if (ig.input.state('right') || ig.input.state('left') ||
				ig.input.state('jump') || ig.input.state('down')) {
			this.slowTimer.reset()
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
	 * The player flashes while invincible, shows a hologram while teleporting
	 */
	draw: function() {
		// If invincible, don't draw the player every other frame
		if (ig.global.wm || this.invincibilityTimer.delta() > 0 || this.invincibilityFrame) {
            this.parent();
            if (this.teleporting) {
                this.currentAnim = this.anims.hologram;
				this.currentAnim.flip.x = this.flip;
                this.currentAnim.draw(this.teleportLerpPos.x - ig.game._rscreen.x,
                                      this.teleportLerpPos.y - ig.game._rscreen.y);
				this.currentAnim.update();
                this.currentAnim = this.anims.teleport;
            }
		}
		this.invincibilityFrame = !this.invincibilityFrame;

		// Debug drawing, lines
		if (ig.Debug && this.teleporting) {
			var forwardTrace = ig.game.collisionMap.trace(
				this.pos.x, this.pos.y,
				this.teleportPos.x - this.pos.x,
				this.teleportPos.y - this.pos.y,
				this.size.x, this.size.y
			);
			if (forwardTrace.collision.x ||
				forwardTrace.collision.y ||
				forwardTrace.collision.slope) {
				ig.Primitives.drawLine(
					this.pos.x, this.pos.y,
					forwardTrace.pos.x,
					forwardTrace.pos.y
				);
			}

			var backwardTrace = ig.game.collisionMap.trace(
				this.teleportPos.x,
				this.teleportPos.y,
				this.pos.x - this.teleportPos.x,
				this.pos.y - this.teleportPos.y,
				this.size.x, this.size.y
			);
			if (backwardTrace.collision.x ||
				backwardTrace.collision.y ||
				backwardTrace.collision.slope) {
				ig.Primitives.drawLine(
					backwardTrace.pos.x,
					backwardTrace.pos.y,
					this.teleportPos.x,
					this.teleportPos.y,
				);
			}
		}
	},

	/*
	* Helper function to get the crouching-dependent idle animation
	*/
	getIdleAnimation: function() {
		return this.crouching ? this.anims.crouch : this.anims.idle;
	},

	/*
	 * The player is killed and leaves a corpse
	 */
	kill: function() {
		this.deathSound.play();
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
