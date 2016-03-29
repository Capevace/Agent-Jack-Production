/*
Game Name: Agent Jack "I. Chan" Danger
Game type: Fighting Game
*/



//   _____          __  __ ______ 
//  / ____|   /\   |  \/  |  ____|
// | |  __   /  \  | \  / | |__   
// | | |_ | / /\ \ | |\/| |  __|  
// | |__| |/ ____ \| |  | | |____ 
//  \_____/_/    \_\_|  |_|______|
// 
JackDanger.AgentJackIEC = function() {};

// Add Game to game register
//hier musst du deine Eintragungen vornhemen.
addMyGame("agent-jack-iechan", 
    "Agent Jack \"I. Chan\"", 
    "TriDev", 
    "Packe dicke moves aus und infiltriere die Basis.", 
    "Bewegen", //Steuerkreuz
    "Interagieren", //Jump button belegung
    "Kaempfen", //Shoot button belegung
    JackDanger.AgentJackIEC);


// Initialize Minigame Launching
JackDanger.AgentJackIEC.prototype.init = function() {
	// Show loading screen
	addLoadingScreen(this, true);
}

// Load assets for preload
JackDanger.AgentJackIEC.prototype.preload = function() {
	this.load.path = 'games/' + currentGameData.id + '/assets/';//nicht anfassen

	// Debug Ball
	this.load.image('bg','../assetsraw/ball.png');

	// Maze Scenery
	this.load.json("maze-scene", "scenes/maze-scene.json");
	
	// Maze Background
	this.load.image("maze-bg", "maze-bg.png");
	this.load.image("maze-bg-ground", "bg/maze-bg-ground.png");
	this.load.image("maze-bg-middle", "bg/maze-bg-middle.png");
	this.load.image("maze-bg-top", "bg/maze-bg-top.png");

	// Jack (Maze) Atlas
	this.load.atlas("jack", "spritesheets/jack.png", "spritesheets/jack.json", Phaser.Loader.TEXTURE_ATLAS_JSON_HASH); // Jack Running

	// Enemy
	this.load.atlas("enemy", "spritesheets/enemy.png", "spritesheets/enemy.json", Phaser.Loader.TEXTURE_ATLAS_JSON_HASH);

	// Entities (Scenery)
	this.load.atlas("scenery", "spritesheets/scenery.png", "spritesheets/scenery.json", Phaser.Loader.TEXTURE_ATLAS_JSON_HASH);
	
	// Hack Sprites
	this.load.atlas("hack-circles", "hack/circles.png", "hack/circles.json", Phaser.Loader.TEXTURE_ATLAS_JSON_HASH);

	// Blood Splatter
	this.load.atlas("blood", "spritesheets/blood.png", "spritesheets/blood.json", Phaser.Loader.TEXTURE_ATLAS_JSON_HASH);

	// Jack (Maze) Sounds
	this.load.audio('jack-hit', 'sounds/punch-hit.wav');
	this.load.audio('jack-nohit', 'sounds/punch-nohit.wav');
}

// Executed after preload
JackDanger.AgentJackIEC.prototype.create = function() {
	// Init controls & remove loading screen
	Pad.init();
}

JackDanger.AgentJackIEC.prototype.mycreate = function() {
	// Init Minigame
	this.stage.smoothed = false;
	this.game.renderer.renderSession.roundPixels = true;

	this.currentLevel = this.availableLevels.Maze; // Set current level to maze
	this.timeToBeat = 0.0; // Time to beat game
	this.score = 0.0; // Score of game
	this.maze = new this.Maze(this); // Init Maze
	this.boss = new this.Boss(this); // Init Boss
	this.globalScale = 4; // Define global scale, every sprite gets scaled by that
	this.game.main = this;
	this.stopped = false;
	
	// Init Colider Editor (Deactivate for release)
	this.colliderEditor = new this.ColliderEditor(this.game); 
	this.game.input.onDown.add(this.colliderEditor.startColliderDrawing, this.colliderEditor, 0);
	this.game.input.onUp.add(this.colliderEditor.endColliderDrawing, this.colliderEditor, 0);
	
	// Debug
	main = this;

	// Load Level (Maze)
	this.loadLevel(this.availableLevels.Maze);
}

// Gets executed every frame
JackDanger.AgentJackIEC.prototype.update = function() {
	var dt = this.time.physicsElapsedMS * 0.001;

	if (this.stopped)
		return;

	if (this.currentLevel == this.availableLevels.Maze) {
		this.maze.update(dt);
	} else if (this.currentLevel == this.availableLevels.Boss) {
		this.boss.update(dt);
	}
	
	// Debug
	this.colliderEditor.updateColliderDrawing();
}

JackDanger.AgentJackIEC.prototype.render = function() {
	
}

JackDanger.AgentJackIEC.prototype.loadLevel = function (level) {
	if (level == this.availableLevels.Maze) {
		this.boss.disposeLevel();

		this.currentLevel = this.availableLevels.Maze;

		this.maze.initLevel();
	} else if (level == this.availableLevels.Boss) {
		this.maze.disposeLevel();

		this.currentLevel = this.availableLevels.Boss;

		this.boss.initLevel();
	} else {
		logInfo("Dafuq m8. Pass a valid level bitsch");
	}
}

JackDanger.AgentJackIEC.prototype.stop = function () {
	this.stopped = true;
}

JackDanger.AgentJackIEC.prototype.availableLevels = {
	Maze: 0,
	Boss: 1
};





















//  __  __           ____________ 
// |  \/  |   /\    |___  /  ____|
// | \  / |  /  \      / /| |__   
// | |\/| | / /\ \    / / |  __|  
// | |  | |/ ____ \  / /__| |____ 
// |_|  |_/_/    \_\/_____|______|
//     


function setX (y) {
	jackPlayer.sprite.position.x = x;
}    

function setY (y) {
	jackPlayer.sprite.position.y = y;
}        

function playBoss () {
	main.loadLevel(main.availableLevels.Boss);
}

var jackPlayer;
var main;
JackDanger.AgentJackIEC.prototype.Maze = function(parent) {
	this.initialized = false;
	this.main = parent;
}

