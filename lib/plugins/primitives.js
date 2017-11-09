ig.module(
	'plugins.primitives'
).requires(
	'impact.system'
).defines(function() {

ig.Primitives = {

	// Draw line (game space coordinates)
	drawLine: function(x1, y1, x2, y2, style) {
		ig.Primitives.drawLineS(
			x1 - ig.game.screen.x,
			y1 - ig.game.screen.y,
			x2 - ig.game.screen.x,
			y2 - ig.game.screen.y,
			style
		);
	},

	// Draw line (screen space)
	drawLineS: function(x1, y1, x2, y2, style) {
		var startX = ig.system.getDrawPos(x1);
		var startY = ig.system.getDrawPos(y1);
			
		var endX = ig.system.getDrawPos(x2);
		var endY = ig.system.getDrawPos(y2);
			
		ig.system.context.strokeStyle = "red";
		ig.system.context.beginPath();
		ig.system.context.moveTo(startX,startY);
		ig.system.context.lineTo(endX,endY);
		ig.system.context.stroke();
		ig.system.context.closePath();
	}

}

});
