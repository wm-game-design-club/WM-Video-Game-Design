ig.module(
	'game.entities.enemyPatrol'
).requires(
	'game.entities.enemy',
	'game.entities.player'
).defines(function() {

EntityEnemyPatrol = EntityEnemy.extend({

	init: function( x, y, settings ) {

		this.parent();

		this.addAnim('idle', 0.1, [0]);
		this.addAnim('walk', 0.1, [0, 1, 2, 1]);
		this.addAnim('jump', 0.1, [3]);
		this.currentAnim = this.anims.idle;

		this.parent( x, y, settings );

		//presets modify these defaults
		// if(settings.preset=="SmarterPursuer") {
		//
		// 	this.maxHealth=7;
		// 	this.gravityFactor=1;
		// 	this.moveAccel=80;
		// 	this.jumpHeight=400;
		// 	this.jumpCut=1.6;
		//
		// 	this.maxVel.x = 170;
		// 	this.maxVel.y = 600;
		// 	this.friction.x = 1700;
		// 	this.moveAccel = 120;
		// }

		this.health=this.maxHealth; //set initial health
	},

	update: function() {
		// Call the parent update() method to move the entity
		// according to its physics

		this.parent();

		if(ig.game.getEntitiesByType(EntityPlayer).length==0) {
			this.currentAnim = this.anims.walk;
			this.vel.x=0;
			this.accel.x=0;
			return
		}
	},

	turnAround: function(dir) { //dir is a boolean: attacked from left = false, from right = true
		//called when attacked so that if attacked from behind, enemy turns around(after revising, this probably doesn't merit its own function...)
		if(dir==this.xFlip) this.xFlip=!this.xFlip;
	}



});
})
