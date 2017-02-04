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
		LEAPEND:   5
		// we go back to peaceful when the player is lost
	},
	
	currentState: null,
	timerToNextState: new ig.Timer(),
	nextState: null,
	
	detectionRange: 800,
	
	init: function(x, y, settings) {
		this.currentState = this.states.PEACEFUL;
		this.addAnim('peaceful',   0.1, [0]);
		this.addAnim('shrieking',  0.1, [0]);
		this.addAnim('crawling',   0.1, [0]);
		this.addAnim('leap-begin', 0.1, [0]);
		this.addAnim('leaping',    0.1, [0]);
		this.addAnim('leap-end',   0.1, [0]);
		this.currentAnim = this.anims.peaceful;
		
		this.parent(x, y, settings);
	},
	
	update: function() {
		switch (this.currentState) {
		case states.PEACEFUL:
			if (this.nearPlayer()) {
				this.currentAnim = this.anims.shrieking;
				this.currentState = SHRIEKING;
			}
			break;
		case states.SHRIEKING:
			
		case states.CRAWLING:
			
		case states.LEAPSTART:
			
		case states.LEAPING:
			
		case states.LEAPEND:
			
		}
	},
	
	nearPlayer: function() {
		var player = ig.game.getEntitiesByType(EntityPlayer)[0];
		if (!player) return false;
		var dist2 = Math.pow(player.pos.x - this.pos.x, 2)
                  + Math.pow(player.pos.y - this.pos.y, 2);
		return (dist2 < detectionRange * detectionRange)
	}
});

});