JackDanger.AgentJackIEC.prototype.Maze.prototype = {
	initLevel: function() {
		logInfo("Init Maze");
		this.initialized = true; // Used to avoid double initializing

		// Setup Sprite Layers
		this.backgroundLayer = this.main.add.group();
		this.entityLayer = this.main.add.group();
		this.foregroundLayer = this.main.add.group();
		this.uiLayer = this.main.add.group();
		this.hackLayer = this.main.add.group();

		this.activeHack = null; // Set active Hack to null

		this.borderOffsetX = 112; // Offset, which is removed from background because of scale

		// Setup Scene
		this.setupScene();

		// UI
		this.ui = new this.UserInterface(this.main);

		// Setup Jack
		this.jack = new this.Jack().init(this.main.world.centerX-250, this.main.world.height - 500, this.main);

		jackPlayer = this.jack; // Debug!
		console.warn("Remove global var jackPlayer + main before release!! Just for debug!!");

		// this.enemy = this.main.add.sprite(200, 200, 'jack');
		// this.main.physics.arcade.enable(this.enemy);
		// this.enemy.scale.setTo(this.main.globalScale, this.main.globalScale + 1); // Set Scale to global scale
		// this.enemy.anchor.setTo(0.5, 0.5); // Set Anchor to center
		// this.enemy.body.collideWorldBounds = true;
		// this.enemy.onJackHit = function() {
		// 	logInfo("I'm hit! Meeediiiic!!");
		// 	this.body.enable = false;
		// 	this.kill();
		// 	this.enemyList.remove(this);
		// };

		// var enemy = this.main.add.sprite(this.jack.sprite.position.x, this.jack.sprite.position.y, "jack");
		// this.main.physics.arcade.enable(enemy);
		// enemy.scale.setTo(this.main.globalScale, this.main.globalScale + 1);
		// enemy.anchor.setTo(0.5);
		// enemy.body.collideWorldBounds = true;
		// enemy.body.setSize(15, 25, 0, 0);
		// enemy.isEnemy = true;
		// enemy.onJackHit = function() {
		// 	logInfo("I'm hit! Meeediiiic!!");
		// };
		// this.enemies.push(enemy);
		// this.entityLayer.add(enemy);


		// Set Camera to follow player
		this.main.camera.follow(this.jack.sprite, Phaser.Camera.FOLLOW_TOPDOWN_TIGHT);
	},


	// Setup scene (Add all Top Layer Entities)
	setupScene: function() {
		// Define Scene Object
		this.scene = {};
		this.sceneData = this.main.cache.getJSON("maze-scene");

		// Setup World + Physics
		this.main.world.setBounds(0, 0, this.sceneData.worldSize.x, this.sceneData.worldSize.y - 400);
		this.main.physics.startSystem(Phaser.Physics.ARCADE);

		// Set World Background
		this.scene.background = this.main.add.sprite(this.main.world.centerX, this.main.world.height, "maze-bg-ground");
		this.scene.background.anchor.setTo(0.5, 1);
		this.scene.background.scale.setTo(this.main.globalScale);
		this.backgroundLayer.add(this.scene.background);

		this.scene.middleGround = this.main.add.sprite(this.main.world.centerX, this.main.world.height, "maze-bg-middle");
		this.scene.middleGround.anchor.setTo(0.5, 1);
		this.scene.middleGround.scale.setTo(this.main.globalScale);
		this.backgroundLayer.add(this.scene.middleGround);

		this.scene.foreground = this.main.add.sprite(this.main.world.centerX, this.main.world.height, "maze-bg-top");
		this.scene.foreground.anchor.setTo(0.5, 1);
		this.scene.foreground.scale.setTo(this.main.globalScale);
		this.foregroundLayer.add(this.scene.foreground);

		this.debugAll = this.sceneData.debugAll;
		this.debugLowerY = this.sceneData.debugLowerY;

		this.enemies = [];

		this.currentSector = 0;
		this.sectors = [0, 550, 1638, 2171];

		// Define Gate
		this.scene.gate = {
			main: this.main,
			opened: false,
			moving: false,
			openGate: function() {
				if (this.opened ||  this.moving)
					return;

				this.moving = true;
				var gate = this;
				var gateL = this.gateDoorL;
				var gateR = this.gateDoorR;
				var closeGate = this.closeGate;

				gateL.body.velocity.x = -25;
				gateR.body.velocity.x = 25;

				setTimeout(function() {
					gateL.body.velocity.x = 0;
					gateR.body.velocity.x = 0;
					gate.opened = true;
					gate.moving = false;
				}, 3500);
			},
			closeGate: function() {
				if (!this.opened ||  this.moving)
					return;

				this.moving = true;
				var gate = this;
				var gateL = this.gateDoorL;
				var gateR = this.gateDoorR;

				gateL.body.velocity.x = 25;
				gateR.body.velocity.x = -25;

				setTimeout(function() {
					gateL.body.velocity.x = 0;
					gateR.body.velocity.x = 0;
					gate.opened = false;
					gate.moving = false;
				}, 3500);
			}
		};

		// Add Gate Left
		this.scene.gate.gateDoorL = this.main.add.sprite(0, 0, "scenery", "gate/gate-door");
		this.main.physics.arcade.enable(this.scene.gate.gateDoorL);
		this.scene.gate.gateDoorL.anchor.setTo(0, 0);
		this.scene.gate.gateDoorL.scale.setTo(this.main.globalScale);
		this.scene.gate.gateDoorL.position.setTo(this.main.world.centerX + 16 - this.scene.gate.gateDoorL.width, this.main.world.height - 568 - 64);
		this.scene.gate.gateDoorL.gate = this.scene.gate;
		this.scene.gate.gateDoorL.body.immovable = true;
		this.scene.gate.gateDoorL.body.sourceWidth = 25;
		this.scene.gate.gateDoorL.body.sourceHeight = 15;
		this.scene.gate.gateDoorL.deltaLowY = 105;
		this.scene.gate.gateDoorL.depthUpdateSettings = {
			shouldUpdateCollider: true,
			sizePlayerUnderSprite: {
				width: 25,
				height: 15,
				offsetX: -100,
				offsetY: 0
			},
			sizePlayerOverSprite: {
				width: 25,
				height: 7,
				offsetX: -100,
				offsetY: 100
			}
		};
		this.entityLayer.add(this.scene.gate.gateDoorL);


		// Add Gate Right
		this.scene.gate.gateDoorR = this.main.add.sprite(0, 0, "scenery", "gate/gate-door");
		this.main.physics.arcade.enable(this.scene.gate.gateDoorR);
		this.scene.gate.gateDoorR.anchor.setTo(0, 0);
		this.scene.gate.gateDoorR.scale.setTo(-this.main.globalScale, this.main.globalScale);
		this.scene.gate.gateDoorR.position.setTo(this.main.world.centerX - 16 - this.scene.gate.gateDoorR.width, this.main.world.height - 568 - 64);
		this.scene.gate.gateDoorR.gate = this.scene.gate;
		this.scene.gate.gateDoorR.body.immovable = true;
		this.scene.gate.gateDoorR.body.sourceWidth = 25;
		this.scene.gate.gateDoorR.body.sourceHeight = 15;
		this.scene.gate.gateDoorR.deltaLowY = 105;
		this.scene.gate.gateDoorR.depthUpdateSettings = {
			sizePlayerUnderSprite: {
				width: 25,
				height: 15,
				offsetX: -225,
				offsetY: 0
			},
			sizePlayerOverSprite: {
				width: 25,
				height: 7,
				offsetX: -225,
				offsetY: 100
			}
		};
		this.entityLayer.add(this.scene.gate.gateDoorR);

		// Debug Listener to open / close door
		this.main.input.keyboard.addKey(Phaser.Keyboard.L).onDown.add(function() {
			if (this.opened) {
				this.closeGate();
			} else {
				this.openGate();
			}
		}, this.scene.gate);


		// Create first gate trigger
		this.triggersWithPlayer.createTrigger(240, 505, 84, 50, this.main, function(main) {
			if (main.maze.activeHack == null) {
				main.maze.activeHack = new main.maze.Hack(main, function() {
					main.maze.activeHack = null;
					main.maze.scene.gate.openGate();
				});
			}
		}, function () {}, false);


		// Loop through entities and create every single one
		for (var i = 0; i < this.sceneData.entities.length; i++) {
			var entityData = this.sceneData.entities[i];

			if (entityData.position == undefined 
				&& entityData.sprite == undefined 
				&& entityData.spritesheet == undefined 
				&& entityData.sizePlayerUnderSprite == undefined 
				&& entityData.sizePlayerOverSprite == undefined 
				&& entityData.id == undefined)
				continue;

			var sprite = this.main.add.sprite(entityData.position.x, this.main.game.world.height - entityData.position.y, entityData.spritesheet, entityData.sprite);
			this.main.physics.arcade.enable(sprite);
			sprite.id = entityData.id;
			sprite.scale.setTo(this.main.globalScale);
			sprite.anchor.setTo((entityData.anchor) ? entityData.anchor.x : 0, (entityData.anchor) ? entityData.anchor.y : 0);
			sprite.body.immovable = (entityData.immovable) ? true : false;
			sprite.depthUpdateSettings = {
				sizePlayerUnderSprite: entityData.sizePlayerUnderSprite, // {width: 75, height: 17, offsetX: 0, offsetY: 256}
				sizePlayerOverSprite: entityData.sizePlayerOverSprite
			};

			if (entityData.deltaLowY != undefined)
				sprite.deltaLowY = entityData.deltaLowY;

			if (entityData.forcedZ != undefined)
				sprite.forcedZ = entityData.forcedZ;

			sprite.body.shouldDebug = (entityData.shouldDebug);

			this.entityLayer.add(sprite);
		}

		for (var i = 0; i < this.sceneData.enemies.length; i++) {
			var enemyData = this.sceneData.enemies[i];
			enemyData.y = this.main.world.height - enemyData.y;

			var enemy = new this.Enemy().init(enemyData, this.main);
			this.enemies.push(enemy);
			this.entityLayer.add(enemy.sprite);
		}
	},


	// List of items that can be triggered by the player
	triggersWithPlayer: {
		createTrigger: function(x, y, width, height, scope, callback, update, shouldDebug) {
			var trigger = {
				getBounds: function() {
					return this.bounds;
				},
				bounds: new Phaser.Rectangle(x, scope.game.world.height - y, width, height),
				trigger: function() {
					if (!this.used) {
						this.used = true;
						this.main.maze.backgroundLayer.remove(this.sprite);
						this.sprite.destroy();
						this.callback(this.main);
					}
				},
				callback: callback,
				main: scope,
				update: update,
				used: false,
				shouldDebug: shouldDebug ||  false,
				sprite: scope.add.sprite(x + width/2, scope.game.world.height - y + height/2, "hack-circles", "trigger")
			};

			trigger.sprite.sourceWidth = width;
			trigger.sprite.sourceHeight = height;
			trigger.sprite.anchor.setTo(0.5, 0.5);
			trigger.sprite.tint = 0xA1D490;
			trigger.sprite.scale.setTo(1.5);
			scope.maze.backgroundLayer.add(trigger.sprite);

			this.push(trigger);
			return trigger;
		},
		push: function(trigger) {
			this.triggers.push(trigger);
		},
		remove: function(trigger) {
			var index = this.triggers.indexOf(trigger);

			if (index != -1)
				this.triggers.splice(index, 1);
		},
		forEach: function(callback, main) {
			if (this.triggers.length == 0)
				return;

			for (var i = 0; i < this.triggers.length; i++) {
				var trigger = this.triggers[i];
				if (trigger.used) {
					// Remove object out of array
					this.triggers.splice(i, 1);

					// go back one index. for loop would skip next item otherwise
					i--;
					continue;
				} else {
					if (callback(trigger, i, this.triggers, main))
						i = this.triggers.length;
				}
			}
		},
		triggers: []
	},


	// Called every frame
	update: function(dt) {
		if (this.activeHack != null) {
			this.activeHack.update();
		} else {
			// Update Jack
			this.jack.update(dt);
			this.updateEnemies(dt, this.jack, this.currentSector);
			this.updateSector();

			// Sort depth after all other code was run
			this.sortDepth();
			this.debug();

			if (this.jack.sprite.position.y <= 112.5) {
				onVictory();
			}
		}
	},


	// Updates All Enemies
	updateEnemies: function (dt, jack, currentSector) {
		for (var i = 0; i < this.enemies.length; i++) {
			var enemy = this.enemies[i];

			if (enemy.dead) {
				this.enemies.splice(i, 1);
				i--; // Go back one index so we dont skip the next item

			} else {
				this.enemies[i].update(dt, jack, currentSector);
			}
		}
	},


	updateSector: function () {
		var currentSectorY = this.sectors[this.currentSector];
		var nextSectorY = (this.currentSector + 1 < this.sectors.length) ? this.sectors[this.currentSector+1] : -1;

		if (this.main.world.height - this.jack.sprite.position.y >= nextSectorY && nextSectorY != -1) {
			this.currentSector++;
			logInfo(this.currentSector);
		}
	},


	sortDepth: function() {
		// Go through all entities and sort depth
		this.entityLayer.customSort(function(a, b) {
			// Get lower Y of a
			var aY = (a.deltaLowY != undefined) ? a.position.y + a.deltaLowY * (1 - a.anchor.y) : a.position.y + (a.height * (1 - a.anchor.y));

			// Get lower Y of b
			var bY = (b.deltaLowY != undefined) ? b.position.y + b.deltaLowY * (1 - b.anchor.y) : b.position.y + (b.height * (1 - b.anchor.y));

			if (this.debugLowerY) {
				this.main.game.debug.geom(new Phaser.Rectangle(a.position.x, a.position.y + a.deltaLowY, 10, 10), "blue");
				this.main.game.debug.geom(new Phaser.Rectangle(b.position.x, b.position.y + b.deltaLowY, 10, 10), "blue");
			}

			// Reset positions if a or b is player
			if (a.isPlayer) {
				aY = a.position.y + (a.height / 2) - 32;
			} else if (b.isPlayer) {
				bY = b.position.y + (b.height / 2) - 32;
			}

			if (aY > bY) { // If a 'infront' (under) then put to foreground
				return 1;
			} else if (aY < bY) { // If a 'behind' (over) then put to background
			return -1;
		}

		return 0;
	}, this);

		// Go through entities again to update depth colliders with player
		for (var i = 0; i < this.entityLayer.children.length; i++) {
			var child = this.entityLayer.children[i];

			// Skip if we get the player entity
			if (child.isPlayer)
				continue;

			// Get Jack and Child lower Y
			var jackY = this.jack.sprite.position.y + (this.jack.sprite.height / 2) - 32;
			var childY = (child.deltaLowY != undefined) ? child.position.y + child.deltaLowY * (1 - child.anchor.y) : child.position.y + (child.height * (1 - child.anchor.y));

			// If Jack infront of child => collider = playerUnderSprite
			if (jackY > childY) {
				if (child.body && child.depthUpdateSettings) {
					child.body.setSize(child.depthUpdateSettings.sizePlayerUnderSprite.width, 
						child.depthUpdateSettings.sizePlayerUnderSprite.height, 
						this.main.maze.borderOffsetX + child.depthUpdateSettings.sizePlayerUnderSprite.offsetX, 
						child.depthUpdateSettings.sizePlayerUnderSprite.offsetY
						);
				}
			}

			// If Jack infront of child => collider = playerOverSprite
			else {
				if (child.body && child.depthUpdateSettings) {
					child.body.setSize(child.depthUpdateSettings.sizePlayerOverSprite.width, 
						child.depthUpdateSettings.sizePlayerOverSprite.height, 
						this.main.maze.borderOffsetX + child.depthUpdateSettings.sizePlayerOverSprite.offsetX, 
						child.depthUpdateSettings.sizePlayerOverSprite.offsetY
						);
				}
			}
		}
	},


	// Unload Level (remove all sprites)
	disposeLevel: function() {
		if (!this.initialized) return;

		logInfo("Dispose Maze");

		this.jack.sprite.destroy();
		delete this.jack;

		for (var i = 0; i < this.enemies.length; i++) {
			this.enemies[i].sprite.destroy();
		}
		delete this.enemies;

		this.backgroundLayer.destroy();
		this.entityLayer.destroy();
		this.foregroundLayer.destroy();
		this.uiLayer.destroy();
		this.hackLayer.destroy();
	},

	// Put debug in here
	debug: function() {
		//		this.main.game.debug.body(this.jack.sprite);
	}
};

