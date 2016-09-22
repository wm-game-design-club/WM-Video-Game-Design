ig.module(
	'game.entities.hologram'
).requires(
	'impact.entity'
).defines(function() {
	
// A hologram projected by the player whenever (s)he's about to teleport.
// TODO Make this blue and flickering.
EntityHologram = ig.Entity.extend({

	_wmIgnore: true,

	collides: ig.Entity.COLLIDES.NONE,
	
	size: {x: 36, y: 58},
	gravityFactor: 0,
	
	// Load an animation sheet
	animSheet: new ig.AnimationSheet('media/mario_small.gif', 36, 58),
	
	// include {player: this} when spawning this from the player
	init: function( x, y, settings ) {
		var player = settings.player;
		if (player == undefined) {
			console.error("Hologram spawned without its player");
		}
		
		//this.anims = ig.copy(player.anims);
		this.parent( x, y, settings );
	},
	
	update: function() {
		this.parent();
		this.pos.x = this.player.teleportPos.x;
		this.pos.y = this.player.teleportPos.y;
		// problem - this.player.currentAnim is some kind of pointer/reference
		// to the player's animation, so even if I copy it, I can't
		// do any effects on it
		this.currentAnim = this.player.currentAnim;
	},
	
	draw: function() {
		if (this.player.isTeleporting()) this.parent();
	}
	
});
	
})
