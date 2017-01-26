ig.module(
	'impact.debug.entities-panel'
)
.requires(
	'impact.debug.menu',
	'impact.entity'
)
.defines(function(){ "use strict";


ig.Entity.inject({
	colors: {
		names: '#fff',
		velocities: '#0f0',
		boxes: '#f00'
	},
	
	draw: function() {
		this.parent();		
		
		// Collision Boxes
		if( ig.Entity._debugShowBoxes ) {
			ig.system.context.strokeStyle = this.colors.boxes;
			ig.system.context.lineWidth = 1.0;
			ig.system.context.strokeRect(	
				ig.system.getDrawPos(this.pos.x.round() - ig.game.screen.x) - 0.5,
				ig.system.getDrawPos(this.pos.y.round() - ig.game.screen.y) - 0.5,
				this.size.x * ig.system.scale,
				this.size.y * ig.system.scale
			);
		}
		
		// Velocities
		if( ig.Entity._debugShowVelocities ) {
			var x = this.pos.x + this.size.x/2;
			var y = this.pos.y + this.size.y/2;
			
			this._debugDrawLine( this.colors.velocities, x, y, x + this.vel.x, y + this.vel.y );
		}
		
		// Names & Targets
		if( ig.Entity._debugShowNames ) {
			if( this.name ) {
				ig.system.context.fillStyle = this.colors.names;
				ig.system.context.fillText(
					this.name,
					ig.system.getDrawPos(this.pos.x - ig.game.screen.x), 
					ig.system.getDrawPos(this.pos.y - ig.game.screen.y)
				);
			}
			
			if( typeof(this.target) == 'object' ) {
				for( var t in this.target ) {
					var ent = ig.game.getEntityByName( this.target[t] );
					if( ent ) {
						this._debugDrawLine( this.colors.names,
							this.pos.x + this.size.x/2, this.pos.y + this.size.y/2,
							ent.pos.x + ent.size.x/2, ent.pos.y + ent.size.y/2
						);
					}
				}
			}
		}
		
		if(ig.Entity._debugShowText) {
		        
		    for(var j=0;j<this.debugMessages.length;j++) {
		    	var message=this.debugMessages[j];
		    	ig.system.context.fillText(
		    		message,
		    		ig.system.getDrawPos(this.pos.x - ig.game.screen.x),
		    		ig.system.getDrawPos(this.pos.y - ig.game.screen.y)-10*(this.debugMessages.length-j)
		    	);
		    }
		}
		
		//There's probably a more efficient way to do this, but...
		if(ig.Entity._debugSight && this instanceof EntityEnemyPursuer) {
			
			var sightTile={ //which tile enemy sees from
					x:Math.round(this.pos.x/EntityEnemyPursuer.collisionMap.tilesize),
					y:Math.round(this.pos.y/EntityEnemyPursuer.collisionMap.tilesize)
			};
			var playerTile={//which tile enemy is looking for
					x:Math.round(this.player.pos.x/EntityEnemyPursuer.collisionMap.tilesize),
					y:Math.round(this.player.pos.y/EntityEnemyPursuer.collisionMap.tilesize)
			};
			
			var delta={x: playerTile.x-sightTile.x,y:playerTile.y-sightTile.y, error: null}; //x and y differences, and slope
			
			this.debugMessages[3]+=sightTile.x + ", " + sightTile.y;
			this.player.debugMessages[0]="Tile: " + playerTile.x + ", " + playerTile.y;
			delta.error = Math.abs(delta.y/delta.x);//slope
			
			var step={x:delta.x<0 ? -1:1,y:delta.y<0? -1:1}; //used to change position along axes
			
			var error = 0.0; //keeps track of when to move along second axis
			var current = sightTile.y; //the position on the second axis
			
			if(delta.error<=1){//if slope makes line closer to x axis, move along x and change y along the way
				look:
				for(var i=sightTile.x;step.x*i<=step.x*playerTile.x;i+=step.x) {
					//draw box on every tile that enemy sees
					ig.system.context.strokeStyle = this.colors.boxes;
					ig.system.context.lineWidth = 1.0;
					ig.system.context.strokeRect(	
						ig.system.getDrawPos(i*EntityEnemyPursuer.collisionMap.tilesize - ig.game.screen.x),
						ig.system.getDrawPos(current*EntityEnemyPursuer.collisionMap.tilesize - ig.game.screen.y),
						EntityEnemyPursuer.collisionMap.tilesize,
						EntityEnemyPursuer.collisionMap.tilesize
					);
					if(i<0||current<0||EntityEnemyPursuer.collisionMap.data[current][i]==1) break look;
					this.debugMessages[0]=("oTile: "+i+","+current+" "+EntityEnemyPursuer.collisionMap.data[current][i]);
					if(i!=sightTile.x) {
						if(EntityEnemyPursuer.collisionMap.data[current][i-step.x]&&EntityEnemyPursuer.collisionMap.data[current-step.y][i]) break look;
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
				delta.error=Math.abs(delta.x/delta.y)
				look:
				for(var i=sightTile.y;step.y*i<=step.y*playerTile.y;i+=step.y) {
					//draw box on every tile that enemy sees
					ig.system.context.strokeStyle = this.colors.boxes;
					ig.system.context.lineWidth = 1.0;
					ig.system.context.strokeRect(
							ig.system.getDrawPos(current*EntityEnemyPursuer.collisionMap.tilesize - ig.game.screen.x),
							ig.system.getDrawPos(i*EntityEnemyPursuer.collisionMap.tilesize - ig.game.screen.y),
							EntityEnemyPursuer.collisionMap.tilesize,
							EntityEnemyPursuer.collisionMap.tilesize
					);
					if(i<0||current<0||EntityEnemyPursuer.collisionMap.data[i][current]==1) break look;
					this.debugMessages[0]=("oTile: "+current+","+i+" "+EntityEnemyPursuer.collisionMap.data[i][current]);
					if(i!=sightTile.y) {
						if(EntityEnemyPursuer.collisionMap.data[i-step.y][current]&&EntityEnemyPursuer.collisionMap.data[i][current-step.x]) break look;
					}
					error=error+delta.error;
					if(error>=0.0) {
						current+=step.x;
						error=error-1.0;
					}
				}
			}
		}
	},
	
	
	_debugDrawLine: function( color, sx, sy, dx, dy ) {
		ig.system.context.strokeStyle = color;
		ig.system.context.lineWidth = 1.0;

		ig.system.context.beginPath();
		ig.system.context.moveTo( 
			ig.system.getDrawPos(sx - ig.game.screen.x),
			ig.system.getDrawPos(sy - ig.game.screen.y)
		);
		ig.system.context.lineTo( 
			ig.system.getDrawPos(dx - ig.game.screen.x),
			ig.system.getDrawPos(dy - ig.game.screen.y)
		);
		ig.system.context.stroke();
		ig.system.context.closePath();
	}
});


ig.Entity._debugEnableChecks = true;
ig.Entity._debugShowBoxes = false;
ig.Entity._debugShowVelocities = false;
ig.Entity._debugShowNames = false;
ig.Entity._debugShowText = true;
ig.Entity._debugSight = true;

ig.Entity.oldCheckPair = ig.Entity.checkPair;
ig.Entity.checkPair = function( a, b ) {
	if( !ig.Entity._debugEnableChecks ) {
		return;
	}
	ig.Entity.oldCheckPair( a, b );
};


ig.debug.addPanel({
	type: ig.DebugPanel,
	name: 'entities',
	label: 'Entities',
	options: [
		{
			name: 'Checks & Collisions',
			object: ig.Entity,
			property: '_debugEnableChecks'
		},
		{
			name: 'Show Collision Boxes',
			object: ig.Entity,
			property: '_debugShowBoxes'
		},
		{
			name: 'Show Velocities',
			object: ig.Entity,
			property: '_debugShowVelocities'
		},
		{
			name: 'Show Names & Targets',
			object: ig.Entity,
			property: '_debugShowNames'
		},
		{
			name: 'Show Debug Messages',
			object: ig.Entity,
			property: '_debugShowText'
		},
		{
			name: 'Show Pursuer Sight',
			object: ig.Entity,
			property: '_debugSight'
		}
	]
});


});