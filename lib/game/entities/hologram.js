ig.module(
	'game.entities.hologram'
).requires(
	'impact.entity'
).defines(function() {
	
// A hologram projected by the player whenever (s)he's about to teleport.
EntityHologram = ig.Entity.extend({

	size: {x: 36, y: 58},
	gravityFactor: 0,
	
	flip: false,
	
	// Load an animation sheet
	animSheet: new ig.AnimationSheet('media/mario_hologram.gif', 36, 58),
	
	init: function( x, y, settings ) {
		//if (settings.direction == 'left') {
		//this.flip = true;
		// Add animations for the animation sheet
		this.addAnim('idle', 0.1, [0]);
		this.addAnim('walk', 0.1, [0, 1, 2, 1]);
		this.addAnim('jump', 0.1, [3]);

		this.currentAnim = this.anims.idle;
		
		if (ig.input.state('left')) {
			this.currentAnim.flip.x = true;
		}
		
		// Call the parent constructor
		this.parent( x, y, settings );
	},
	  
	update: function() {
		if( ig.input.released('hologram') ) {
			this.kill();
		}
	}
	  
	
	});
});