JackDanger.AgentJackIEC.prototype.Maze.prototype.UserInterface = function (main) {
	this.enabled = true;
	this.main = main;

	this.health = this.main.add.text(0, 0, "HP: 99", {color: 0xFFFFFF});
	this.health.fixedToCamera = true;

	this.main.maze.uiLayer.add(this.health);

	return this;
};

JackDanger.AgentJackIEC.prototype.Maze.prototype.UserInterface.prototype = {

	setHP: function (hp) {
		this.health.text = "HP: " + hp;
	}
};



















//       _         _____ _  __
//      | |  /\   / ____| |/ /
//      | | /  \ | |    | ' / 
//  _   | |/ /\ \| |    |  <  
// | |__| / ____ \ |____| . \ 
//  \____/_/    \_\_____|_|\_\
//                                                                                    
JackDanger.AgentJackIEC.prototype.Maze.prototype.Jack = function() {
	return this;
}
JackDanger.AgentJackIEC.prototype.Maze.prototype.Jack.prototype = {
	init: function(x, y, main) {
		// Set Jack + parent (main)
		this.sprite = main.add.sprite(x, y, 'jack'); // Setup Sprite
		this.main = main;
		this.main.maze.entityLayer.add(this.sprite);
		this.main.physics.arcade.enable(this.sprite); // Enable physics

		// Scale + anchor
		this.sprite.scale.setTo(this.main.globalScale); // Set Scale to global scale
		this.sprite.anchor.setTo(0.5, 0.5); // Set Anchor to center

		// Physics settings
		this.sprite.body.collideWorldBounds = true; // Enable collision with world bounds
		this.sprite.body.sourceWidth = 14;
		this.sprite.body.sourceHeight = 20;
		this.sprite.isPlayer = true; // To be able to identify player

		// Jack States
		this.shooting = false;
		this.lockMovement = false;
		this.lockActions = false;
		this.isHitting = false;
		this.lastDirection = 0;


		// Jack stats
		this.xHittingDistance = {
			primary: 50,
			secondary: 50
		};
		this.yHittingDistance = {
			primary: 50,
			secondary: 50
		};
		this.hitSpeed = 50;
		this.fullSpeed = 150;
		this.walkSpeed = this.fullSpeed;
		this.healthPoints = 3;


		// Jack's sounds
		this.sound = {
			hit: this.main.add.audio("jack-hit"),
			noHit: this.main.add.audio("jack-nohit")
		};


		////
		// Jack Animations
		////
		// Jack Animation Run Left-Right
		this.sprite.animations.add("run-lr-idle", Phaser.Animation.generateFrameNames('run-lr-idle-', 0, 0, '', 4), 1, true, false);
		this.sprite.animations.add("run-lr", Phaser.Animation.generateFrameNames('run-lr-', 0, 16, '', 4), 40, true, false);

		// Jack Animation Run Up
		this.sprite.animations.add("run-up-idle", Phaser.Animation.generateFrameNames('run-up-idle-', 0, 0, '', 4), 1, true, false);
		this.sprite.animations.add("run-up", Phaser.Animation.generateFrameNames('run-up-', 0, 17, '', 4), 40, true, false);

		// Jack Animation Run Down
		this.sprite.animations.add("run-down-idle", Phaser.Animation.generateFrameNames('run-down-idle-', 0, 0, '', 4), 1, true, false);
		this.sprite.animations.add("run-down", Phaser.Animation.generateFrameNames('run-down-', 0, 17, '', 4), 40, true, false);

		// Jack Animation Punching
		this.sprite.animations.add("punch-lr", Phaser.Animation.generateFrameNames('punch-lr-', 0, 6, '', 4), 20, false, false);
		this.sprite.animations.add("punch-up", Phaser.Animation.generateFrameNames('punch-up-', 0, 5, '', 4), 20, false, false);
		this.sprite.animations.add("punch-down", Phaser.Animation.generateFrameNames('kick-down-', 0, 10, '', 4), 30, false, false);


		// Player Shadow (Disabled for now)
		//		this.sprite.shadow = main.add.sprite(main.game.world.centerX, main.game.world.centerY, "jack");
		//		this.sprite.shadow.anchor.setTo(0.5, 1);
		//		this.sprite.shadow.tint = 0x000000;
		//		this.sprite.shadow.alpha = 0.2;
		//		this.sprite.shadow.offset = {x: 0, y: -29};
		//		this.main.maze.entityLayer.add(this.sprite.shadow);

		this.main.maze.ui.setHP(this.healthPoints);

		return this;
	},


	// Possible walking directions for jack
	possibleDirections: {
		LEFT: 0,
		RIGHT: 1,
		UP: 2,
		DOWN: 3
	},

	// Gets called every frame
	update: function(dt) {
		this.updateInput(dt);
		this.updateAnimation(dt);
		//		this.updateShadow(dt);
		this.updateCollision(dt);
	},


	// Update for Jack's animation
	updateAnimation: function(dt) {
		if (this.walkAnimationBlocked)
			return;

		if (this.sprite.body.velocity.y === 0 && this.sprite.body.velocity.x === 0) {
			// Idle Animations for last directions
			if (this.lastDirection == this.possibleDirections.LEFT)  {
				this.sprite.animations.play("run-lr-idle");
			} else if (this.lastDirection == this.possibleDirections.RIGHT)  {
				this.sprite.animations.play("run-lr-idle");
			} else if (this.lastDirection == this.possibleDirections.UP)  {
				this.sprite.animations.play("run-up-idle");
			} else if (this.lastDirection == this.possibleDirections.DOWN)  {
				this.sprite.animations.play("run-down-idle");
			}
		} else {
			// Walking animations for corresponding direcitons
			if (this.lastDirection == this.possibleDirections.LEFT)  {
				this.sprite.animations.play("run-lr");
			} else if (this.lastDirection == this.possibleDirections.RIGHT)  {
				this.sprite.animations.play("run-lr");
			} else if (this.lastDirection == this.possibleDirections.UP)  {
				this.sprite.animations.play("run-up");
			} else if (this.lastDirection == this.possibleDirections.DOWN)  {
				this.sprite.animations.play("run-down");
			}
		}
	},


	// Update Shadow for Jack (Disabled for now)
	updateShadow: function(dt) {
		// Update Shadow
		//		this.sprite.shadow.frame = this.sprite.frame;
		//		this.sprite.shadow.scale.setTo(this.sprite.scale.x , -0.25);
		//		this.sprite.shadow.position.setTo(this.sprite.position.x + this.sprite.shadow.offset.x, 
		// this.sprite.position.y + this.sprite.height/2 + this.sprite.shadow.offset.y);
	},


	// Update Input Controls
	updateInput: function(dt) {
		this.sprite.body.velocity = {
			x: 0,
			y: 0
		};

		if (!this.lockMovement) {
			if (Pad.isDown(Pad.UP)) {
				this.sprite.body.velocity.y -= this.walkSpeed;
				this.lastDirection = this.possibleDirections.UP;
			} else if (Pad.isDown(Pad.DOWN)) {
				this.sprite.body.velocity.y += this.walkSpeed;
				this.lastDirection = this.possibleDirections.DOWN;
			}

			if (Pad.isDown(Pad.LEFT)) {
				this.sprite.body.velocity.x -= this.walkSpeed;
				this.lastDirection = this.possibleDirections.LEFT;
			} else if (Pad.isDown(Pad.RIGHT)) {
				this.sprite.body.velocity.x += this.walkSpeed;
				this.lastDirection = this.possibleDirections.RIGHT;
			}

			if (this.sprite.body.velocity.x > 0 && this.sprite.scale.x < 0)
				this.sprite.scale.x *= -1;
			else if (this.sprite.body.velocity.x < 0 && this.sprite.scale.x > 0)
				this.sprite.scale.x *= -1;

			if ((this.lastDirection == this.possibleDirections.UP || this.lastDirection == this.possibleDirections.DOWN) && this.sprite.scale.x < 0)
				this.sprite.scale.x *= -1;
		}

		if (!this.lockActions) {
			if (Pad.justDown(Pad.SHOOT) && !this.isHitting) {
				logInfo("SHOOT");

				this.onHit(this);
			}
		}
	},


	// Gets called to update all player collisions
	updateCollision: function() {
		// collide with colliders
		for (var i = 0; i < this.main.maze.entityLayer.children.length; i++) {
			var child = this.main.maze.entityLayer.children[i];

			if (child.isPlayer || child.isEnemy)
				continue;

			this.main.physics.arcade.collide(this.sprite, child);

			if ((child.body && child.body.shouldDebug) || this.main.maze.debugAll) {
				this.main.game.debug.body(child);
			}
		}

		// Look for triggers and activate them if jump pressed
		var shouldTrigger = Pad.justDown(Pad.JUMP);
		var jack = this;
		this.main.maze.triggersWithPlayer.forEach(function(trigger, i, triggers) {
			var overlaps = trigger.getBounds().contains(jack.sprite.position.x, jack.sprite.position.y + (jack.sprite.height / 2) - 32);

			if (trigger.shouldDebug) {
				jack.main.game.debug.geom(trigger.getBounds());
			}

			// If Player overlaps with trigger display action dialog
			if (overlaps)
				trigger.update();

			if (shouldTrigger && !trigger.isUsed && overlaps) {
				trigger.trigger();
			}
		}, this.jack);
	},


	// On Player press punch
	onHit: function() {
		this.walkAnimationBlocked = true; // Lock walk animation, so punch animation can be shown
		this.lockActions = true; // Disable anymore punches while one punch is happening
		this.isHitting = true; // Set hitting to true
		this.walkSpeed = this.hitSpeed; // Slow down player

		// Select and play punch animation for current direction
		if (this.lastDirection == this.possibleDirections.LEFT || this.lastDirection == this.possibleDirections.RIGHT)  {
			this.sprite.animations.play("punch-lr");
		} else if (this.lastDirection == this.possibleDirections.UP)  {
			this.sprite.animations.play("punch-up");
		} else if (this.lastDirection == this.possibleDirections.DOWN)  {
			this.sprite.animations.play("punch-down");
		}

		// Add animation complete handler => hit complete
		this.sprite.animations.currentAnim.onComplete.add(this.onHitComplete, this);

		var hitbox;
		switch (this.lastDirection) {
			case this.possibleDirections.UP:    hitbox = {x: -15, y: 0, width: 30, height: 25}; break;
			case this.possibleDirections.DOWN:  hitbox = {x: -15, y: 0, width: 30, height: 25}; break;
			case this.possibleDirections.LEFT:  hitbox = {x: -25, y: 0, width: 25, height: 30}; break;
			case this.possibleDirections.RIGHT: hitbox = {x: 0, y: 0, width: 25, height: 30}; break;
			default: this.sound.noHit.play(); break;
		}

		hitbox.x += this.sprite.position.x;
		hitbox.y += this.sprite.position.y - hitbox.height/2;

		// this.main.game.debug.geom(new Phaser.Rectangle(hitbox.x, hitbox.y, hitbox.width, hitbox.height), "blue");

		for (var i = 0; i < this.main.maze.enemies.length; i++) {
			var enemy = this.main.maze.enemies[i];
			var enemyHitbox = {x: enemy.sprite.position.x, y: enemy.sprite.position.y, width: enemy.sprite.body.width, height: enemy.sprite.body.height};
			enemyHitbox.x -= enemyHitbox.width/2;
			enemyHitbox.y -= enemyHitbox.height/2;

			// this.main.game.debug.geom(new Phaser.Rectangle(enemyHitbox.x, enemyHitbox.y, enemyHitbox.width, enemyHitbox.height));

			if (hitbox.x < enemyHitbox.x + enemyHitbox.width 
				&& hitbox.x + hitbox.width > enemyHitbox.x 
				&& hitbox.y < enemyHitbox.y + enemyHitbox.height 
				&& hitbox.height + hitbox.y > enemyHitbox.y) {


		    	this.sound.hit.play();

				if (enemy.onHitByJack != undefined)
					enemy.onHitByJack(5);
			} else {
				this.sound.noHit.play();
			}
		}
	},


	// On hit animation complete
	onHitComplete: function() {
		this.walkAnimationBlocked = false;
		this.lockActions = false;
		this.isHitting = false;
		this.walkSpeed = this.fullSpeed;
	},


	damage: function () {
		this.healthPoints--;
		this.main.maze.ui.setHP(this.healthPoints);

		if (this.healthPoints <= 0) {
			this.die();
			return;
		}

		var blood = this.main.add.sprite(this.sprite.position.x, this.sprite.position.y, "blood");
		blood.anchor.setTo(0.5);
		blood.scale.setTo(this.main.globalScale);
		blood.animations.add("splat", Phaser.Animation.generateFrameNames('blood-', 0, 5, '', 4), 7, false, false);
		blood.animations.play("splat");
		blood.animations.currentAnim.onComplete.add(function () {
			this.kill();
		}, blood);
		this.main.maze.entityLayer.add(blood);

		// var sprite = this.sprite;
		// sprite.tint = 0xFF0000;

		setTimeout(function () {
			// sprite.tint = 0xFFFFFF;
		}, 500);
	},

	die: function () {
		onLose();
	}
}
























