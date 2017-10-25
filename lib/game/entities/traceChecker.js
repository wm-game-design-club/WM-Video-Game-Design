ig.module(
	'game.entities.traceChecker'
).requires(
	'plugins.primitives',
	'impact.entity'
).defines(function() {

EntityTraceChecker = ig.Entity.extend({

	traceStart: {x: 0, y: 0},

	font: new ig.Font("media/font-normal.png"),

	update: function() {
		this.parent();
		this.pos.x = ig.input.mouse.x + ig.game.screen.x;
		this.pos.y = ig.input.mouse.y + ig.game.screen.y;
		if (ig.input.pressed('left-click')) {
			this.traceStart.x = this.pos.x;
			this.traceStart.y = this.pos.y;
		}
		ig.show("mx", ig.input.mouse.x);
		ig.show("my", ig.input.mouse.y);
	},

	draw: function() {
		this.parent();
		if (ig.input.state('left-click')) {
			var trace = ig.game.collisionMap.trace(
				this.pos.x, this.pos.y,
				this.traceStart.x - this.pos.x,
				this.traceStart.y - this.pos.y,
				this.size.x, this.size.y
			);
			var msg = "Colls: ";
			if (trace.collision.x) msg += "X";
			if (trace.collision.y) msg += "Y";
			if (trace.collision.slope) msg += "S";
			var hasCollided = !!msg;
			msg += "\n";
			msg += "Pos: (" + Math.floor(trace.pos.x) + ", " + trace.pos.y + ")\n";
			msg += "Tile: (" + Math.floor(trace.tile.x) + ", " + trace.tile.y + ")\n";
			var sx = this.traceStart.x - ig.game.screen.x;
			var sy = this.traceStart.y - ig.game.screen.y;
			this.font.draw(msg, sx, sy, ig.Font.ALIGN.RIGHT);
			
			if (hasCollided) {
				ig.Primitives.drawLine(
					trace.pos.x, trace.pos.y,
					this.traceStart.x, this.traceStart.y,
					'red'
				);
			} else {
				ig.Primitives.drawLine(
					this.pos.x, this.pos.y,
					this.traceStart.x, this.traceStart.y,
					'red'
				);
			}
		}
	}

});

});
