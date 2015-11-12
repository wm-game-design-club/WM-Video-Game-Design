ig.module( 
	'game.main'
)
.requires(
	'impact.game',
	'impact.font',
	
	'game.entities.player',

	'plugins.director.director',
	'game.levels.AdamsLevelTest',
	'game.levels.mylevel',
	'game.levels.test',
	'game.levels.level2'

)
.defines(function(){

ig.global.levelForwardSwitch = false;
ig.global.levelBackSwitch = false;

MyGame = ig.Game.extend({
	
	// The coordinates that the camera scrolls to.
	cameraX: 0,
	cameraY: 0,
	cameraScroll: 0.4, // should be 0.0-1.0
	
	init: function() {

		this.myDirector = new ig.Director(this, [LevelTest,  LevelLevel2]);
		// Initialize your game here; bind keys etc.
		this.loadLevel( LevelMylevel );
		
		this.gravity = 1000;

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
		
		var player = this.getEntitiesByType(EntityPlayer)[0];
		if (player) {
			this.cameraX = player.pos.x - ig.system.width / 2;
			this.cameraY = player.pos.y - ig.system.height / 2;
		}
		function lerp(a, b, c) { return a + (b - a) * c; }
		this.screen.x = lerp(this.screen.x, this.cameraX, this.cameraScroll);
		this.screen.y = lerp(this.screen.y, this.cameraY, this.cameraScroll);
		
		this.parent();
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
