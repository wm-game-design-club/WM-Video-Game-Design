ig.module(
	'game.entities.test'
).requires(
	'impact.entity'
).defines(function() {

EntityTest = ig.Entity.extend({

    // Set some of the properties
    collides: ig.Entity.COLLIDES.ACTIVE,
    type: ig.Entity.TYPE.A,
    checkAgainst: ig.Entity.TYPE.B,
    
    size: {x: 32, y: 16},
	
    // Load an animation sheet
    animSheet: new ig.AnimationSheet('media/bullet.png', 32, 16),
    
    init: function( x, y, settings ) {
        this.parent( x, y, settings );
        ig.input.initMouse();
        
        this.addAnim("default", 1, [0]);
        this.anims.currentAnim = this.anims["default"];
    },
    
    update: function() {
		this.parent();
		this.pos.x = ig.input.mouse.x + ig.game.screen.x - this.size.x / 2;
		this.pos.y = ig.input.mouse.y + ig.game.screen.y - this.size.y / 2;
	}
	
});
	
})
