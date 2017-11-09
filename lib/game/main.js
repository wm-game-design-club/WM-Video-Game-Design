ig.module(
	'main'
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
	'game.levels.DebugGameOver',
	'plugins.screenshaker', // Documentation in game/plugins/screenshaker.js
	// 'plugins.primitives'
)
.defines(function(){

//ig.global.levelForwardSwitch = false;
//ig.global.levelBackSwitch = false;

MyGame = ig.Game.extend({
	// The coordinates that the camera scrolls to.
	cameraX: 0,
	cameraY: 0,
	cameraScroll: 0.2, // should be 0.0-1.0

	// Player's health bar
	healthBarAnim: new ig.Animation(
		new ig.AnimationSheet('media/health-bar.png', 186, 72),
		1, [0, 1, 2, 3, 4, 5]
	),
	healthBarX: 8,
	healthBarY: 8,

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
		ig.input.bind(ig.KEY.T, 'teleport');
		ig.input.bind(ig.KEY.SPACE, 'confirm');
		ig.input.bind(ig.KEY.ENTER, 'confirm');

		ig.input.bind(ig.KEY.MOUSE1, 'left-click');
		ig.input.bind(ig.KEY.MOUSE2, 'right-click');

		this.initializeMusicMap();
		ig.music.volume = 0.6;      //global music volume

	},

	loadLevel: function( data ) {
		//EntityEnemyPursuer.navMaps=[]; //clear the navMaps from the previous level
		this.parent(data);
		ig.music.play();
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

		// Camera control
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
        if (this.player) {
			this.healthBarAnim.gotoFrame(this.player.health);
			this.healthBarAnim.draw(this.healthBarX, this.healthBarY);
        }
    },

    gameOver: function() {
      this.loadLevelDeferred(LevelDebugGameOver);
    },


    /**
    * Creates a global map with levels as keys and an array of tracks as the value.
    */
    initializeMusicMap: function() {
      ig.global.musicMap = new Map();

      //Note that the tracks are ordered
      ig.global.musicMap.set("planetA",["planetA_happy-intro.ogg","planetA_happy-loop.ogg"]);
      ig.global.musicMap.set("hub",["hub_theme-intro.ogg","hub_theme-loop.ogg"]);
    },


    /**
    * Creates a global map with levels as keys and an array of tracks as the value.
    */
    prepareMusic: function(level_name) {
      if (!(ig.global.musicMap.has(level_name)))
        return;

      ig.music.tracks = [];
      var index = 0;

      while (index < ig.global.musicMap.get(level_name).length) {
        var track = ig.global.musicMap.get(level_name)[index];
        ig.music.add(new ig.Sound('media/music/'+ track,false),track);
        if (track.includes('loop')) {
          ig.music.tracks[index].loop = true;
        }
        index++;
      }
    }


});
// Game starts at 60fps, 960x640 window
ig.main( '#canvas', MyGame, 60, 960, 640, 1 );
});
