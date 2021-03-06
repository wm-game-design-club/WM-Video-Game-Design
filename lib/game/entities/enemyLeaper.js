ig.module(
	'game.entities.enemyLeaper'
).requires(
  'game.entities.enemy',
  'game.entities.player',
  'game.utils'
).defines(function() {

EntityEnemyLeaper = EntityEnemy.extend({

	// From impact.entity
	collides: ig.Entity.COLLIDES.PASSIVE,
	type: ig.Entity.TYPE.B,
	checkAgainst: ig.Entity.TYPE.A,

	size: {x: 64, y: 32},

	animSheet: new ig.AnimationSheet('media/leaper-debug-cells.png', 64, 32),

	gravityFactor: 1,

	// Inherited from enemy.js
	maxHealth: 3,
	
	player: null,

	// New stuff
	states: {
		// By default, this enemy isn't actively attacking the player.
		// For now, it isn't moving.
		PEACEFUL:  0,
		// When spotted, the enemy lets out a shriek, then goes into
		// combat.
		SHRIEKING: 1,
		// The enemy then goes into a crawling -> leapstart -> leaping -> leapend
		// cycle until it loses track of the player.
		CRAWLING:  2,
		// leapstart and leapend are just delays before and after leaping,
		// to give the player time to react and plan
		LEAPSTART: 3,
		LEAPING:   4,
		LEAPEND:   5,
		WAITING:   6,
		// we go back to peaceful when the player is lost
	},

	currentState: null,
	timerToNextState: new ig.Timer(),
	nextState: null,

	detectionRange: 800,
	shriekTime: 0.8,
	leapImpulse: {x: 800, y: -400},
	leapStartTime: 0.5,
	leapEndTime: 0.5,

	frameCounter: 0,

	init: function(x, y, settings) {
		this.currentState = this.states.PEACEFUL;
		this.addAnim('peaceful',   0.1, [0]);
		this.addAnim('shrieking',  0.1, [1]);
		this.addAnim('crawling',   0.1, [2]);
		this.addAnim('leapbegin', 0.1, [3]);
		this.addAnim('leaping',    0.1, [4]);
		this.addAnim('leapend',   0.1, [5]);
		this.currentAnim = this.anims.peaceful;
		
		this.gravity = 1;
		this.maxHealth = 3;
		this.maxVel.x = 170;
		this.maxVel.y = 600;
		this.friction.x = 1700;
		
		this.parent(x, y, settings);
	},

	update: function() {
		this.frameCounter++;
		switch (this.currentState) {
		case this.states.PEACEFUL:
			this.vel.x = 0;
			// If the player's close, start shrieking
			this.currentAnim = this.anims.peaceful;
			// TODO Have it not notice a player it can't see
			if (this.nearPlayer()) {
				this.currentState = this.states.SHRIEKING;
			}
			break;
		case this.states.SHRIEKING:
			// Shriek for a little bit
			this.currentAnim = this.anims.shrieking;
			this.prepNextState(this.states.CRAWLING, 0.8, true);
			break;
		case this.states.CRAWLING:
			// Jump in a bit
			if (this.nextState === null) {
				this.currentAnim = this.anims.crawling;
				this.prepNextState(this.states.LEAPSTART, 2.0, false);
			}

			// Try to get the bug a fair distance from the player
			Utils.doWithPlayer(this, function (me, player) {
				var targetPos = 0;
				if (me.pos.x > player.pos.x) {
					targetPos = player.pos.x + 400;
				} else {
					targetPos = player.pos.x - 400;
				}

				if (Math.abs(me.pos.x - targetPos) < 72) {
					me.vel.x = 0;
				} else {
					me.vel.x = 100 * ((me.pos.x > targetPos) * 2 - 1);
				}
			});
			var player = ig.game.getEntitiesByType(EntityPlayer)[0];


			// If the player's gone, become peaceful
			if (this.frameCounter % 16 == 0 && !this.nearPlayer()) {
				this.vel.x = 0;
				this.currentState = this.states.PEACEFUL;
				this.nextState = null;
			}
			break;
		case this.states.LEAPSTART:
			// Brace yourself, telegraph your leap
			this.currentAnim = this.anims.leapbegin;
			this.prepNextState(this.states.LEAPING, 0.5, true);
			break;
		case this.states.LEAPING:
			// Shoot yourself into the air!
			if (this.nextState === null) {
				Utils.doWithPlayer(this, function(me, player) {
					if (me.pos.x > player.pos.x) {
						me.vel.x -= me.leapImpulse.x;
					} else {
						me.vel.x += me.leapImpulse.x;
					}
					me.vel.y += me.leapImpulse.y;
					me.currentAnim = me.anims.leaping;
				});
			}
			if (this.standing) {
				this.currentState = this.states.LEAPEND;
			}
			break;
		case this.states.LEAPEND:
			// Give player the time to shoot you
			this.currentAnim = this.anims.leapend;
			this.prepNextState(this.states.CRAWLING, 0.5, true);
			break;
		case this.states.WAITING:
			// dummy state - wait until state timer runs out
			break;
		}
		// Go to the next state when the timer runs out
		if (this.nextState && this.timerToNextState.delta() > 0) {
			this.currentState = this.nextState;
			this.nextState = null;
		}
		this.parent();
	},

	nearPlayer: function() {
		var player = ig.game.getEntitiesByType(EntityPlayer)[0];
		if (!player) return false;
		var dist2 = Math.pow(player.pos.x - this.pos.x, 2)
                  + Math.pow(player.pos.y - this.pos.y, 2);
		return (dist2 < this.detectionRange * this.detectionRange)
	},

	/*
	 * Schedule a state change in time seconds.
	 *
	 * If wait is true, the entity will be held in the
	 * WAITING state until time's up.
	 */
	prepNextState: function(state, time, wait) {
		if (this.timerToNextState.delta() < 0) {
			console.warn("Prepped a new state on top of an old prep");
		}
		this.timerToNextState.set(time);
		this.nextState = state;
		if (wait)
			this.currentState = this.states.WAITING;
	}
});

});