JackDanger.AgentJackIEC.prototype.Maze.prototype.Hack = function (main, callback, scope) {
	this.main = main;
	this.callback = callback;
	this.scope = scope;
	this.active = true;
	this.background = this.main.add.sprite(this.main.world.width/2, 0, "hack-circles", "hack-bg");
	this.background.alpha = 1;
	this.background.anchor.setTo(0.5);
	this.background.scale.setTo(this.main.globalScale);
	this.background.position.setTo(this.main.world.width/2, this.background.height);
	this.main.maze.hackLayer.add(this.background);

	this.maxRad = (2 * Math.PI);

	var circle1 = this.main.add.sprite(this.background.position.x, this.background.position.y, "hack-circles", "circle-0-off");
	circle1.anchor.setTo(0.5);
	circle1.scale.setTo(this.main.globalScale);
	circle1.rotation = Math.random() * this.maxRad;
	circle1.circleName = "circle-0-";
	circle1.checkRot = function () {
		if (this.rotation >= 0.04886316915294853 && this.rotation >= 6.234322138)
			return true;

		return false;
	};
	this.main.maze.hackLayer.add(circle1);

	var circle2 = this.main.add.sprite(this.background.position.x, this.background.position.y, "hack-circles", "circle-1-off");
	circle2.anchor.setTo(0.5);
	circle2.scale.setTo(this.main.globalScale);
	circle2.rotation = Math.random() * this.maxRad;
	circle2.circleName = "circle-1-";
	circle2.checkRot = function () {
		if (this.rotation >= 0.04886316915294853 && this.rotation >= 6.234322138)
			return true;

		return false;
	};
	this.main.maze.hackLayer.add(circle2);

	var circle3 = this.main.add.sprite(this.background.position.x, this.background.position.y, "hack-circles", "circle-2-off");
	circle3.anchor.setTo(0.5);
	circle3.scale.setTo(this.main.globalScale);
	circle3.rotation = Math.random() * this.maxRad;
	circle3.circleName = "circle-2-";
	circle3.checkRot = function () {
		if (this.rotation >= 0.04886316915294853 && this.rotation >= 6.234322138)
			return true;

		return false;
	};
	this.main.maze.hackLayer.add(circle3);

	var circle4 = this.main.add.sprite(this.background.position.x, this.background.position.y, "hack-circles", "circle-3-off");
	circle4.anchor.setTo(0.5);
	circle4.scale.setTo(this.main.globalScale);
	circle4.rotation = Math.random() * this.maxRad;
	circle4.circleName = "circle-3-";
	circle4.checkRot = function () {
		if (this.rotation >= 0.04886316915294853 && this.rotation >= 6.234322138)
			return true;

		return false;
	};
	this.main.maze.hackLayer.add(circle4);

	this.circles = [circle1, circle2, circle3, circle4];
	this.selectedCircle = 0;
	this.connectionDone = false;

	this.previousTarget = this.main.camera.target;
	this.main.camera.unfollow();
	this.main.camera.position = new Phaser.Point(this.background.position.x, this.background.position.y - this.background.height/3.5 + 1);
	
};

