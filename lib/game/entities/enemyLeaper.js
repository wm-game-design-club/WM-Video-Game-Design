ig.module(
  'game.entities.enemyLeaper'
).requires(
  'game.entities.enemy',
  'game.entities.player'
).defines(function() {

EntityEnemyLeaper = EntityEnemy.extend({
	
	// From impact.entity
	collides: ig.Entity.COLLIDES.PASSIVE,
	type: ig.Entity.TYPE.B,
	checkAgainst: ig.Entity.TYPE.A,

	size: {x: 64, y: 32},
	
	animSheet: new ig.AnimationSheet('media/leaper-debug-cells.png', 64, 32),

	// Inherited from enemy.js
	maxHealth: 3,
	
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
	
	detectionRange: 200,
	shriekTime: 0.8,
	leapStartTime: 0.5,
	leapEndTime: 1.0,

	frameCounter: 0,
	
	init: function(x, y, settings) {
		this.currentState = this.states.PEACEFUL;
		this.addAnim('peaceful',   0.1, [0]);
		this.addAnim('shrieking',  0.1, [1]);
		this.addAnim('crawling',   0.1, [2]);
		this.addAnim('leap-begin', 0.1, [3]);
		this.addAnim('leaping',    0.1, [4]);
		this.addAnim('leap-end',   0.1, [5]);
		this.currentAnim = this.anims.peaceful;
		
		this.parent(x, y, settings);
	},
	
	update: function() {
		this.frameCounter++;
		switch (this.currentState) {
		case this.states.PEACEFUL:
			this.currentAnim = this.anims.peaceful;
			if (this.nearPlayer()) {
				this.currentState = this.states.SHRIEKING;
			}
			break;
		case this.states.SHRIEKING:
			this.currentAnim = this.anims.shrieking;
			this.timerToNextState.set(0.8);
			this.nextState = this.states.CRAWLING;
			this.currentState = this.states.WAITING;
			break;
		case this.states.CRAWLING:
			// If the player's gone, become peaceful
			this.currentAnim = this.anims.crawling;
			if (this.frameCounter % 16 == 0 && !this.nearPlayer()) {
				this.currentState = this.states.PEACEFUL;
			}
			break;
		case this.states.LEAPSTART:
			break;
		case this.states.LEAPING:
			break;
		case this.states.LEAPEND:
			break;
		case this.states.WAITING:
			if (this.nextState && this.timerToNextState.delta() > 0) {
				this.currentState = this.nextState;
				this.nextState = null;
			}
			break;
		}
	},
	
	nearPlayer: function() {
		var player = ig.game.getEntitiesByType(EntityPlayer)[0];
		if (!player) return false;
		var dist2 = Math.pow(player.pos.x - this.pos.x, 2)
                  + Math.pow(player.pos.y - this.pos.y, 2);
		return (dist2 < this.detectionRange * this.detectionRange)
	}
});

});
