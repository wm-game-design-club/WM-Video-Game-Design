/*
 * When a "trigger" entity enters this box, load up and
 * play a conversation.
 *
 * Set the "filename" key to the file you want in
 * the dialogue/ folder.
 *
 * Set the "target.1" key to the entity you want to
 * trap (like the Player)
 */
ig.module(
	'game.entities.dialogueTrigger'
).requires(
	'impact.entity',
	'game.entities.dialogueBox'
).defines(function() {

EntityDialogueTrigger = ig.Entity.extend({

	_wmScalable: true,
	_wmDrawBox: true,

	checkAgainst: ig.Entity.TYPE.BOTH,

	size: {x: 64, y: 64},
	gravityFactor: 0,

	check: function(other) {
		if (this.target["1"] === undefined) {
			console.error("Dialogue Trigger has no target.1");
			this.kill();
			return;
		}
		var trigger_ent = ig.game.getEntityByName(this.target["1"]);
		if (trigger_ent != other)
			return;

		if (this.filename === undefined) {
			console.error("Dialogue trigger has no associated conversation");
			this.filename = "missing.txt";
		}
		this.filename = "dialogue/" + this.filename;
		ig.game.spawnEntity(EntityDialogueBox, 0, 0, {filename: this.filename});

		this.kill();
	}
});

});
