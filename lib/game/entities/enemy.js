ig.module(
    'game.entities.enemy'
).requires(
    'impact.entity',
    //'impact.entity-pool'
    'game.entities.corpse'
).defines(function() {
// This is an abstract enemy class that can take damage and hurt the
// player.  All enemy types descend from it.
EntityEnemy = ig.Entity.extend({

    // Both the player and the enemy are passive. This means that they won't collide
    // with one another, but other items will collide with them.
    collides: ig.Entity.COLLIDES.PASSIVE,
    type: ig.Entity.TYPE.B,
    checkAgainst: ig.Entity.TYPE.A,

    preset:"", //used to quickly set behaviors in weltmeister to then fine-tune

    size: {x: 36, y: 58},
    animSheet: new ig.AnimationSheet('media/luigi_small.gif', 36, 58),

    freezeOnDialogue: true,
    spawnCorpse: true,

    // Corpse is spawned when the enemy dies
    corpsePath: 'media/default-corpse.png',
    corpseWidth: 48,
    corpseHeight: 32,

    // Spawn a corpse just before death
    kill: function() {
        if (this.spawnCorpse && this.corpsePath) {
            var settings = {
                animPath: this.corpsePath,
                animWidth: this.corpseWidth,
                animHeight: this.corpseHeight
            };
            ig.game.spawnEntity(EntityCorpse, this.pos.x, this.pos.y, settings);
        }
        this.parent();
    },

});

})
