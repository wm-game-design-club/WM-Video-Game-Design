ig.module( 
	'game.main'
)
.requires(
	'impact.game',
	'game.utils',
	
	'plugins.director.director',
	'game.levels.AdamsLevelTest',
	'game.levels.mylevel',
	'game.levels.NaturalCaves',
	'game.levels.test',
	'game.levels.level2',
	'game.levels.Transfer2',
	'game.levels.Transfer1',
        'game.levels.andrewlevel',
        'game.levels.thatroom'
)
.defines(function(){

ig.global.levelForwardSwitch = false;
ig.global.levelBackSwitch = false;

MyGame = ig.Game.extend({
	
	// The coordinates that the camera scrolls to.
	cameraX: 0,
	cameraY: 0,
	cameraScroll: 0.2, // should be 0.0-1.0
	
	init: function() {

		this.myDirector = new ig.Director(this, [LevelTest,  LevelLevel2]);
		// Initialize your game here; bind keys etc.
		this.loadLevel( LevelTransfer1 );
		
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
			var cmap = ig.game.collisionMap;
			var width  = ig.system.width;
			var height = ig.system.height;
			this.cameraX = Utils.clamp(player.pos.x - width, 0, cmap.pxWidth - width);
			this.cameraY = Utils.clamp(player.pos.y - height, 0, cmap.pxHeight - height);
		}
		this.screen.x = Utils.lerp(this.screen.x, this.cameraX, this.cameraScroll);
		this.screen.y = Utils.lerp(this.screen.y, this.cameraY, this.cameraScroll);
		
		this.parent();
	}
	
	
});


// Start the Game with 60fps, a resolution of 320x240, scaled
// up by a factor of 2
ig.main( '#canvas', MyGame, 60, 960, 640, 1 );

});
