ig.module( 'game.entities.LevelGameOver' )
.requires(
  'impact.entity',
  'impact.font',
  'game.levels.DebugLevelSelect'
  ).defines(function(){

EntityLevelGameOver = ig.Entity.extend({

  choiceHeight: 32,

  options: [
    "Try Again",
    "Main Menu"
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
    this.pos.x = 380;
    this.addAnim('default', 0.1, [0], false);
    this.currentAnim = this.anims.default;
  },

  update: function() {
    this.parent();
    // Update the cursor's index based on input
    if (ig.input.pressed('jump')) {
      this.cursorIndex--;
      if (this.cursorIndex < 0)
        this.cursorIndex = this.options.length - 1;
    } else if (ig.input.pressed('down')) {
      this.cursorIndex = (this.cursorIndex + 1) % this.options.length;
    } else if (ig.input.pressed('confirm')) {
      if (this.cursorIndex == 0){
        ig.game.loadLevelDeferred( ig.global[ ig.game.currentLevel ] );
      } else {
        ig.game.loadLevel(LevelDebugLevelSelect);
      }
    }
  },


  draw: function() {
    // Draw "GAME OVER" in center of the screen
    this.font.draw("GAME OVER", 480, 270, ig.Font.ALIGN.CENTER);
    // Draw levels
    for (var i=0; i<this.options.length; i++) {
      var y = 320 + i * this.choiceHeight;
      this.font.draw(this.options[i], 480, y, ig.Font.ALIGN.CENTER);
    }
    // Draw cursor
    this.pos.y = 162 + this.cursorIndex * this.choiceHeight;

    this.parent();
  }


  });
});
