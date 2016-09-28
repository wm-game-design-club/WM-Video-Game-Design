//healthbar.js

ig.module(
    'game.entities.healthBar'
)
.requires(
    'impact.game',
    'impact.entity',
    'impact.background-map'
)
.defines(function(){
 
EntityHealthBar = ig.Entity.extend({
    size: {x:32, y:5},
    animSheet: new ig.AnimationSheet( 'media/HealthBar.png', 32, 5 ),
    Unit:0,
    init: function(x, y, settings) {
        this.addAnim('10', 1, [0]);
        this.addAnim('9', 1, [1]);
        this.addAnim('8', 1, [2]);
        this.addAnim('7', 1, [3]);
        this.addAnim('6', 1, [4]);
        this.addAnim('5', 1, [5]);
        this.addAnim('4', 1, [6]);
        this.addAnim('3', 1, [7]);
        this.addAnim('2', 1, [8]);
        this.addAnim('1', 1, [9]);
        this.addAnim('0', 1, [10]);

        this.parent(x, y, settings);
        this.zIndex = 6;
    },
    update: function(){

        this.pos.x = this.Unit.pos.x - 12;
        this.pos.y = this.Unit.pos.y -30;
        for (var i=10;i>-1;i--){
            if(this.Unit.health == this.Unit.maxHealth){
                this.currentAnim = this.anims[10];
            }
            else if(this.Unit.health >= (this.Unit.maxHealth * (i*0.1))
                    && this.Unit.health < this.Unit.maxHealth * ((i*0.1)+0.1)){
                this.currentAnim = this.anims[i];
            }else if (this.Unit.health <= 0 ){
                this.kill();
            }
        }
    }
 
});
 
});