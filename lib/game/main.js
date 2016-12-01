ig.module(
	'game.main'
)
.requires(
	/*
	 * Levels are now loaded in LevelDebugLevelSelect.
	 * Put them there if you want to load them.
	 */
	'impact.game',
    'impact.font',
	'game.utils',
	'impact.debug.debug',
	'game.levels.DebugLevelSelect',
	'plugins.screenshaker' // Documentation in game/pluguins/screenshaker.js
)
.defines(function(){

//ig.global.levelForwardSwitch = false;
//ig.global.levelBackSwitch = false;

MyGame = ig.Game.extend({

	// The coordinates that the camera scrolls to.
	cameraX: 0,
	cameraY: 0,
	cameraScroll: 0.2, // should be 0.0-1.0

	normal_font: new ig.Font("media/font-normal.png"),

    player: null,

	init: function() {
		// Initialize your game here; bind keys etc.
		this.loadLevel(LevelDebugLevelSelect);
		this.gravity = 1000;

		// Key Binding
		ig.input.bind(ig.KEY.DOWN_ARROW, 'down');
		ig.input.bind(ig.KEY.LEFT_ARROW,'left');
		ig.input.bind(ig.KEY.RIGHT_ARROW,'right');
		ig.input.bind(ig.KEY.UP_ARROW,'jump');
		ig.input.bind(ig.KEY.Z, 'attack');
		ig.input.bind(ig.KEY.X, 'action');
		ig.input.bind(ig.KEY.H, 'hologram');
		ig.input.bind(ig.KEY.T, 'teleport');		
		ig.input.bind(ig.KEY.SPACE, 'confirm');
		ig.input.bind(ig.KEY.ENTER, 'confirm');
	},

	loadLevel: function( data ) {

		//EntityEnemyPursuer.navMaps=[]; //clear the navMaps from the previous level

		this.parent(data);
	},

	update: function() {
/* 		if( ig.global.levelForwardSwitch ) {
			this.myDirector.nextLevel();
			ig.global.levelForwardSwitch = false;
		}
		if( ig.global.levelBackSwitch ) {
			this.myDirector.previousLevel();
			ig.global.levelBackSwitch = false;
		} */

        this.player = this.getEntitiesByType(EntityPlayer)[0];
		if (this.player) {
			var cmap = ig.game.collisionMap;
			var width  = ig.system.width;
			var height = ig.system.height;
			this.cameraX = (this.player.pos.x - width / 2).limit(0, cmap.pxWidth - width);
			this.cameraY = (this.player.pos.y - height / 2).limit(0, cmap.pxHeight - height);
		}
		this.screen.x = Utils.lerp(this.screen.x, this.cameraX, this.cameraScroll);
		this.screen.y = Utils.lerp(this.screen.y, this.cameraY, this.cameraScroll);

		this.parent();
	},

    draw: function() {
        this.parent();
        // Draw player's health
        var message;
        if (this.player) {
            message = "Health: " + this.player.health;
        } else {
            message = "You're Dead";
        }
        this.normal_font.draw(message, 12, 10);
    }

});

// Game starts at 60fps, 960x640 window
ig.main( '#canvas', MyGame, 60, 960, 640, 1 );

});
