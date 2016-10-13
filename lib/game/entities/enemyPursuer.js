ig.module(
	'game.entities.enemyPursuer'
).requires(
	'game.entities.enemy',
	'game.entities.player'
).defines(function() {
	
EntityEnemyPursuer = EntityEnemy.extend({
	
	collisionMap: null, //for now, making main give this a copy of the collisionmap, since trying to use the original creates a circular dependency
	
	attackDetection: 0, //if 0 ignore attacks, if 1 turn towards attacks, if 2 detect player if attacked
	revengeFlag: false, //set to true when attacked if attackDetection==2
	
	jumpsAtPlayer: false, //whether the enemy jumps at the player while in dRange
	
	detectionRange: 400,
	chaseRange:500, //how far away it will chase the player before turning back
		//if -1, cRange won't be considered
	
	lastX:null, //last known player position. might declare this elsewhere
	
	flipping: false, // whether sprite is going to flip next frame
	
	
	
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
		
		//setting up debugging messages for the attributes to be added below (also clears previous attribute values)
		this.debugMessages=["Health: ","Flip: ","Detected: ","Tile: ", "SightObstructed: "];
		
		// Call the parent update() method to move the entity
		// according to its physics
		
		this.parent();
		
		//set first message to display health
		this.debugMessages[0]+=this.health;
		
		this.xFlip=this.currentAnim.flip.x;
		//set second debug message to display whether xFlip is true
		this.debugMessages[1]+=this.xFlip;
		
		if(ig.game.getEntitiesByType(EntityPlayer).length==0) {
			this.currentAnim = this.anims.walk;
			this.vel.x=0;
			this.accel.x=0;
			return
		}
		
		this.player=ig.game.getEntitiesByType(EntityPlayer)[0];
		isDetected=this.isDetected();
		
		//set third message to display whether enemy thinks they can see the enemy
		this.debugMessages[2]+= isDetected;
		
		if(isDetected) {
			this.revengeFlag=false;//once in detection range, drop revenge flag (i.e. lose omniscient sixth sense)
			//this.jump();//called here so it can only jump if in range
		}
		
		//Disabled movement so I can debug sight
		
		/*if(isDetected||this.revengeFlag==true) { //if detected or needs revenge, move and flip accordingly
			if(this.pos.x-this.player.pos.x>0) {
				//if player is to left, set sprite to face left, and walk left
				this.currentAnim = this.anims.walk;
				if(!this.xFlip) this.flipping = true;
				this.accel.x=-this.moveAccel;
			}
			else {
				//if player is to the right or directly above, set sprite to face right, and walk right
				this.currentAnim = this.anims.walk;
				if(this.xFlip) this.flipping = true;
				this.accel.x=this.moveAccel;
			}
		}
		else {
			//if not walking towards player, stand still
			this.currentAnim=this.anims.idle;
			this.accel.x=0;
			this.vel.x=0;
		}*/
		if(this.flipping) {
			this.currentAnim.flip.x=!this.xFlip; //update what direction the enemy faces
			this.flipping=false;
		}
	},
	
	isDetected: function() {
		//note: theres a bug where if the player jumps over a pursuer's head, the player is no longer detected. This hasn't always been an issue
			//suspect cause of problem is that player position isn't continuous ( xDiff could jump from -1 to +2)
				//this was the problem, and I think I fixed the issue by returning true for one additional iteration
		
		xDiff=this.pos.x-this.player.pos.x;
		yDiff=this.pos.y-this.player.pos.y;
		pDiff=Math.sqrt(Math.pow(xDiff,2) + Math.pow(yDiff,2));
		isPlayerLeft=xDiff>0;
		
		sightObstructed=this.isSightObstructed();
		this.debugMessages[4]+=sightObstructed;
		
		if(isPlayerLeft==this.xFlip && pDiff<this.detectionRange && !sightObstructed) {
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
	
	isSightObstructed: function() {
		var sightTile={
				x:Math.floor(this.pos.x/this.collisionMap.tilesize),
				y:Math.floor(this.pos.y/this.collisionMap.tilesize)
		};
		var playerTile={
				x:Math.floor(this.player.pos.x/this.collisionMap.tilesize),
				y:Math.floor(this.player.pos.y/this.collisionMap.tilesize)
		};
		
		var delta={x: playerTile.x-sightTile.x,y:playerTile.y-sightTile.y, error: null};
		
		this.debugMessages[3]+=sightTile.x + ", " + sightTile.y;
		this.player.debugMessages[0]="Tile: " + playerTile.x + ", " + playerTile.y;
		delta.error = delta.y/delta.x;
		
		var error = 0.0;
		var current = sightTile.y;
		
		if(Math.abs(delta.error)<=1){//octant 1 (5?)
			for(var i=sightTile.x;i<playerTile.x;i++) {
				if(this.collisionMap.data[current][i]==1) return true;
				this.debugMessages[0]=("oTile: "+i+","+current+" "+this.collisionMap.data[current][i]);
				error=error+delta.error;
				if(error>=0.0) {
					current++;
					error=error-1.0;
				}
			}
		}
		else {//octant 2 (6?)
			delta.error=1/delta.error;
			for(var i=sightTile.y;i<playerTile.y;i++) {
				if(this.collisionMap.data[i][current]==1) return true;
				this.debugMessages[0]=("oTile: "+current+","+i+" "+this.collisionMap.data[i][current]);
				error=error+delta.error;
				if(error>=0.0) {
					current++;
					error=error-1.0;
				}
			}
		}
		
		return false;
		
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
		if(dir==this.xFlip) this.flipping=true;
	}

	
	
});
})