JackDanger.AgentJackIEC.prototype.Maze.prototype.Hack.prototype = {

	update: function () {
		if (this.connectionDone) {
			return;
		}

		if (Pad.justDown(Pad.DOWN)) {			
			this.selectedCircle++;

			if (this.selectedCircle >= 4) {
				this.selectedCircle = 3;
			}

		} else if (Pad.justDown(Pad.UP)) {			
			this.selectedCircle--;

			if (this.selectedCircle < 0) {
				this.selectedCircle = 0;
			}
		}

		var circle = this.circles[this.selectedCircle];

		if (Pad.isDown(Pad.LEFT)) {
			circle.rotation += 0.0349066/2; // 5 Degrees per frame
		} else if (Pad.isDown(Pad.RIGHT)) {
			circle.rotation -= 0.0349066/2; // 5 Degrees per frame
		}

		var allActive = true;
		for (var i = 0; i < this.circles.length; i++) {
			var circle = this.circles[i];

			while (circle.rotation > this.maxRad) {
				circle.rotation = circle.rotation - this.maxRad;
			}

			while (circle.rotation < 0) {
				circle.rotation = this.maxRad - circle.rotation;
			}

			if (circle.checkRot()) {
				circle.frameName = circle.circleName + "on";
				circle.tint = 0xFFFFFF;
			} else {
				allActive = false;
				circle.frameName = circle.circleName + "off";
				circle.tint = 0xFFFFFF;

				if (i == this.selectedCircle)
					circle.tint = 0xE3E3E3;
			}
		}

		if (allActive) {
			this.endGame();
		}
	},
	
	endGame: function () {
		this.connectionDone = true;
		this.background.frameName = "hack-bg-done";

		var self = this;
		setTimeout(function () {
			self.dispose();
		}, 1000);
	},


	dispose: function () {
		this.background.destroy();

		for(var i = 0; i < this.circles.length; i++) {
			this.circles[i].destroy();
		}

		this.main.camera.follow(this.previousTarget, Phaser.Camera.FOLLOW_TOPDOWN_TIGHT);
		
		logInfo(this.callback);
		this.callback(this.scope);
	}
};























