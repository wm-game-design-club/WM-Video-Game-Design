ig.module(
	'game.entities.enemy'
).requires(
	'impact.entity'
).defines(function() {
// This is an abstract enemy class that can take damage and hurt the
// player.  All enemy types descend from it.
EntityEnemy = ig.Entity.extend({

	// Enemies will be in collision type B; they won't collide with **THIS IS A LIE  <------
	// each other, but will collide with the player and his weapons
	// in type A.
	
	collides: ig.Entity.COLLIDES.ACTIVE,
	type: ig.Entity.TYPE.B,
	checkAgainst: ig.Entity.TYPE.A,
	xFlip: false, //whether sprite is horizontally flipped
	player: null,
	
	/* After defining 3 versions of the same enemy, i had the "brilliant" idea of using variables as flags to control the behaviors of different
	 * enemies, as opposed to redefining the same entities a million different ways (scrapping several hours of coding)
	 * I don't know of any documentation about how enemies will work, so I'm currently thinking there'll be a couple enemy archetypes, each being a subclass of enemy
	 *   Each instance of an archetype will use a preset to change the default values for that archetype. This could be used to change the sprite
	 *   so that the player knows how a particular enemy behaves (like maybe the smarter versions of an enemy have a reddish color) 
	 *   
	 *   Ideas for Possible archetypes:
	 *   	Pursuers - Chase player around upon detection
	 *      Patrols - Move around oblivious to the player (can have patrol routes)
	 *      Gunners - Shoot at player upon detection   
	 *      Bosses - You know, bosses. These may end up being seperate entities altogether
	 *      	Minibosses? - Like bosses, but easier, show up more than once, and possibly have some tweakable attributes
	 *      
	 *      -Trent
	 *
	 * This is a good idea. It's similar to how Terraria's monsters are set up; the game has about 80 enemies and only 5 or 6 different AIs
	 * (zombie, worm, flyer), not counting bosses. Another good idea is getting centralized documentation set up somewhere... that's a separate
	 * thing to think about.
	 *
	 * -Ben
	 */
	
	preset:"", //used to quickly set behaviors in weltmeister to then fine-tune

	size: {x: 36, y: 58},
	animSheet: new ig.AnimationSheet('media/mario_small.gif', 36, 58),
	
	gravityFactor: 1,
	maxHealth: 5,
	moveAccel: 80,
	jumpHeight: 400,
	jumpCut: 1.6,
	
	init: function( x, y, settings ) {
		this.maxHealth=5;
		this.gravityFactor=1;
		this.moveAccel=80;
		this.jumpHeight=400;
		this.jumpCut=1.6;
		
		this.maxVel.x = 100;
		this.maxVel.y = 600;
		this.friction.x = 1700;
		
		this.xFlip=false;
		
		this.addAnim('idle', 0.1, [0]);
		this.addAnim('walk', 0.1, [0, 1, 2, 1]);
		this.addAnim('jump', 0.1, [3]);
		this.currentAnim=this.anims.idle;
		
		this.parent( x, y, settings );
	}

});
	
})
