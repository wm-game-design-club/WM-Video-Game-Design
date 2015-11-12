ig.module(
	'game.entities.playersmooth'
).requires(
	'game.entities.player'
).defines(function() {
	
	// Create your own entity, subclassed from ig.Enitity
EntityPlayersmooth = EntityPlayer.extend({
	
	font: new ig.Font( 'media/04b03.font.png' ),
	
	// DO NOT USE THIS ENTITY
	// USE EntityPlayer INSTEAD
	
	draw: function() {
		this.parent();
		this.font.draw(0, 0, "WARNING: use Player, not PlayerSmooth");
	}
	
});
	
})