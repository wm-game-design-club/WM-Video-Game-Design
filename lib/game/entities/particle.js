ig.module(
	'game.entities.particle'
).requires(
	'impact.entity',
	'impact.entity-pool',
).defines(function() {

/*
 * Simulates a single particle.
 */

EntityParticle = ig.Entity.extend({

	_wmIgnore: true,
	
	// Not really relevant, since particles don't collide
	collides: ig.Entity.COLLIDES.NEVER,
	size: {x: 8, y: 8},
	 
	// SPAWNING
	// destroy particle if offscreen
	//~destroyIfOffscreen: true,
	
	// LIFETIME
	// particle lifetime (seconds)
	lifetime: 3.0,
	
	// DISPLAY [TODO rework animations]
	// display mode (lighter, normal, etc.)
	//~blend: 'lighter',
	
	animSheet: null,
	animTime: 0.1,
	animFrames: [0],
	animStop: false,
	
	// grab from animation at random?
	//~ randomFrame: false,
	// frame: 0
	
	// ALPHA
	// starting alpha
	alpha: 1.0,
	fadeRate: 0.0, // opacity lost/second
	
	// MOVEMENT
	// start velocity
	vel: {x: 0, y: 0},
	// acceleration
	accel: {x: 0.0, y: 0.0},
	
	init: function(x, y, settings) {
		this.parent(x, y, settings);
		if (this.animSheet === null) {
			console.log("Particle spawned without giving it an animSheet first");
		}
	
		this.addAnim('base', this.animTime, this.animFrames, this.animStop);
	
		this.currentAnim = this.anims.base;
		this.currentAnim.alpha = settings.alpha;
	},
	
	reset: function(x, y, settings) {
		this.parent(x, y, settings);
	},
	
	update: function() {
		this.parent();
		this.lifetime -= ig.system.tick;
		this.currentAnim.alpha -= this.fadeRate * ig.system.tick;
		if (this.lifetime < 0 || (this.fadeRate > 0 && this.currentAnim.alpha <= 0)) {
			this.kill();
		}
	},
	
	draw: function() {
		this.parent();
	},
	
	kill: function() {
		this.parent();
	},
	
	handleMovementTrace: function(res) {
		// TODO disable collision
	}
		 
});

//ig.EntityPool.enableFor(EntityParticle);

})
