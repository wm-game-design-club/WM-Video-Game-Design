ig.module(
	'game.main'
)
.requires(
	'impact.game',
    'impact.font',
	'game.utils',
	//'plugins.director.director',
	//'game.levels.test',
	//'game.levels.level2',
	//'game.levels.Transfer2',
	//'game.levels.Transfer1',
    //'game.levels.thatroom',
	//'game.levels.mylevel',
    'game.levels.andrewlevel',
	'game.levels.AdamsLevelTest',
	'game.levels.CombatTest',
    'game.levels.hubroom',
	'game.levels.NaturalCaves'
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
		this.loadLevel( LevelHubroom );
		this.gravity = 1000;

		// Key Binding
		ig.input.bind(ig.KEY.LEFT_ARROW,'left');
		ig.input.bind(ig.KEY.RIGHT_ARROW,'right');
		ig.input.bind(ig.KEY.UP_ARROW,'jump');
		ig.input.bind(ig.KEY.Z, 'attack');
		ig.input.bind(ig.KEY.X, 'action');
		ig.input.bind(ig.KEY.C, 'crouch');
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
