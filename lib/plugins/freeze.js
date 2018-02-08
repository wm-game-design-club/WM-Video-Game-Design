/*
 * Adds the freeze attribute to entities.
 * If true, then they are drawn (but not updated) by the game.
 */
ig.module(
	"plugins.freeze"
).requires(
	"impact.entity",
	"impact.game"
).defines(function() {

ig.Entity.inject({

	freeze: function() {
		this._frozen = true;
		for (var prop in this) {
			if (prop instanceof ig.Timer) {
				prop.pause();
			}
		}
	},

	unfreeze: function() {
		this._frozen = false;
		for (var prop in this) {
			if (prop instanceof ig.Timer) {
				prop.unpause();
			}
		}
	},

	isFrozen: function() {
		return this._frozen;
	}

});

ig.Game.inject({

	updateEntities: function() {
		for (var i = 0; i < this.entities.length; i++) {
			var ent = this.entities[i];
			if (!(ent._killed || ent.isFrozen())) {
				ent.update();
			}
		}
	}
});

});
