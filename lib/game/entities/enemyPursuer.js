ig.module(
	'game.entities.enemyPursuer'
).requires(
	'game.entities.enemy',
	'game.entities.player'
).defines(function() {

EntityEnemyPursuer = EntityEnemy.extend({
	
	//static properties are down at bottom
	
	detected: null, //whether enemy sees player
	//collisionMap: null, //for now, making main give this a copy of the collisionmap, since trying to use the original creates a circular dependency
	navI: null, //which index in the static array of navMaps an instance should use
	
	target: [{x: null, y:null}],//where enemy is moving towards
	
	
	attackDetection: 0, //if 0 ignore attacks, if 1 turn towards attacks, if 2 detect player if attacked
	revengeFlag: false, //set to true when attacked if attackDetection==2
	
	immobile: true, //whether an enemy can move. stun effect?
	
	jumps: false, //whether an enemy can jump at all
	jumpsAtPlayer: false, //whether the enemy jumps at the player while in dRange
	
	
	detectionRange: 400,
	chaseRange:500, //how far away it will chase the player before turning back
		//if -1, cRange won't be considered

	
	lastX:null, //last known player position. might declare this elsewhere
	
	flipping: false, // whether sprite is going to flip next frame
	
	
	
	init: function( x, y, settings ) {
		
		this.addAnim('idle', 0.1, [0]);
		this.addAnim('walk', 0.1, [0, 1, 2, 1]);
		this.addAnim('jump', 0.1, [3]);
		this.currentAnim = this.anims.idle;
		
		this.parent(x,y,settings);
		
		this.detectionRange=400;
		this.chaseRange=-1;
		this.target[0]={x:this.pos.x,y:this.pos.y};
		
		//presets modify these defaults
		if(settings.preset==="SmarterPursuer") {
			
			this.jumps=true;
			this.chase=true;
			this.jumpsAtPlayer=true;
			this.revengeFlag=false;
			this.attackDetection=1;
			this.immobile=false;
			
			this.chaseRange=-1;
			this.detectionRange=600;
			
			this.maxHealth=7;
			this.gravityFactor=1;
			this.moveAccel=120;
			this.jumpHeight=400;
			this.jumpCut=1.6;
			
			this.maxVel.x = 170;
			this.maxVel.y = 600;
			this.friction.x = 1700;
		}
		else if(settings.preset==="dummy") {
			
			this.immobile=true;
			this.size.x=36;
			this.size.y=58;
			this.chase=false;
			this.jumpsAtPlayer=false;
			this.revengeFlag=false;
			this.attackDetection=1;
			
			this.chaseRange=-1;
			this.detectionRange=600;
			
			this.maxHealth=999;//this'll do...
			this.gravityFactor=1;
			this.moveAccel=120;
			this.jumpHeight=400;
			this.jumpCut=1.6;
			
			this.maxVel.x=170;
			this.maxVel.y=600;
			this.friction.x=1700;
		}
		
		this.health=this.maxHealth; //set initial health
	},
	
	/*buildWaypoints: function() { //need to figure out where to put this
		this.navigation=[];
		for(var i=1; i<this.collisionMap.data.length;i++) {
			for(var j=0; j<this.collisionMap.data[0].length;j++) {
				if(this.collisionMap.data[i][j]==1 && this.collisionMap.data[i-1][j]==0) {
					navigation.push({x:j,y:i,type:2});
				} 
			}
		}
	},*/
	
	update: function() {
		
		//setting up debugging messages for the attributes to be added below (also clears previous attribute values)
		this.debugMessages=["Health: ","Flip: ","Detected: ","Tile: ", "SightObstructed: ", "Target: "];
		
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
		this.detected=this.isDetected();
		
		//set third message to display whether enemy thinks they can see the enemy
		this.debugMessages[2]+= this.detected;
		
		if(this.detected||this.revengeFlag) {
			this.target[0].x=this.player.pos.x;
			this.target[0].y=this.player.pos.y;
			if(this.detected) this.revengeFlag=false;//once in detection range, drop revenge flag (i.e. lose omniscient sixth sense)
		}
		if(!this.immobile)this.jump();
		
		this.debugMessages[5]="Target: "+this.target[0].x+", " +this.target[0].y;
		
		if((Math.abs(this.pos.x-this.target[0].x)>this.size.x||this.detected)&&!this.immobile) { //if not at target or needs revenge, move and flip accordingly
			if(this.pos.x-this.target[0].x>0) {
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
			//if not walking towards target, stand still
			this.currentAnim=this.anims.idle;
			this.accel.x=0;
			this.vel.x=0;
		}
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
		
		if(isPlayerLeft==this.xFlip && pDiff<this.detectionRange && !this.isSightObstructed()) {
			//if facing player and player in dRange, update known position and return true
			this.lastX=this.player.pos.x;
			this.debugMessages[4]+=false;
			//this.findpath(this.player.pos.x,this.player.pos.y);
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
	
	isSightObstructed: function() { //probably needs optimized
		var sightTile={ //tile enemy sees from
				x:Math.round(this.pos.x/EntityEnemyPursuer.collisionMap.tilesize),
				y:Math.round(this.pos.y/EntityEnemyPursuer.collisionMap.tilesize)
		};
		var playerTile={//tile enemy looks for
				x:Math.round(this.player.pos.x/EntityEnemyPursuer.collisionMap.tilesize),
				y:Math.round(this.player.pos.y/EntityEnemyPursuer.collisionMap.tilesize)
		};
		
		var delta={//x and y differences, and slope
			x: playerTile.x-sightTile.x,
			y:playerTile.y-sightTile.y,
			error: null
		};
		
		this.debugMessages[3]+=sightTile.x + ", " + sightTile.y;
		this.player.debugMessages[0]="Tile: " + playerTile.x + ", " + playerTile.y;
		delta.error = Math.abs(delta.y/delta.x);//slope
		
		var step={x:delta.x<0 ? -1:1,y:delta.y<0 ? -1:1}; //used to change position along axes
		
		var error = 0.0; //keeps track of when to move along second axis
		var current = sightTile.y; //the position on the second axis
		
		if(delta.error<=1){//if slope makes line closer to x axis, move along x and change y along the way
			for(var i=sightTile.x;step.x*i<=step.x*playerTile.x;i+=step.x) {
				if(i<0||current<0||i>=EntityEnemyPursuer.collisionMap.data[0].length
					||current>=EntityEnemyPursuer.collisionMap.data.length) return false;
				if(EntityEnemyPursuer.collisionMap.data[current][i]==1) return true;
				this.debugMessages[0]=("oTile: "+i+","+current+" "+EntityEnemyPursuer.collisionMap.data[current][i]);
				if(i!=sightTile.x) {
					if(EntityEnemyPursuer.collisionMap.data[current][i-step.x]&&EntityEnemyPursuer.collisionMap.data[current-step.y][i]) return true;
				}
				error=error+delta.error;
				if(error>=0.0) {
					current+=step.y;
					error=error-1.0;
				}
			}
		}
		else {//if slope makes line closer to y axis, move along y and change x along the way
			current=sightTile.x;
			delta.error=Math.abs(delta.x/delta.y);
			for(var i=sightTile.y;step.y*i<=step.y*playerTile.y;i+=step.y) {
				if(i<0||current<0||i>=EntityEnemyPursuer.collisionMap.data.length
						||current>=EntityEnemyPursuer.collisionMap.data[0].length) return false;
				if(EntityEnemyPursuer.collisionMap.data[i][current]==1) return true;
				this.debugMessages[0]=("oTile: "+current+","+i+" "+EntityEnemyPursuer.collisionMap.data[i][current]);
				if(i!=sightTile.y) {
					if(EntityEnemyPursuer.collisionMap.data[i-step.y][current]&&EntityEnemyPursuer.collisionMap.data[i][current-step.x]) return true;
				}
				error=error+delta.error;
				if(error>=0.0) {
					current+=step.x;
					error=error-1.0;
				}
			}
		}
		return false;
	},
	
	shouldJump: function() {
		//called in jump(), tells enemy whether or not it should jump
		
		if(this.jumps&&((this.player.pos.y<this.pos.y && this.detected && this.jumpsAtPlayer) ||//if player detected, player above, and enemy jumps at player, or
			(Math.abs(this.pos.x-this.target[0].x)>this.size.x && this.target[0].y<this.pos.y))) return true; //not at target and target is above//
		else return false;
	},
	
	jump: function(height) { //how high it wants to jump
		//called in update(), makes enemy jump as needed
		if (this.standing && this.shouldJump()) {
			var jumpFactor=1;//how high it wants to jump, essentially
			this.vel.y -= this.jumpHeight*jumpFactor;
		}
	},
	
	turnAround: function(dir) { //dir is a boolean: attacked from left = false, from right = true
		//called when attacked so that if attacked from behind, enemy turns around(after revising, this probably doesn't merit its own function...)
		if(dir==this.xFlip) this.flipping=true;
		
		//enable... if you dare
		
		/*var settings={player:this.player,preset: this.preset};
		ig.game.spawnEntity(EntityEnemyPursuer, this.pos.x, this.pos.y, settings);*/
	}

	
	
});
//set static stuff

//the static collision Map is set in main

EntityEnemyPursuer.navMaps=[];//the list of navMaps for each enemy. Implemented this way to prevent duplicates
EntityEnemyPursuer.prototype.pushNavMap=function(size,maxVel,jumpHeight,gravity,moveAccel) { //assembles a graph used for pathfinding
	
	var cM=EntityEnemyPursuer.collisionMap;//got tired of typing this out
	
	var tSize= { //enemies that occupy the same number of tiles use the same navMaps, so use the size in tiles instead
			x:Math.ceil(size.x/cM.tilesize),
			y:Math.ceil(size.y/cM.tilesize)
	};
	var index=null;
	search:
	for(var i=0;i<EntityEnemyPursuer.navMaps.length;i++) { //searches for a navMap generated with the same tSize
		var currP=EntityEnemyPursuer.navMaps[i];
		if(tSize==currP.tSize && maxVel==currP.maxVel && jumpHeight==currP.jumpHeight && gravity==currP.gravity && moveAccel==currP.moveAccel) {
			//if it's the same size and jumps the same, then it has the same navMap
			index=i;
			break search;
		}
	}
	if(index!==null) return index; //if navMap already exists, then index is no longer null. return the index of the navMap
	
	else { //fun. this runtime performance gonna be O(n^97976).
		var candidate = [];//hoping to improve performance by trimming potential candidates
		for(var i=0;i<cM.data.length;i++) { //fill candidate array
			candidate.push(new Array(cM.data[0].length).fill(1));
		}
		var tiles=[];
		var type=0;
		var x1=0;
		
		for(var i=0;i<cM.data.length;i++) {
			for(var j=0;j<cM.data[0].length;j++) {
				if(cM.data[i][j]==1) {
					for(var k=1;i+k<candidate.length&&k<=tSize.y;k++) candidate[i+k][j]=0; //if tile solid, the tiles below aren't candidates
					
					if(candidate[i][j]===1 && EntityEnemyPursuer.prototype.isTileStandable({y:i,x:j},tSize,cM)) {//if standable and l isnt, then l-edge
						if(j===0||candidate[i][j-1]===0) x1=j;
						
						right:
						if(j==candidate[0].length-1||cM.data[i][j+1]==0||candidate[i][j+1]==0||!EntityEnemyPursuer.prototype.isTileStandable({y:i,x:(j+1)},tSize,cM)){//if standable and r isnt, then r-edge
							tiles.push({x:x1,y:i,len:j-x1});
							if(j===candidate[0].length-1) break right; //stop the code before it hurts itself
							candidate[i][j+1]=0;
						}
					}
					else candidate[i][j]=0;
				}
				else candidate[i][j]=0;
			}
		}
		var adjacencies=EntityEnemyPursuer.prototype.getAdjacencies(tiles,size,maxVel,jumpHeight,gravity,moveAccel);//after getting all the platforms, need to determine which platforms are connected
		//alert(adjacencies);
		EntityEnemyPursuer.navMaps.push({tSize:tSize,maxVel:maxVel,gravity:gravity,tiles:tiles/*,adjacencies: adjacencies*/});
		return(EntityEnemyPursuer.navMaps.length-1);
	}
}

EntityEnemyPursuer.prototype.isTileStandable=function(tPos,tSize,cM) { //helper function for pushNavMap
	//check v-clearance on tile. Then expand out horizontally (left and right) and add to counter until one side obstructed or sufficient h-clearance
	//if counter large enough, then standable
	var counter=1;
	var offset=1;
	var left=true;
	var right=true;
	search:
	while(counter<tSize.x&&left&&right) {
		for(var j=1;left&&j<=tSize.y&&tPos.y-j>=0&&tPos.x-offset>=0;j++) {
			if(cM.data[tPos.y-j][tPos.x-offset]==1) {
				left=false;
				break;
			}
		}
		if(left) counter++;
		
		for(var j=1;right&&j<=tSize.y&&tPos.y-j>=0&&tPos.x+offset<cM.data[0].length;j++) {
			if(cM.data[tPos.y-j][tPos.x+offset]==1) {
				right=false;
				break;
			}
		}
		if(right) counter++;
		
		offset++;
	}
	if(counter>=tSize.x){/*alert((counter+" "+tPos.x+","+tPos.y));*/ return true;}
	return false;
	
}

EntityEnemyPursuer.prototype.getAdjacencies=function(tiles,size,maxVel,jumpHeight,gravity,moveAccel) {
	/*var adjacencies=[];
	for(var i=0;i<2*tiles.length;i++) { //each side of a platform is considered a seperate point in the adjacency matrix
		var tmp =[]
		for(var j=0;j<2*tiles.length;i++) {
			if(j==i) tmp.push(0);
			else if(j==i+1-2*(i%2)) tmp.push(2);
			else tmp.push(EntityEnemyPursuer.prototype.isTileReachable(tiles[Math.floor(i/2)].x+(i%2)*tiles[Math.floor(i/2)].len,tiles[Math.floor(i/2)].y, tiles[Math.floor(j/2)].x+(j%2)*tiles[Math.floor(j/2)].len,tiles[Math.floor(j/2)].y,size,maxVel,jumpHeight,gravity,moveAccel));
		}					
		
		adjacencies.push(tmp)
	
	}*/
	
}

EntityEnemyPursuer.prototype.getTileJumpAtForwardVelocity=function(d,size,maxVel,jumpHeight,gravity,moveAccel) {//in the interest of simplicity, not 100% accurate
	var w = {x:maxVel.x,y:jumpHeight}; //initial x and y velocities
	var accel = {x:moveAccel,y:-1000*gravity};
	
	var f=-16*accel.y/(w.x*w.x); //constant factored out of quadratic
	
	var b=w.x*w.y/(16*accel.y); //quadratic constants
	var c=w.x*w.x*d.y/(16*accel.y);
	
	var root=EntityEnemyPursuer.prototype.getRoot(d,w,accel); //farthest x-distance possible with the given y-distance
	
	var lroot=Math.sqrt(-c)+0.5; //shortest forward distance at given jumpheight
	
	if(Math.abs(d.x)>root || Math.abs(d.x)<lroot) { //too far or too close to jump to at given height
		return null;
	}
	
		
		
	//multiply w.y by error factor until within acceptable range
	
	while(d.x/root<.95) {
		w.y*=d.x/root;
		b=w.x*w.y/(16*accel.y);
		root=-b+Math.sqrt(b^2-4*c);
	}
	
	//if(EntityEnemyPursuer.prototype.isJumpObstucted(x1,y1,accel,w,d)==true);
	
}

EntityEnemyPursuer.prototype.getRoot=function(d, w,accel) {
	
	var f=-16*accel.y/(w.x*w.x); //constant factored out of quadratic
	var b=w.x*w.y/(16*accel.y); //quadratic constants
	var c=w.x*w.x*d.y/(16*accel.y);
	
	return (-b+Math.sqrt(b^2-4*c));
}

})
