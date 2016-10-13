ig.module(
	'game.entities.enemyPursuer'
).requires(
	'game.entities.enemy',
	'game.entities.player'
).defines(function() {
	
EntityEnemyPursuer = EntityEnemy.extend({
	
	attackDetection: 0, //if 0 ignore attacks, if 1 turn towards attacks, if 2 detect player if attacked
	revengeFlag: false, //set to true when attacked if attackDetection==2
	
	jumpsAtPlayer: false, //whether the enemy jumps at the player while in dRange
	
	detectionRange: 400,
	chaseRange:500, //how far away it will chase the player before turning back
		//if -1, cRange won't be considered
	
	lastX:null, //last known player position. might declare this elsewhere
	
	
	
	init: function( x, y, settings ) {
		
		this.parent();
		
		this.addAnim('idle', 0.1, [0]);
		this.addAnim('walk', 0.1, [0, 1, 2, 1]);
		this.addAnim('jump', 0.1, [3]);
		this.currentAnim = this.anims.idle;
		
		this.parent( x, y, settings );
		
		this.detectionRange=400;
		this.chaseRange=-1;
		
		//presets modify these defaults
		if(settings.preset=="SmarterPursuer") {
			
			this.chase=true;
			this.jumpsAtPlayer=true;
			this.revengeFlag=false;
			this.attackDetection=1;
			
			this.chaseRange=-1;
			this.detectionRange=600;
			
			this.maxHealth=7;
			this.gravityFactor=1;
			this.moveAccel=80;
			this.jumpHeight=400;
			this.jumpCut=1.6;
			
			this.maxVel.x = 170;
			this.maxVel.y = 600;
			this.friction.x = 1700;
			this.moveAccel = 120;
		}
		
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
		
		this.player=ig.game.getEntitiesByType(EntityPlayer)[0];
		isDetected=this.isDetected();
		
		if(isDetected) {
			this.revengeFlag=false;//once in detection range, drop revenge flag (i.e. lose omniscient sixth sense)
			this.jump();//called here so it can only jump if in range
		}
		
		if(isDetected||this.revengeFlag==true) { //if detected or needs revenge, move and flip accordingly
			if(this.pos.x-this.player.pos.x>0) {
				//if player is to left, set sprite to face left, and walk left
				this.currentAnim = this.anims.walk;
				this.xFlip = true;
				this.accel.x=-this.moveAccel;
			}
			else {
				//if player is to the right or directly above, set sprite to face right, and walk right
				this.currentAnim = this.anims.walk;
				this.xFlip = false;
				this.accel.x=this.moveAccel;
			}
		}
		else {
			//if not walking towards player, stand still
			this.currentAnim=this.anims.idle;
			this.accel.x=0;
			this.vel.x=0;
		}
		this.currentAnim.flip.x = this.xFlip; //update what direction the enemy faces
	},
	
	isDetected: function() {
		//note: theres a bug where if the player jumps over a pursuer's head, the player is no longer detected. This hasn't always been an issue
			//suspect cause of problem is that player position isn't continuous ( xDiff could jump from -1 to +2)
				//this was the problem, and I think I fixed the issue by returning true for one additional iteration
		
		isPlayerLeft=((this.pos.x-this.player.pos.x)>0);
		xDiff=this.pos.x-this.player.pos.x;
		
		if(isPlayerLeft==this.xFlip && (Math.abs(xDiff)<this.detectionRange)) {
			//if facing player and player in dRange, update known position and return true
			this.lastX=this.player.pos.x;
			return true;
		}
		else if(this.lastX!=null){
			//currently, lastX is just used to make sure the chase continues if the player was JUST detected
			this.lastX=null;
			return true;
		}
		else {
			return false;
		}
	},
	
	shouldJump: function() {
		//called in jump(), tells enemy whether or not it should jump
		
		if(this.player.pos.y<this.pos.y) return true;
		else return false;
	},
	
	jump: function() {
		//called in update(), makes enemy jump as needed
		shouldJump=this.shouldJump()
		if (this.standing) {
			if (this.jumpsAtPlayer && shouldJump) {
				this.vel.y -= this.jumpHeight;
			}
		}
		else {
			this.currentAnim = this.anims.jump;
			if (this.vel.y < 0 && !shouldJump) {
				this.vel.y /= this.jumpCut;
			}
		}
	},
	
	turnAround: function(dir) { //dir is a boolean: attacked from left = false, from right = true
		//called when attacked so that if attacked from behind, enemy turns around(after revising, this probably doesn't merit its own function...)
		if(dir==this.xFlip) this.xFlip=!this.xFlip;
	}

	
	
});
})