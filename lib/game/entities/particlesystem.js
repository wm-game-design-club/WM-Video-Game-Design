ig.module(
	'game.entities.particlesystem'
).requires(
	'impact.entity',
	'impact.timer',
	'game.entities.particle'
).defines(function() {

/*
 * An entity for creating simple particle systems.
 *
 * Particle systems are essentially "fountains" that spawn small sprites (particles) from
 * a point or area. These particles' opacity and movement are all controlled via
 * a mixture of deterministic and random factors that the programmer sets.
 *
 * Particle systems simulate effects, like water, fire, and smoke, that are difficult to
 * do through sprites.
 *
 * A simple particle system, for example, simluates smoke by spawning small gray circles that
 * gradually fade out and float updward.
 */

 EntityParticlesystem = ig.Entity.extend({
	
	// Particles are emitted from the bounding box of the system
	 size: {x: 320, y: 320},
	 
	// SPAWNING
	// rate of emission (particles/second)
	emissionRate: 10,
	// destroy particle if offscreen
	//~destroyIfOffscreen: true,

	// LIFETIME
	// particle lifetime (seconds)
	lifetime: 1.3,

	// DISPLAY [TODO rework animations]
	// display mode (lighter, normal, etc.)
	//~blend: 'lighter',
	// animation (ig.animation object)
	spawnedAnimSheet: new ig.AnimationSheet('media/default-corpse.png', 48, 32),
	spawnedAnimTime: 0.1,
	spawnedAnimFrames: [0],
	spawnedAnimStop: false,
	// grab from animation at random?
	//~ spawnedRandomFrame: false,

	// ALPHA
	// starting alpha
	minStartAlpha: 0.7,
	maxStartAlpha: 1.0,
	// fade out time (seconds)
	minFadeTime: 1.0,
	maxFadeTime: 1.3,

	// MOVEMENT
	// start velocity
	startVelocity: {min_x: -100.0, min_y: -1000,
	                max_x: -100.0, max_x: 100.0},
	// acceleration
	acceleration: {x: 0.0, y: 15.0},
	 
	//-----
	// End configuration section
	//-----
	 
	gravityFactor: 0,
	
	init: function(x, y, settings) {
		this.parent(x, y, settings);
		this.emissionTimer = new ig.Timer(1.0 / this.emissionRate);
		this.emissionTimer.tick();
	},
	
	update: function() {
		this.parent();
		var t = this.emissionTimer.delta();
		if (t > 0) {
			var sinceLastSpawn = this.emissionTimer.tick();
			var toSpawn = Math.floor(sinceLastSpawn * this.emissionRate);
			while (toSpawn-- > 0) {
				var spawnX = this.randomBetween(this.pos.x, this.pos.x + this.size.x);
				var spawnY = this.randomBetween(this.pos.y, this.pos.y + this.size.y);
				var spawnSettings = {
					lifetime:   this.lifetime,
					animSheet:  this.spawnedAnimSheet,
					animTime:   this.spawnedAnimTime,
					animFrames: this.spawnedAnimFrames,
					animStop:   this.spawnedAnimStop,

					alpha: this.randomBetween(this.minStartAlpha, this.maxStartAlpha),
					fadeRate: 1.0 / this.randomBetween(this.minFadeTime, this.maxFadeTime),

					// maxVel: {x: 10000, y: 10000},
					// vel: {x: 100, y: 100},
					// vel: {x: this.randomBetween(this.startVelocity.min_x, this.startVelocity.max_x),
					//       y: this.randomBetween(this.startVelocity.min_y, this.startVelocity.max_y)},
					// accel: this.acceleration
				};
				ig.game.spawnEntity(EntityParticle, spawnX, spawnY, spawnSettings);
			}
			this.emissionTimer.reset();
		}
	},
	
	draw: function() {
		this.parent();
	},
	
	randomBetween: function(min, max) {
		return min + Math.random() * (max - min);
	}
	 
 });

	
})