//  ______ _   _ ______ __  ____     __
// |  ____| \ | |  ____|  \/  \ \   / /
// | |__  |  \| | |__  | \  / |\ \_/ / 
// |  __| | . ` |  __| | |\/| | \   /  
// | |____| |\  | |____| |  | |  | |   
// |______|_| \_|______|_|  |_|  |_|   
//                                     
JackDanger.AgentJackIEC.prototype.Maze.prototype.Enemy = function () {return this;}
JackDanger.AgentJackIEC.prototype.Maze.prototype.Enemy.prototype = {
	init: function (enemySettings, main) {
		this.sprite = main.add.sprite(enemySettings.x, enemySettings.y, enemySettings.spriteName); // Setup Sprite
		this.main = main;
		this.main.maze.entityLayer.add(this.sprite);
		this.main.physics.arcade.enable(this.sprite); // Enable physics

		// Scale + anchor
		this.sprite.scale.setTo(this.main.globalScale); // Set Scale to global scale
		this.sprite.anchor.setTo(0.5, 0.5); // Set Anchor to center

		// Physics settings
		this.sprite.body.collideWorldBounds = true; // Enable collision with world bounds
		this.sprite.body.setSize(15, 20, 0, 0);
		this.sprite.isEnemy = true;
		this.sprite.deltaLowY = 50;

		// Enemy States
		this.walkAnimationBlocked = false;

		// Enemy Stats
		this.hitSpeed = enemySettings.hitSpeed;
		this.fullSpeed = enemySettings.fullSpeed;
		this.walkSpeed = this.fullSpeed;
		this.maxHealth = enemySettings.maxHealth;
		this.health = this.maxHealth;
		this.attackStrength = enemySettings.attackStrength;
		this.sector = enemySettings.sector;
		this.hitting = false;

		this.targetPosition = new Phaser.Point();

		////
		// Enemy Animations
		////
		// Enemy Animation Run Left-Right
		this.sprite.animations.add("run-lr-idle", ["run-lr-idle"], 1, true, false);
		this.sprite.animations.add("run-lr", Phaser.Animation.generateFrameNames('run-lr-', 1, 7, '', 4), 8, true, false);
		this.sprite.animations.add("run-down", Phaser.Animation.generateFrameNames('run-down-', 0, 6, '', 4), 8, true, false);
		this.sprite.animations.add("run-up", Phaser.Animation.generateFrameNames('run-up-', 0, 5, '', 4), 8, true, false);

		this.sprite.animations.add("punch-lr", Phaser.Animation.generateFrameNames('punch-lr-', 0, 7, '', 4), 16, false, false);
		this.sprite.animations.add("punch-down", Phaser.Animation.generateFrameNames('punch-down-', 0, 4, '', 4), 10, false, false);
		this.sprite.animations.add("punch-up", Phaser.Animation.generateFrameNames('punch-up-', 0, 4, '', 4), 16, false, false);
		
		this.sprite.animations.play("run-lr-idle");

		return this;
	},


	// Update every frame
	update: function (dt, jackPosition, currentSector) {
		if (this.sector != currentSector)
			return;

		this.updateAI(dt, jackPosition);
		this.updateAnimation();
		this.updateCollision();
	},


	// Update AI every frame
	updateAI: function (dt, jack) {
		this.targetPosition = jack.sprite.position;
		var distanceToTarget = Phaser.Point.distance(this.targetPosition, this.sprite.position);

		if (distanceToTarget > 30.0) {
			var direction = Phaser.Point.subtract(this.targetPosition, this.sprite.position).normalize();

			this.sprite.body.velocity = direction.multiply(this.walkSpeed * dt * 1000, this.walkSpeed * dt * 1000);
		} else {
			this.sprite.body.velocity = new Phaser.Point();

			if (!this.hitting) {
				this.hitting = true;
				this.walkAnimationBlocked = true;

				var direction = Phaser.Point.subtract(this.targetPosition, this.sprite.position).normalize();
				logInfo(direction);
				if (Math.abs(direction.y) < Math.abs(direction.x)) {
					this.sprite.animations.play("punch-lr");
				} else {
					if (direction.y < 0)
						this.sprite.animations.play("punch-up");
					else
						this.sprite.animations.play("punch-down");
				}

				var cacheJack = jack;
				this.sprite.animations.currentAnim.onComplete.add(function () {
					this.hitting = false;
					this.walkAnimationBlocked = false;

					if (Phaser.Point.distance(cacheJack.sprite.position, this.sprite.position) <= 30 && this.health > 0) {
						cacheJack.damage();
					}
				}, this);
			}
		}
	},


	// Gets called each frame to update animations
	updateAnimation: function () {
		if (this.walkAnimationBlocked)
			return;

		// Play correct animation
		if (this.sprite.body.velocity.y === 0 && this.sprite.body.velocity.x === 0) {
			// Idle Animations
			this.sprite.animations.play("run-lr-idle");
		} else {
			// Walking animations for corresponding direcitons
			if (Math.abs(this.sprite.body.velocity.y) < Math.abs(this.sprite.body.velocity.x)) {
				this.sprite.animations.play("run-lr");
			} else {
				if (this.sprite.body.velocity.y < 0)
					this.sprite.animations.play("run-up");
				else
					this.sprite.animations.play("run-down");
			}
			//  else if (this.lastDirection == this.possibleDirections.UP) {
			// 	this.sprite.animations.play("run-up");
			// } else if (this.lastDirection == this.possibleDirections.DOWN) {
			// 	this.sprite.animations.play("run-down");
			// }
		}

		// Correct flip
		if (this.sprite.body.velocity.x > 0 && this.sprite.scale.x < 0)
			this.sprite.scale.x *= -1;
		else if (this.sprite.body.velocity.x < 0 && this.sprite.scale.x > 0)
			this.sprite.scale.x *= -1;

		// if (this.sprite.body.velocity.y == 0 && this.jack.sprite.scale.x < 0)
		// 	this.jack.sprite.scale.x *= -1;
	},


	updateCollision: function () {
		for (var i = 0; i < this.main.maze.entityLayer.children.length; i++) {
			var child = this.main.maze.entityLayer.children[i];

			// Skip Player Collision
			if (child.isPlayer)
				continue;

			this.main.physics.arcade.collide(this.sprite, child);
		}

		if ((this.sprite.body && this.sprite.body.shouldDebug)) {
			this.main.game.debug.body(this.sprite);
		}
	},


	// Gets called when jack hits this
	onHitByJack: function (attackStrength) {
		this.health -= attackStrength;

		var sprite = this.sprite;
		sprite.tint = 0xFF0000;
		setTimeout(function () {
			sprite.tint = 0xFFFFFF;
		}, 500);


		if (this.health <= 0) {
			this.die();
		}
	},


	// enemy die
	die: function () {
		this.dead = true;
		this.sprite.destroy();
	}
};














