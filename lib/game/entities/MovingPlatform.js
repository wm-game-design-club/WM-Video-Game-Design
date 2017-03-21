ig.module(
    'game.entities.MovingPlatform'
).requires(
    'impact.entity'
).defines(function(){

EntityMovingPlatform = ig.Entity.extend({
    size: {x: 80, y: 16},
    maxVel: {x: 100, y: 100},
	
    type: ig.Entity.TYPE.NONE,
    checkAgainst: ig.Entity.TYPE.A,
    collides: ig.Entity.COLLIDES.FIXED,

    target: null,
    targets: [],
    currentTarget: 0,
    speed: 30,
    gravityFactor: 0,
    sticky: true,

    animSheet: new ig.AnimationSheet( 'media/luigi_small.gif', 36, 58 ),


    init: function( x, y, settings ) {
        this.addAnim( 'idle', 1, [0] );
		this.currentAnim=this.anims.idle;
        this.parent( x, y, settings );

        // Transform the target object into an ordered array of targets
        this.targets = ig.ksort( this.target );
    },


    update: function() {
        /* var oldDistance = 0;
        var target = ig.game.getEntityByName( this.targets[this.currentTarget] );
        if( target ) {
            oldDistance = this.distanceTo(target);

            var angle = this.angleTo( target );
            this.vel.x = Math.cos(angle) * this.speed;
            this.vel.y = Math.sin(angle) * this.speed;
        }
        else {
            this.vel.x = 0;
            this.vel.y = 0;
        } */


        this.parent();

		/*
        // Are we close to the target or has the distance actually increased?
        // -> Set new target
        var newDistance = this.distanceTo(target);
        if( target && (newDistance > oldDistance || newDistance < 0.5) ) {
            this.pos.x = target.pos.x + target.size.x/2 - this.size.x/2;
            this.pos.y = target.pos.y + target.size.y/2 - this.size.y/2;
            this.currentTarget++;
            if( this.currentTarget >= this.targets.length && this.targets.length > 1 ) {
                this.currentTarget = 0;
            }
        } */
    },
    
	check: function( other ) {
        if( other.vel.x != 0 ) {
            other.currentAnim = other.anims.run;
        }else{
            other.currentAnim = other.anims.idle;
        }

        //other.currentAnim.flip.x = other.flip;
    }
});

}); 