ig.module(
    'game.entities.player'
)
.requires(
    'impact.entity'
)
.defines(function(){

// Create your own entity, subclassed from ig.Enitity
EntityPlayer = ig.Entity.extend({

    // Set some of the properties
    collides: ig.Entity.COLLIDES.ACTIVE,
    type: ig.Entity.TYPE.A,
    checkAgainst: ig.Entity.TYPE.B,

    size: {x: 36, y: 58},
    gravityFactor: 1,
    speed: 150,
    jump_speed: -400,
    lastPressed: 'left',
    
    // Load an animation sheet
    animSheet: new ig.AnimationSheet( 'media/mario_small.gif', 36, 58),
    
    init: function( x, y, settings ) {

        this.maxVel.x = 500;
        this.maxVel.y = 500;

        // Add animations for the animation sheet
        this.addAnim( 'walkRight', .1, [1,2,1,0]);
        this.addAnim( 'walkLeft', .1, [1,2,1,0]);
        this.addAnim( 'idleRight', .1, [0])
        this.addAnim( 'idleLeft', .1, [0])
        this.addAnim( 'jumpRight', .1, [3]);
        this.addAnim( 'jumpLeft', .1, [3]);

        this.currentAnim = this.anims.idleLeft;
        
        // Call the parent constructor
        this.parent( x, y, settings );
    },
    
    update: function() {
        
        // Call the parent update() method to move the entity
        // according to its physics
        this.parent();

        if(ig.input.state("left")){
            this.vel.x = -this.speed;
            this.currentAnim = this.anims.walkLeft;
            this.lastPressed = 'left';
        }

        if(ig.input.state("right")){
            this.vel.x = this.speed;
            this.currentAnim = this.anims.walkRight;
            this.lastPressed = 'right';
        }

        if(ig.input.state("right") && ig.input.state("left")) {
            this.vel.x = 0;
            if(this.lastPressed == 'left') {
                this.currentAnim = this.anims.idleLeft;
            }
            else {
                this.currentAnim = this.anims.idleRight;
            }
        }

        if(!ig.input.state("right") && !ig.input.state("left")) {
            this.vel.x = 0;
            if(this.lastPressed == 'left') {
                this.currentAnim = this.anims.idleLeft;
            }
            else {
                this.currentAnim = this.anims.idleRight;
            }
        }

        if(ig.input.pressed("jump") && this.standing){
            this.vel.y = this.jump_speed;
        }

        if(!this.standing) {
            if(this.lastPressed == 'left') {
                this.currentAnim = this.anims.jumpLeft;
            }
            else {
                this.currentAnim = this.anims.jumpRight;
            }
        }

        if(this.pos.x > 960) {
            ig.global.levelForwardSwitch = true;
        }

        if(this.pos.x < 0) {
            ig.global.levelBackSwitch = true;
        }
		
		this.currentAnim.flip.x = (this.lastPressed == 'left')

    }
});

});