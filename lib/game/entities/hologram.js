ig.module(
	'game.entities.hologram'
).requires(
	'impact.entity',
	'game.utils'
).defines(function() {
	
// A hologram projected by the player whenever (s)he's about to teleport.
EntityHologram = ig.Entity.extend({

	size: {x: 36, y: 58},
	gravityFactor: 0,
	
	destination: {'x': 0, 'y': 0},
	flip: false,
	
	// Load an animation sheet
	animSheet: new ig.AnimationSheet('media/mario_hologram.gif', 36, 58),
	
	/*
	 * settings = { "flip": bool }
	 */
	init: function( x, y, settings ) {
		this.addAnim('idle', 0.1, [0]);
		this.addAnim('walk', 0.1, [0, 1, 2, 1]);
		this.addAnim('jump', 0.1, [3]);

		this.currentAnim = this.anims.idle;
		this.currentAnim.flip.x = settings.flip || false;
		
		this.destination.x = x;
		this.destination.y = y;
		this.parent( x, y, settings );
	},
	  
	update: function() {
		this.pos.x = Utils.lerp(this.pos.x, this.destination.x, 0.6);
		this.pos.y = Utils.lerp(this.pos.y, this.destination.y, 0.6);
	},
	
	setDestination: function(x, y) {
		this.destination = {'x': x, 'y': y};
	}
	  
	
	});
});

