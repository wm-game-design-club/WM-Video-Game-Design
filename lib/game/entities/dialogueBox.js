ig.module(
	'game.entities.dialogueBox'
).requires(
	'impact.entity'
).defines(function() {
	
EntityDialogueBox = ig.Entity.extend({

	filename: "dialogue/missing.txt",

	textboxSheet: new ig.AnimationSheet("media/textbox-overlay.png", 960, 640),
	textboxes: [""],

	textIndex: 0,
	
	textPos: {x: 20, y: 435},

	font: new ig.Font("media/font-text.png"),

	loaderClient: null,

	init: function(x, y, settings) {
		this.filename = settings.filename;
		this.textboxAnim = new ig.Animation(this.textboxSheet, 0.1, [0]);

		// Freeze the player and some enemies
		for (var i=0; i<ig.game.entities.length; i++) {
			var entity = ig.game.entities[i];
			if (entity.freezeOnDialogue === true) {
				entity.freeze();
			}
		}

		// Load the file
		var response = "";
		var client = new XMLHttpRequest();
		client.caller = this;
		client.open('GET', this.filename);
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

	parseDialogueFile: function(dialogue) {
		this.textboxes = [];
		// right now, extra stuff like portraits are ignored
		var textbox_splitter = /^\[(\w+)(?:\s+(.*))?\]\s*\n\s*(.*)/gmi;
		var next_box = [];
		do {
			next_box = textbox_splitter.exec(dialogue);
			if (next_box) {
				var tagName = next_box[1];
				var tagText = next_box[3];
				var tagOptions = {};
				// If necessary, get additional options,
				// like speaker=""
				if (next_box[2] !== undefined) {
					var opts = next_box[2].split(/,\s*/);
					for (var i=0; i<opts.length; i++) {
						var kv = opts[i].split(/\s*=\s*/);
						var k = kv[0];
						var v = kv[1].match(/\"(.*)\"/)[1];
						if (kv.length !== 2)
							console.error("Malformed option " + opts[i]);
						tagOptions[k] = v;
					}
				}
				switch (tagName.toLowerCase()) {
					case "textbox":
						var line = "";
						if (tagOptions["speaker"])
								line += tagOptions["speaker"] + "\n";
						line += tagText;
						this.textboxes.push(line);
						break;
					case "comment": // comments are ignored
						break;
					default:
						break;
				}
			}
		} while (next_box);
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
		if (ig.global.wm)
			return;

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
			if (entity.freezeOnDialogue === true) {
				entity.unfreeze();
			}
		}
	}

});
	
})
