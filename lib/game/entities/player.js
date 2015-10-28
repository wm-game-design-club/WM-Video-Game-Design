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

    size: {x: 140, y: 93},
    gravityFactor: 1,
    speed: 150,
    jump_speed: -350,
    lastPressed: 'left',
    
    // Load an animation sheet
    animSheet: new ig.AnimationSheet( 'media/rhino.png', 140, 93 ),
    
    init: function( x, y, settings ) {

        this.maxVel.x = 500;
        this.maxVel.y = 500;

        // Add animations for the animation sheet
        this.addAnim( 'walkRight', .05, [0,1,2,3,4,5,6,7,8,9] );
        this.addAnim( 'walkLeft', .05, [10,11,12,13,14,15,16,17,18,19] );
        this.addAnim( 'idleRight', 0.2, [20])
        this.addAnim( 'idleLeft', 0.2, [50])
        this.addAnim( 'jumpRight', 0.1, [30] );
        this.addAnim( 'jumpLeft', 0.1, [40] );

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
    }
});

});