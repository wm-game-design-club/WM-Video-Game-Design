ig.module(
	'game.entities.enemyPatrol'
).requires(
	'game.entities.enemy',
	'game.entities.player'
).defines(function() {

/*
* EntityEnemyPatrol
* -----------------
* An enemy entity that has a left/right patrolling behavior.
*/

EntityEnemyPatrol = EntityEnemy.extend({

	//Enum to specify moving left/right/pause
	directionEnum: {
	    LEFT : 0,
	    RIGHT : 1,
			PAUSE: 2,
	},

	initialPos: {x: 0, y: 0}, //Global position variable

	initialPatrolDirection: 0, //Initial walking direction set in weltmeister
	currentPatrolDirection: 0,
	patrolRange: 100, // Default patrol range.  Can be set in weltmeister.
	// Boolean used to determine if the enemy has begun turning in the other direction.
	// Takes velocity + acceleration inertia into account
	needsToTurn: false,

	init: function( x, y, settings ) {

		// this.parent();

		this.addAnim('idle', 0.1, [0]);
		this.addAnim('walk', 0.1, [0, 1, 2, 1]);
		this.currentAnim = this.anims.idle;

		this.patrolRange = 100;
		this.currentPatrolDirection = this.directionEnum.LEFT;
		this.initialPos = this.pos;
		this.initialPatrolDirection = this.directionEnum.LEFT;
		this.needsToTurn = false;
		//TODO: set patrol range from weltmeister

		this.initialPos = x;

		this.maxHelath	= 7;
		this.maxVel.x 	= 170;
		this.maxVel.y 	= 600;
		this.moveAccel 	= 120;
		this.friction.x = 1700;

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

		// Calculate distance moved from spawn location
		// and turn around if moved farther than patrolRange
		if(Math.abs(this.initialPos - this.pos.x) > this.patrolRange && this.needsToTurn == false) {
			this.xFlip=!this.xFlip;
			this.needsToTurn = true; // Set to true until momentum has flipped
			this.vel.x *= -1; // conserve velocity when turning
			this.accel.x = 0; // Stop the enemy from 'sliding' when turning
		}

		//Check if the enemy has changed momentum.
		if(Math.abs(this.initialPos - this.pos.x) < this.patrolRange) {
			this.needsToTurn = false;
		}

		if(this.xFlip == false) { //Walk right
			this.currentAnim = this.anims.walk;
			this.accel.x=this.moveAccel;
	} else if(this.xFlip == true) { //Walk left
			this.currentAnim = this.anims.walk;
			this.accel.x=-this.moveAccel;
	} else { //Might be taken out with enum
		//Pause and dont move
	}

		this.currentAnim.flip.x = this.xFlip; //update what direction the enemy faces
	},

	/* NOT BEING USED
	* Called to turn enemy around during patrol
	*/
	turnAround: function() { //dir is a boolean: attacked from left = false, from right = true
		this.xFlip=!this.xFlip;
	}





});
})
