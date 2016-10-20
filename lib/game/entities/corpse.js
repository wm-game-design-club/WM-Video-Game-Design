ig.module(
    'game.entities.corpse'
).requires(
    'impact.entity'
).defines(function() {
    
/*
 * A corpse, spawned when a player or enemy dies.
 * It interacts with terrain, but doesn't collide with other entities.
 * After awhile, it disappears.
 *
 * To use this entity, set "animPath", "animWidth", and "animHeight" in settings.
 * For now, a corpse is a one-frame animation, and its bounding box is the size of
 * its animation.
 *
 * animPath is the path to the sprite (e.g. media/goomba-corpse.gif)
 * animWidth and animHeight are the dimensions of the corpse
 */
EntityCorpse = ig.Entity.extend({
    
    collides: ig.Entity.COLLIDES.NONE,
    type: ig.Entity.TYPE.NONE,
    
    gravityFactor: 1,
    maxVel: {x: 1000, y: 1000},
    
    settingsWrong: false,
    settingsMessageFont: null,

    init: function( x, y, settings ) {
        // If the settings are incorrect, we create a debug message
        if (!settings.animPath || !settings.animWidth || !settings.animHeight) {
            this.settingsWrong = true;
            this.settingsMessageFont = new ig.Font("media/font-normal.png");
            return;
        }
        var animPath = settings.animPath;
        var animWidth  = parseInt(settings.animWidth);
        var animHeight = parseInt(settings.animHeight);
        
        this.size = {x: animWidth, y: animHeight};
        this.animSheet = new ig.AnimationSheet(animPath, animWidth, animHeight);
        this.addAnim('idle', 0.1, [0]);
        this.currentAnim = this.anims.idle;

		this.zIndex = -9999;

        this.parent( x, y, settings );
    },

    draw: function() {
        if (this.settingsWrong) {
			var text = "Set animPath, animWidth, animHeight\nto configure this corpse";
			this.settingsMessageFont.draw(text, this.pos.x, this.pos.y, ig.Font.ALIGN.LEFT);
        } else {
            this.parent();
        }
    }
    
});
    
})
