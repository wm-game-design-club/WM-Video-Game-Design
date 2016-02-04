ig.module(
	'game.entities.FloatingText'
).requires(
	'impact.entity',
	'impact.font',
	'impact.game'
).defines(function() {
	// This entity displays some text, controlled
	// by setting the "displayText" variable in Weltmeister.
	EntityFloatingText = ig.Entity.extend({
 		displayText: "Debug Text",
		font: new ig.Font('media/04b03.font.png'),
		
		size: {x: 128, y: 32},
		offset: {x: 64, y: 16},
		gravityFactor: 0,
		
		draw: function() {
			var x, y;
			x = this.pos.x - ig.game.screen.x;
			y = this.pos.y - ig.game.screen.y;
			this.font.draw(this.displayText, x, y, ig.Font.ALIGN.LEFT);
		}
	})
});