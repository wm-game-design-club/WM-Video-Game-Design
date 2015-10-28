ig.module( 
	'game.main'
)
.requires(
	'impact.game',
	'impact.font',

	'game.entities.player',

	'game.levels.test',
	'game.levels.level2',

	'plugins.director.director'
)
.defines(function(){

ig.global.levelForwardSwitch = false;
ig.global.levelBackSwitch = false;

MyGame = ig.Game.extend({
	
	// Load a font
	font: new ig.Font( 'media/04b03.font.png' ),
	
	init: function() {

		this.myDirector = new ig.Director(this, [LevelTest,  LevelLevel2]);
		// Initialize your game here; bind keys etc.

		this.loadLevel( LevelTest );

		this.gravity = 500;

		// Key Binding

		ig.input.bind(ig.KEY.LEFT_ARROW,'left');
		ig.input.bind(ig.KEY.RIGHT_ARROW,'right');
		ig.input.bind(ig.KEY.UP_ARROW,'jump');
	},
	
	update: function() {

		if( ig.global.levelForwardSwitch ) {
			this.myDirector.nextLevel();
			ig.global.levelForwardSwitch = false;
		}
		if( ig.global.levelBackSwitch ) {
			this.myDirector.previousLevel();
			ig.global.levelBackSwitch = false;
		}

		// Update all entities and backgroundMaps
		this.parent();
		
		// Add your own, additional update code here
	},
	
	draw: function() {
		// Draw all entities and backgroundMaps
		this.parent();
	}
});


// Start the Game with 60fps, a resolution of 320x240, scaled
// up by a factor of 2
ig.main( '#canvas', MyGame, 60, 960, 640, 1 );

});
