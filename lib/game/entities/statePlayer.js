/*
 * Refactored version of player.js that uses a State pattern.
 * It uses somewhat more advanced Javascript, but is also a lot
 * more elegant and easy to reason about.
 *
 * Eventually, this code will replace player.js, but I want to put
 * it into a second entity so that I can "prove" that its behavior
 * is equivalent to the original player.js.
 */
ig.module(
	'game.entities.statePlayer'
).requires(
	'impact.entity',
	'impact.timer',
	'game.entities.enemy',
	'game.entities.corpse'
).defines(function() {

// Create your own entity, subclassed from ig.Entity
EntityStatePlayer = ig.Entity.extend({
	
	// What kinds of entities does the player collide with, and how?
	// http://impactjs.com/documentation/collision
	collides: ig.Entity.COLLIDES.ACTIVE,
	type: ig.Entity.TYPE.A,
	checkAgainst: ig.Entity.TYPE.B,

	// Used in ig.game.getEntityByName, among other things
	name: "player",
	
	// A rectangle is drawn around each entity for collisions
	size: {x: 32, y: 64},
	
	// Physics engine parameters
	// See also maxVel, friction, vel, accel
	gravityFactor: 2,
	bounciness: 0,
	
	// Self-explanatory. But you can set this to true for any entity!
	// By default, it's false.
	freezeOnDialogue: true,
	
	// Technically a parameter of all entities, see entity.receiveDamage()
	// and entity.kill()
	health: 5,
	
	// Entity-specific properties
	
	// How fast the character accelerates
	moveAccel: 4500, 
	// With how much force the player jumps
	jumpHeight: 600, 
	// If the player lets go of the up key,
	// upward velocity is cut by this factor
	jumpCut: 1.6,    

	// When teleporting, time is slowed
	teleportSlowdown: 0.05,
	// After teleporting, it takes this many seconds to recharge
	teleportRechargeTime: 1,
	// Maximum distance, in pixels, you can teleport
	teleportDistance: 192,

	// How long should the character by invincible after getting hit?
	invincibilityTime: 0.8,
	
	// Internal variables
	teleportPos: {x: 0, y:0},
	teleportLerpPos: {x: 0, y: 0},

	invincibilityTimer: new ig.Timer(),
	invincibilityFrame: false,
	
	flip: false,

	corpsePath: 'media/default-corpse.png',
    corpseWidth: 48,
    corpseHeight: 32,
	
	animSheet: new ig.AnimationSheet('media/main-character.png', 32, 64),

	deathSound: new ig.Sound('media/sounds/power down synth.ogg'),

	IdleState: function(player) {
		this.player = player;
		this.update = function() {
			
		};
	},
	
	JumpState: function(player) {
		this.player = player;
		this.update = function() {
			
		};
	},
	
	FallState: function(player) {
		this.player = player;
		this.update = function() {
			
		};
	},
	
	
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

		// Call the parent constructor.
		// Do this, or There Will Be Blood
		this.parent( x, y, settings );
	},

	/*
	 * Respond to input. Flip the animation
	 * when moving backwards.
	 */
	update: function() {
		// Update the object's physics
		this.parent();
	},

	/*
	 * The player is damaged by enemies.
	 *
	 * collideWith specifically applies to colliding with other entities;
	 * use check() for collision with the environment
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

		// Debugging lines, feel free to take these out
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
					this.teleportPos.y
				);
			}
		}
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
