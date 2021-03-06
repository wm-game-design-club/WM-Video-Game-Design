ig.module(
	'game.entities.FloatingText'
).requires(
	'impact.entity',
	'impact.font',
	'impact.game'
).defines(function() {
	/*
	 * An entity that displays some text within the level.
	 * You can control the text displayed by setting "text" in
	 * the properties.
	 */
	EntityFloatingText = ig.Entity.extend({
 		
		_wmScalable: true,
		
		text: "Set the text property to control what I say!",
		font: new ig.Font('media/font-normal.png'),
		
		size: {x: 128, y: 32},
		offset: {x: 64, y: 16},
		gravityFactor: 0,
		
		draw: function() {
			var x, y;
			x = this.pos.x - ig.game.screen.x;
			y = this.pos.y - ig.game.screen.y;
			
			this.font.draw(this.text, x, y, ig.Font.ALIGN.LEFT);
		}
	})
});
