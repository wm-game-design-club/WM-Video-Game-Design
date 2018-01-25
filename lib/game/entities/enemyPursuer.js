ig.module(
	'game.entities.enemyPursuer'
).requires(
	'game.entities.enemy',
	'game.entities.player'
).defines(function() {

EntityEnemyPursuer = EntityEnemy.extend({
	
	navI: null, //which index in the static array of navMaps an instance should use
	target: {x: null, y:null},//where enemy is moving towards
	
	immobile: true, //whether an enemy can move. stun effect?
	jumps: false, //whether an enemy can jump
	detectionRange: 400,
	state: null,
	
	init: function( x, y, settings ) {
		
		this.addAnim('idle', 0.1, [0]);
		this.addAnim('walk', 0.1, [0, 1, 2, 1]);
		this.addAnim('jump', 0.1, [3]);
		
		this.parent(x,y,settings);
		
		this.detectionRange=400;
		this.target = this.pos;
		
		if (!ig.global.wm) {
			this.player=ig.game.getEntitiesByType(EntityPlayer)[0];
		}
		
		this.state = new IdleState(this);
		
		//presets modify these defaults
		if(settings.preset==="SmarterPursuer") {
			
			this.jumps=true;
			this.immobile=false;
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
			
			this.immobile=false;
			this.size.x=36;
			this.size.y=58;
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
	
	update: function() {
		
		this.state.update();
		this.currentAnim.flip.x=this.xFlip; //update direction of animation
		
		this.parent();
		
		this.debugMessages=["Health: ","Flip: ","Detected: ", "SightObstructed: ", "Target: "];
		this.debugMessages[0]+= this.health;
		this.debugMessages[1]+= this.xFlip;
		this.debugMessages[2]+= this.detected;
		this.debugMessages[3]+= this.isPlayerDetected();
		this.debugMessages[4]+= this.target.x+", " +this.target.y;
	},
	
	isPlayerDetected: function() {
		
		xDiff=this.pos.x-this.player.pos.x;
		yDiff=this.pos.y-this.player.pos.y;
		dist=Math.sqrt(Math.pow(xDiff,2) + Math.pow(yDiff,2));
		
		return((xDiff>0)==this.xFlip && dist<this.detectionRange && !this.isSightObstructed())
	},
	
	isSightObstructed: function() {
		
		var x = this.pos.x + this.size.x/2;
		var y = this.pos.y + this.size.y/4;
		
		var x2 = this.player.pos.x + this.player.size.x/2;
		var y2 = this.player.pos.y + this.player.size.y/4;
		
		var trace = ig.game.collisionMap.trace(x, y, x2-x, y2-y,1,1);
		
		return(trace.collision.x || trace.collision.y || trace.collision.slope);
	},
	
	jumpTo: function(xTarget, yTarget) {
		var d = {x:xTarget,y:yTarget};
		var vel = EntityEnemyPursuer.prototype.getJumpAtXVelocity(d,this.size, this.maxVel,this.jumpHeight,this.gravityFactor*1000,this.moveAccel);
		if (vel!=null) {
			
			this.jump(vel);
		}
	},
	
	atTarget: function() {
		return (Math.abs(this.pos.x-this.target.x)<this.size.x);
	}
});

EntityEnemyPursuer.navMaps=[];//the list of navMaps for each enemy type.
EntityEnemyPursuer.prototype.pushNavMap=function(size,maxVel,jumpHeight,gravity,moveAccel) { //identifies platforms in the level
	
	var cM=EntityEnemyPursuer.collisionMap;//got tired of typing this out
	
	var tSize= { //convert size to size in tiles
			x:Math.ceil(size.x/cM.tilesize),
			y:Math.ceil(size.y/cM.tilesize)
	};
	
	for(var i=0;i<EntityEnemyPursuer.navMaps.length;i++) {
		var currP=EntityEnemyPursuer.navMaps[i];
		if(tSize==currP.tSize && maxVel==currP.maxVel && jumpHeight==currP.jumpHeight && gravity==currP.gravity && moveAccel==currP.moveAccel) {
			//if it has the same size and jump, then it has the same navMap
			return i;
		}
	}
	
	var candidate = [];//hoping to improve performance by trimming potential candidates
	for(var i=0;i<cM.data.length;i++) {
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
	EntityEnemyPursuer.navMaps.push({tSize:tSize,maxVel:maxVel,gravity:gravity,tiles:tiles});
	return(EntityEnemyPursuer.navMaps.length-1);
}

EntityEnemyPursuer.prototype.isTileStandable=function(tPos,tSize,cM) { //helper function for pushNavMap
	//check v-clearance on tile. Then expand out horizontally (left and right) and add to counter until one side obstructed or sufficient h-clearance
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

EntityEnemyPursuer.prototype.getJumpAtXVelocity=function(d,size,maxVel,jumpHeight,gravity,moveAccel) {//in the interest of simplicity, not 100% accurate
	var w = {x:maxVel.x,y:jumpHeight}; //initial x and y velocities
	var accel = {x:moveAccel,y:-1000*gravity};
	
	var f=-16*accel.y/(w.x*w.x); //constant factored out of quadratic
	
	var b=w.x*w.y/(16*accel.y); //quadratic constants
	var c=w.x*w.x*d.y/(16*accel.y);
	
	var root=EntityEnemyPursuer.prototype.getRoot(d,w,accel); //farthest x-distance possible with the given y-distance
	
	var lroot=Math.sqrt(-c)+0.5; //shortest forward distance at given jumpheight
	alert("root: "+ root+", "+"lroot: "+ lroot);
	if(Math.abs(d.x)>root || Math.abs(d.x)<lroot) { //too far or too close for given height
		return null;
	}
		
	//multiply w.y by error factor until within acceptable range
	var i =0;
	while(d.x/root<0.95 && i<10) {
		w.y*=d.x/root;
		b=w.x*w.y/(16*accel.y);
		root=-b+Math.sqrt(b^2-4*c);
		alert(d.x/root+" "+i+" "+w.y);
		i++;
	}
	alert("w.y: "+ w.y+", "+"max: "+jumpHeight);
	return w.y;
	
	//if(EntityEnemyPursuer.prototype.isJumpObstucted(x1,y1,accel,w,d)==true);
	
}

EntityEnemyPursuer.prototype.getRoot=function(d, w,accel) {
	
	var f=-16*accel.y/(w.x*w.x); //constant factored out of quadratic
	var b=w.x*w.y/(16*accel.y); //quadratic constants
	var c=w.x*w.x*d.y/(16*accel.y);
	
	return (-b+Math.sqrt(b^2-4*c));
}

});


//Enemy behavior is pretty convoluted at this point, attempting to improve readability by implementing state-based behaviour

function IdleState(enemy) {
	var self = this;
	this.enemy = enemy;
	enemy.state = this;
	enemy.currentAnim = enemy.anims.idle;
	enemy.accel.x=0;
	this.update = function() {
		
		if(enemy.isPlayerDetected()) {
			enemy.target = enemy.player.pos;
			enemy.state = new MoveState(enemy);
		}
		
	}
}

function JumpState(enemy, height) {
	var self = this;
	this.enemy = enemy;
	enemy.state = this;
	enemy.vel.y -= enemy.jumpHeight;
	enemy.currentAnim = enemy.anims.jump;
	
	this.update = function() {
		if(!enemy.isSightObstructed()) enemy.target = enemy.player.pos;
		if(enemy.standing) enemy.state = new MoveState(enemy);
		
	}
}

function MoveState(enemy) {
	var self = this;
	this.enemy = enemy;
	enemy.state = this;
	enemy.currentAnim = enemy.anims.walk;
	
	this.update = function() {
		enemy.accel.x=enemy.moveAccel;
		enemy.xFlip=enemy.pos.x>enemy.target.x;
		if(enemy.xFlip) enemy.accel.x*=-1;
		
		if(!enemy.isSightObstructed()) {
			enemy.target = enemy.player.pos;
			if(enemy.target.y+12<enemy.pos.y && enemy.standing) enemy.state = new JumpState(enemy);
		}
		else if(enemy.atTarget()) enemy.state = new IdleState(enemy);
		else if(enemy.target.y+12<enemy.pos.y && enemy.standing) enemy.state = new JumpState(enemy);
	}
}
