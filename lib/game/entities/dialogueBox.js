ig.module(
	'game.entities.dialogueBox'
).requires(
	'impact.entity'
).defines(function() {
	
EntityDialogueBox = ig.Entity.extend({

	dialogueFilename: "dialogue/missing.txt",

	textboxSheet: new ig.AnimationSheet("media/textbox-overlay.png", 960, 640),
	textboxes: [""],

	textIndex: 0,
	
	textPos: {x: 20, y: 435},

	font: new ig.Font("media/font-text.png"),

	loaderClient: null,

	init: function(x, y, settings) {
		this.textboxAnim = new ig.Animation(this.textboxSheet, 0.1, [0]);

		var response = "";
		var client = new XMLHttpRequest();
		client.caller = this;
		client.open('GET', this.dialogueFilename);
		client.onreadystatechange = function() {
			response = client.responseText;
		}
		client.addEventListener("load", function() {
			var text = this.responseText;
			this.caller.parseDialogueFile(text);
		});
		client.send();

		this.loaderClient = client;
	},

	ready: function() {
		// Freeze the player and some enemies
		for (var i=0; i<ig.game.entities.length; i++) {
			var entity = ig.game.entities[i];
			console.log(entity.name);
			if (entity.freezeOnDialogue === true) {
				entity.freeze();
			}
		}
	},

	parseDialogueFile: function(text) {
		this.textboxes = text.split("[Textbox]\n");
		this.textboxes = this.textboxes.filter(function(w) {
			return w.length !== 0;
		});
	},

	update: function() {
		this.parent();
		if (ig.input.pressed("action")) {
			this.textIndex++;
			if (this.textIndex == this.textboxes.length)
				this.kill();
		}
	},

	draw: function() {
		this.parent();
		// Draw text background
		var con = ig.system.context;
		var oldComp = con.globalCompositeOperation;
		con.globalCompositeOperation = 'lighter';
		this.textboxAnim.alpha = 7/8 + Math.random() / 8;
		this.textboxAnim.draw(0, 0);
		con.globalCompositeOperation = oldComp;
		// Draw textbox font
		this.font.draw(
			this.textboxes[this.textIndex],
			this.textPos.x,
			this.textPos.y,
			ig.Font.ALIGN.LEFT
		);
	},

	kill: function() {
		this.parent();
		for (var i=0; i<ig.game.entities.length; i++) {
			var entity = ig.game.entities[i];
			console.log(entity.name);
			if (entity.freezeOnDialogue === true) {
				entity.unfreeze();
			}
		}
	}

});
	
})
