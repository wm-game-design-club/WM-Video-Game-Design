ig.module(
	'game.entities.healthPickup'
).requires(
	'game.entities.pickup'
).defines(function() {

EntityHealthPickup = EntityPickup.extend({

	amountHealed: 1,

	animSheet: new ig.AnimationSheet('media/health-pickup.png', 32, 32),

	gravityFactor: 0,
	freezeOnDialogue: true,

	init: function( x, y, settings ) {
		this.addAnim("flashing", 0.25, [0,1,2,3,2,1]);
		this.currentAnim = this.anims.flashing;
		this.parent( x, y, settings );
	},
	
	onItemPickup: function(player) {
		player.heal(this.amountHealed);
		this.parent(player);
	},
	
	draw: function() {
		var con = ig.system.context;
		var oldComp = con.globalCompositeOperation;
		con.globalCompositeOperation = 'lighter';
		this.parent();
		con.globalCompositeOperation = oldComp;
	}

});

});
