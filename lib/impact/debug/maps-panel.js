ig.module(
	'impact.debug.maps-panel'
)
.requires(
	'impact.debug.menu',
	'impact.game',
	'impact.background-map'
)
.defines(function(){ "use strict";


ig.Game.inject({
	 loadLevel: function( data ) {
	 	data.layer.push({ //when loading level, adds grid to map. grid layer disabled by default.
	 		"name": "grid",
	 		"width": 1,
	 		"height": 1,
	 		"linkWithCollision": false,
	 		"visible": 0,
	 		"tilesetName": "media/debug_spritesheet.png",
	 		"repeat": true,
	 		"preRender": false,
	 		"distance": "1",
	 		"tilesize": 32,
	 		"foreground": false,
	 		"data": [
	 			[1]
	 		]
	 	});

	 	var tmp = [];
	 	for(var i=0;i<data.layer[0].height;i++) {
	 		tmp.push(new Array(data.layer[0].width).fill(0));
	 	}

	 	data.layer.push({ //allocates dummy layer for path, filled in after processing entities n such
	 		"name": "path",
	 		"width": data.layer[0].width,
	 		"height": data.layer[0].height,
	 		"linkWithCollision": false,
	 		"visible": 0,
	 		"tilesetName": "media/debug_spritesheet.png",
	 		"repeat": false,
	 		"preRender": false,
	 		"distance": "1",
	 		"tilesize": 32,
	 		"foreground": true,
	 		"data": tmp
	 	});
	 	this.parent(data);
	 	 if(EntityEnemyPursuer.navMaps.length!==0 && this.getEntitiesByType(EntityEnemyPursuer).length!==0) {
	 	 	var x=0;
	 	 	var y=0;
	 	 	var len=0;
	 	 	for(var i=0;i<EntityEnemyPursuer.navMaps[0].tiles.length;i++) {
	 	 		x=EntityEnemyPursuer.navMaps[0].tiles[i].x;
	 	 		y=EntityEnemyPursuer.navMaps[0].tiles[i].y;
	 	 		len=EntityEnemyPursuer.navMaps[0].tiles[i].len;
	 	 		if(len===0) this.backgroundMaps[this.backgroundMaps.length-1].data[y][x]=5;
	 	 		else {
	 	 			 this.backgroundMaps[this.backgroundMaps.length-1].data[y][x]=3;
	 	 			 for(var j=1;j<len;j++) this.backgroundMaps[this.backgroundMaps.length-1].data[y][x+j]=2;
	 	 			 this.backgroundMaps[this.backgroundMaps.length-1].data[y][x+len]=4;
	 	 		}
	 	 	}
	 	 }
	 	 
	 	 
	 	 //everything's real confusing, so I'm resorting to simply trimming excess layers after generation is complete
	 	 
	 	 var flagG=true;
	 	 var flagP=true;
		 for(var i=0; i<this.backgroundMaps.length;i++) {
			 if(this.backgroundMaps[i].name=="grid") {
				 if(flagG) {
					 this.backgroundMaps[i].enabled=false;
					 flagG=false;
				 }
				 else {
					 this.backgroundMaps.splice(i,1);
					 i--;
				 }
			 }
			 
			 if(this.backgroundMaps[i].name=="path") {
				 if(flagP) {
					 this.backgroundMaps[i].enabled=false;
					 flagP=false;
				 }
				 else {
					 this.backgroundMaps.splice(i,1);
					 i--;
				 }
			 }
		 }
	 	ig.debug.panels.maps.load(this);
	 }
});

ig.Game._debugShowPath=false;


ig.DebugMapsPanel = ig.DebugPanel.extend({
	maps: [],
	mapScreens: [],


	init: function( name, label ) {
		this.parent( name, label );
		this.load();
	},


	load: function( game ) {
		this.options = [];
		this.panels = [];

		if( !game || !game.backgroundMaps.length ) {
			this.container.innerHTML = '<em>No Maps Loaded</em>';
			return;
		}

		this.maps = game.backgroundMaps;
		this.mapScreens = [];
		this.container.innerHTML = '';

		for( var m = 0; m < this.maps.length; m++ ) {
			var map = this.maps[m];

			var subPanel = new ig.DebugPanel( m, 'Layer '+m );

			var head = new ig.$new('strong');
			head.textContent = m +': ' + map.tiles.path;
			subPanel.container.appendChild( head );

			subPanel.addOption( new ig.DebugOption('Enabled', map, 'enabled') );
			subPanel.addOption( new ig.DebugOption('Pre Rendered', map, 'preRender') );
			subPanel.addOption( new ig.DebugOption('Show Chunks', map, 'debugChunks') );

			this.generateMiniMap( subPanel, map, m );
			this.addPanel( subPanel );
		}
	},


	generateMiniMap: function( panel, map, id ) {
		var s = ig.system.scale; // we'll need this a lot

		// resize the tileset, so that one tile is 's' pixels wide and high
		var ts = ig.$new('canvas');
		var tsctx = ts.getContext('2d');

		var w = map.tiles.width * s;
		var h = map.tiles.height * s;
		var ws = w / map.tilesize;
		var hs = h / map.tilesize;
		ts.width = ws;
		ts.height = hs;
		tsctx.drawImage( map.tiles.data, 0, 0, w, h, 0, 0, ws, hs );

		// create the minimap canvas
		var mapCanvas = ig.$new('canvas');
		mapCanvas.width = map.width * s;
		mapCanvas.height = map.height * s;
		var ctx = mapCanvas.getContext('2d');

		if( ig.game.clearColor ) {
			ctx.fillStyle = ig.game.clearColor;
			ctx.fillRect(0, 0, w, h);
		}

		// draw the map
		var tile = 0;
		for( var x = 0; x < map.width; x++ ) {
			for( var y = 0; y < map.height; y++ ) {
				if( (tile = map.data[y][x]) ) {
					ctx.drawImage(
						ts,
						Math.floor(((tile-1) * s) % ws),
						Math.floor((tile-1) * s / ws) * s,
						s, s,
						x * s, y * s,
						s, s
					);
				}
			}
		}

		var mapContainer = ig.$new('div');
		mapContainer.className = 'ig_debug_map_container';
		mapContainer.style.width = map.width * s + 'px';
		mapContainer.style.height = map.height * s + 'px';

		var mapScreen = ig.$new('div');
		mapScreen.className = 'ig_debug_map_screen';
		mapScreen.style.width = ((ig.system.width / map.tilesize) * s - 2) + 'px';
		mapScreen.style.height = ((ig.system.height / map.tilesize) * s - 2) + 'px';
		this.mapScreens[id] = mapScreen;

		mapContainer.appendChild( mapCanvas );
		mapContainer.appendChild( mapScreen );
		panel.container.appendChild( mapContainer );
	},


	afterRun: function() {
		// Update the screen position DIV for each mini-map
		var s = ig.system.scale;
		for( var m = 0; m < this.maps.length; m++ ) {
			var map = this.maps[m];
			var screen = this.mapScreens[m];

			if( !map || !screen ) { // Quick sanity check
				continue;
			}

			var x = map.scroll.x / map.tilesize;
			var y = map.scroll.y / map.tilesize;

			if( map.repeat ) {
				x %= map.width;
				y %= map.height;
			}

			screen.style.left = (x * s) + 'px';
			screen.style.top = (y * s) + 'px';
		}
	}
});


ig.debug.addPanel({
	type: ig.DebugMapsPanel,
	name: 'maps',
	label: 'Background Maps'
});


});