//  ____   ____   _____ _____ 
// |  _ \ / __ \ / ____/ ____|
// | |_) | |  | | (___| (___  
// |  _ <| |  | |\___ \\___ \ 
// | |_) | |__| |____) |___) |
// |____/ \____/|_____/_____/ 
//
JackDanger.AgentJackIEC.prototype.Boss = function (parent) {
	this.initialized = false;
	this.game = parent;
}

JackDanger.AgentJackIEC.prototype.Boss.prototype = {
	initLevel: function () {
		logInfo("Init Boss");

		this.game.world.setBounds(0, 0, 800, 450);
		this.running = true;

		this.jack = this.game.add.sprite(this.game.world.width/2, this.game.world.height - 100, "jack", "run-lr-idle-0000");
		this.jack.scale.setTo(this.game.globalScale);
		this.jack.anchor.setTo(0.5, 1);
		this.jack.animations.add("punch-lr", Phaser.Animation.generateFrameNames('punch-lr-', 0, 6, '', 4), 20, false, false);
		this.jack.animations.add("punch-up", Phaser.Animation.generateFrameNames('punch-up-', 0, 5, '', 4), 20, false, false);
		this.jack.animations.add("idle", ["run-lr-idle-0000"], 30, false, false);

		this.jack.health = 100;
		this.jack.sound = {
			hit: this.game.add.audio("jack-hit"),
			noHit: this.game.add.audio("jack-nohit")
		};

		this.jack.flip = function (left) {
			// Left true => -1
			// Left right => 1
			if ((left && this.scale.x >= 0) || (!left && this.scale.x < 0))
				this.scale.x *= -1;
		};
		this.jack.hit = function (left, $enemies) {
			var hitNothing = true;
			for (var i = 0; i < $enemies.length; i++) {
				var enemy = $enemies[i];
				var inRange = (enemy.isLeft) ? enemy.position.x >= 300 : enemy.position.x <= 500;

				if (enemy.isLeft === left && inRange) {
					hitNothing = false;

					this.sound.hit.play(false);
					enemy.tint = 0xFF0000;

					setTimeout(function () {
						enemy.destroy();
					}, 50);

					$enemies.splice(i, 1);
					
					i = $enemies.length;
				}
			}

			if (hitNothing)
				this.sound.noHit.play(false);
		};

		this.enemies = [];
		this.enemiesCount = 20;

		this.canPunch = true;
		this.punchCooldown = 0;

		// var self = this;
		// var spawnMachineLoop = setInterval(function () {
		// 	self.spawnMachine();
		// }, 500);

		this.spawnMachineTime = 0.5;
	},

	update: function (dt) {
		this.updateInput(dt);
		this.spawnMachine(dt);
	},

	updateInput: function (dt) {
		if (!this.canPunch) {
			this.punchCooldown -= dt;

			if (this.punchCooldown <= 0) {
				this.canPunch = true;
			}
		}

		if (Pad.justDown(Pad.LEFT) && this.canPunch) {
			this.jack.animations.play("punch-lr");
			this.jack.flip(true);
			this.jack.hit(true, this.enemies);
			this.canPunch = false;
			this.punchCooldown = 0.3;
		} else if (Pad.justDown(Pad.RIGHT) && this.canPunch) {
			this.jack.animations.play("punch-lr");
			this.jack.flip(false);
			this.jack.hit(false, this.enemies);
			this.canPunch = false;
			this.punchCooldown = 0.3;
		} else {
			if (!this.jack.animations.currentAnim.isPlaying) {
				this.jack.animations.play("idle", 30, true);
			}
		}
	},

	updateEnemies: function () {
		for (var i = 0; i < this.enemies.length; i++) {
			this.enemies[i].update();
		}
	},

	spawnMachine: function (dt) {
		this.spawnMachineTime -= dt;

		if (this.spawnMachineTime <= 0) {
			this.spawnMachineTime = 0.5;
		} else {
			return;
		}

		if (this.enemiesCount-- <= 0 && this.running) {
			if (this.enemies.length <= 0) {
				this.disposeLevel();
				this.game.stop();
				onVictory();
			}
			
			return;
		}

		var side = Math.round(Math.random());

		if (side === 0) {
			this.spawnEnemy(true);
		} else {
			this.spawnEnemy(false);
		}
	},

	spawnEnemy: function (isLeft) {
		var x = (isLeft) ? 20 : this.game.world.width - 20;
		var scale = (isLeft) ? 1 : -1;

		var enemy = this.game.add.sprite(x, this.game.world.height - 100, "jack");
		enemy.scale.setTo(this.game.globalScale);
		enemy.scale.x *= scale;
		enemy.anchor.setTo(0.5, 1);

		this.game.physics.arcade.enable(enemy);
		enemy.body.velocity.setTo(500 * scale, 0);

		enemy.animations.add("punch-lr", Phaser.Animation.generateFrameNames('punch-lr-', 0, 10, '', 4), 30, false, false);

		enemy.isLeft = isLeft;
		enemy.startedAttacking = false;
		enemy.update = function () {
			if (this.isLeft && this.position.x >= 350) {
				this.body.velocity = new Phaser.Point();
				this.startAttacking();
			} else if (!this.isLeft && this.position.x <= 450) {
				this.body.velocity = new Phaser.Point();
				this.startAttacking();
			}
		};
		enemy.startAttacking = function () {
			if (this.startedAttacking)
				return;

			this.startedAttacking = true;

			var self = this;
			this.attack();
			setInterval(function () {
				self.attack();
			}, 400);
		};
		enemy.attack = function () {
			this.animations.play("punch-lr", 30, false);
		};

		this.enemies.push(enemy);
	},

	disposeLevel: function () {
		if (!this.initialized) return;
		this.running = false;

		clearInterval(this.sMLoop);

		logInfo("Dispose Boss");
	}
};



















