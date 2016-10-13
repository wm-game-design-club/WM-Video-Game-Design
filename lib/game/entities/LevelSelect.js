ig.module(
	'game.entities.LevelSelect'
).requires(
	'impact.entity',
	'impact.font',
	"game.levels.AdamsLevelTest",
	"game.levels.CombatTest",
	"game.levels.NaturalCaves",
	"game.levels.SimpleHub",
	"game.levels.Transfer1",
	"game.levels.Transfer2",
	"game.levels.andrewlevel",
	"game.levels.hiveplains",
	"game.levels.hubroom",
	"game.levels.level2",
	"game.levels.mylevel",
	"game.levels.test",
	"game.levels.thatroom"
).defines(function() {

/*
 * Implements a simple level select menu.
 * Use the arrow keys to navigate and the spacebar to select a level.
 */
EntityLevelSelect = ig.Entity.extend({

	choiceHeight: 32,

	levels: [
		"AdamsLevelTest.js",
		"CombatTest.js",
		"NaturalCaves.js",
		"SimpleHub.js",
		"Transfer1.js",
		"Transfer2.js",
		"andrewlevel.js",
		"hiveplains.js",
		"hubroom.js",
		"level2.js",
		"mylevel.js",
		"test.js",
		"thatroom.js",
	],
	cursorIndex: 0,

	gravityFactor: 0,

	font: new ig.Font("media/font-normal.png"),
	big_font: new ig.Font("media/font-large.png"),

	size: {x: 128, y: 128},
	animSheet: new ig.AnimationSheet("media/ff7-cursor.png", 48, 24),

	init: function( x, y, settings ) {
		this.parent( x, y, settings );

		// The entity itself is used as a cursor
		this.pos.x = 0;
		this.addAnim('default', 0.1, [0], false);
		this.currentAnim = this.anims.default;
	},
	
	update: function() {
		this.parent();
		// Update the cursor's index based on input
		if (ig.input.pressed('jump')) {
			this.cursorIndex--;
			if (this.cursorIndex < 0)
				this.cursorIndex = this.levels.length - 1;
		} else if (ig.input.pressed('down')) {
			this.cursorIndex = (this.cursorIndex + 1) % this.levels.length;
		} else if (ig.input.pressed('confirm')) {
			var level_name = this.levels[this.cursorIndex];
			level_name = level_name.match(/(.*)\.js/i)[1];
			level_name = "Level" + level_name[0].toUpperCase() + level_name.slice(1);
			var level = ig.global[level_name];
			if (level) {
				ig.game.loadLevelDeferred(level);
			} else {
				console.error(level_name + " does not exist");
			}
		}
	},
	
	draw: function() {
		// Draw "LEVEL SELECT" in top-left corner
		this.font.draw("LEVEL SELECT", 0, 32, ig.Font.ALIGN.LEFT);
		// Draw levels
		for (var i=0; i<this.levels.length; i++) {
			var y = 64 + i * this.choiceHeight;
			this.font.draw(this.levels[i], 48, y, ig.Font.ALIGN.LEFT);
		}
		// Draw cursor
		this.pos.y = 64 + this.cursorIndex * this.choiceHeight;

		this.parent();
	}
	
});
	
})