// Collider Editor enables quick getting coordinates for Colliders
JackDanger.AgentJackIEC.prototype.ColliderEditor = function (game) {
	this.isDrawing = false;
	this.startingPoint = new Phaser.Point(0, 0);
	this.endPoint = new Phaser.Point(0, 0);
	this.game = game;
};

JackDanger.AgentJackIEC.prototype.ColliderEditor.prototype = {
	
	// Start Collider Drawing
	startColliderDrawing: function () {
		if (this.isDrawing)
			return;
				
		this.isDrawing = true;
		this.startingPoint = new Phaser.Point(this.game.input.worldX, this.game.input.worldY);
	},
	
	// Update Collider Size
	updateColliderDrawing: function () {
		if (!this.isDrawing)
			return;
		
		this.endPoint = new Phaser.Point(this.game.input.worldX, this.game.input.worldY);
		this.game.debug.geom(new Phaser.Rectangle(this.startingPoint.x, this.startingPoint.y, this.endPoint.x - this.startingPoint.x, this.endPoint.y - this.startingPoint.y));
	},
	
	// End Collider Drawing
	endColliderDrawing: function () {
		if (!this.isDrawing)
			return;
		
		this.isDrawing = false;
		this.endPoint = new Phaser.Point(this.game.input.worldX, this.game.input.worldY);
		
		var x = (this.startingPoint.x < this.endPoint.x) ? this.startingPoint.x : this.endPoint.x;
		var y = (this.startingPoint.y < this.endPoint.y) ? this.startingPoint.y : this.endPoint.y;
		var width = (this.startingPoint.x < this.endPoint.x) ? this.endPoint.x - this.startingPoint.x : this.startingPoint.x - this.endPoint.x;
		var height = (this.startingPoint.y < this.endPoint.y) ? this.endPoint.y - this.startingPoint.y : this.startingPoint.y - this.endPoint.y;
		
		logInfo(this.game);
		
		logInfo(JSON.stringify({
			x: x - 113,
			y: this.game.world.height - y,
			width: width/this.game.main.globalScale,
			height: height/this.game.main.globalScale
		}));
		logInfo('{\n\
			"id": "name",\n\
			"spritesheet": "",\n\
			"sprite": "",\n\
			"position": {"x": ' + (x - 113) + ', "y": ' + (this.game.world.height - y) + '},\n\
			"anchor": {"x": 0, "y": 0},\n\
			"deltaLowY": 320,\n\
			"immovable": true,\n\
			"sizePlayerUnderSprite": {\n\
				"width": ' + (width/this.game.main.globalScale) + ',\n\
				"height": ' + (height/this.game.main.globalScale) + ',\n\
				"offsetX": 0,\n\
				"offsetY": 0\n\
			},\n\
			"sizePlayerOverSprite": {\n\
				"width": ' + (width/this.game.main.globalScale) + ',\n\
				"height": ' + (height/this.game.main.globalScale) + ',\n\
				"offsetX": 0,\n\
				"offsetY": 0\n\
			},\n\
			"shouldDebug": false\n\
		}');


	}
};