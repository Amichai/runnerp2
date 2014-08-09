	var game;
	var ball;
	var runner;
	var jumping = false;
	var kicking = false;
	var started = false;
	var text1;
	var progress_empty;
	var progress_full;
	var pb; // platformbuilder
	var CG_Terrain;
	var CG_Ball;
	var CG_Runner;
	
	var lastRunnerX = 0;

    window.onload = function() {
	
		game = new Phaser.Game(800, 600, Phaser.CANVAS, '', { preload: preload, create: create, update: update, render: render });
		
		pb = new PGE.PlatformBuilder(game);
		
        function preload () {

			// load progress bar art
			game.load.image('progressbar_empty', 'assets/ui/progress_empty.png');
			game.load.image('progressbar', 'assets/ui/progress.png');
		
			game.stage.backgroundColor = '#50b1d4';
			
        }

        function create () {
			
			// create temporary progress bar sprites
			progress_empty = game.add.sprite((800-600)/2,(600-40)/2, 'progressbar_empty');
			progress_full = game.add.sprite((800-600)/2,(600-40)/2, 'progressbar');
			game.load.setPreloadSprite(progress_full);
		
			 //	load status
			text1 = game.add.text(280, (600-40)/2, '', { fill: '#FFFFFF'});
			game.load.onFileComplete.add(fileComplete, this);
			game.load.onLoadComplete.add(loadComplete, this);
			
			// queue assets for loading
			game.load.image('bg', 'assets/background1.jpg');
			game.load.image('tile1', 'assets/sprites/terrain/tile1.png');
			game.load.image('tile2', 'assets/sprites/terrain/tile2.png');
			game.load.image('tile3', 'assets/sprites/terrain/tile3.png');
			game.load.image('tile4', 'assets/sprites/terrain/tile4.png');
			game.load.image('tile5', 'assets/sprites/terrain/tile5.png');
			game.load.image('tile6', 'assets/sprites/terrain/tile6.png');
			game.load.image('tile7', 'assets/sprites/terrain/tile7.png');
			
			game.load.image('ball', 'assets/sprites/soccer.png');
			game.load.physics('tilepolygons', 'assets/sprites/terrain/tiles.json');
			game.load.atlasJSONHash('run', 'assets/sprites/running.png', 'assets/sprites/running.json');
			game.load.atlasJSONHash('jump', 'assets/sprites/jumping.png', 'assets/sprites/jumping.json');
			game.load.atlasJSONHash('kick', 'assets/sprites/kicking.png', 'assets/sprites/kicking.json');
			
			// start loading
			game.load.start();
		
        }

//	This callback is sent the following parameters:
function fileComplete(progress, cacheKey, success, totalLoaded, totalFiles) {

	text1.setText("Loaded: " + progress + "% - " + totalLoaded + " / " + totalFiles);

}

function loadComplete() {

	game.world.remove(text1);
	game.world.remove(progress_empty);
	start();

}

// after all assets loaded...
function start() {
		
			// add background image
			var bg = game.add.image(0, 0, 'bg');
			bg.scale.set(0.6);

			// creation of large world bounds
            game.world.bounds = new Phaser.Rectangle(-800, -600, 800*3, 600*3);  
					
			//	Enable p2 physics with gravity
			game.physics.startSystem(Phaser.Physics.P2JS);
			game.physics.p2.gravity.y = 2400;
			
			// add some tiles to platformbuilder
			
			pb.addTile('tile1');
			pb.addTile('tile1');
			pb.addTile('tile2',72); // with a 72px gap before it
			pb.addTile('tile5');
			pb.addTile('tile1');
			pb.addTile('tile1');
			pb.addTile('tile1');
			pb.addTile('tile3');
			pb.addTile('tile4');
			pb.addTile('tile1');
			pb.addTile('tile1');
			pb.addTile('tile6');
			pb.addTile('tile7');
			
			for (var i=1;i<100;i++){
				pb.addTile('tile1');
			}
			
			CG_Terrain = game.physics.p2.createCollisionGroup();
			CG_Ball = game.physics.p2.createCollisionGroup();
			CG_Runner = game.physics.p2.createCollisionGroup();
			//game.physics.p2.updateBoundsCollisionGroup();
			
			// create ball sprite
			ball = game.add.sprite(500, 50, 'ball');
			ball.scale.set(0.1);
	
			//  runner sprite is using a texture atlas for all of its animation data
			runner = game.add.sprite(50, 350, 'runner');	
			runner.scale.set(0.8);
			runner.loadTexture('run', 0);
			runner.animations.add('run');
			runner.animations.play('run', 30, true);
			
			// enable physics on non platform sprites
			game.physics.p2.enable([ball,runner]);
			//game.physics.p2.enable([ball]);
			//game.physics.p2.enable([runner], true);

			// enable physics on platform sprites
			pb.enablePhysics();
			
			// load collision polygons for platform sprites
			pb.loadPolygons(CG_Terrain,[CG_Ball,CG_Runner]);
		
			// add circle body to ball
			ball.body.clearShapes();
			ball.body.addCircle(ball.width*0.5);
			ball.body.setCollisionGroup(CG_Ball);
			ball.body.collides(CG_Terrain);
			
			runner.body.setCollisionGroup(CG_Runner);
			runner.body.collides(CG_Terrain);
			
			runner.body.data.gravityScale = 2;
			
		
			/*
			game.camera.bounds = game.world.bounds;
			game.camera.bounds.x = 0;
			game.camera.bounds.y = 0;
			game.camera.bounds.height = 600;
			*/
			
			
			game.camera.bounds = null;
			game.camera.x = 0;
			
			
			//game.camera.follow(runner, Phaser.Camera.FOLLOW_PLATFORMER);
			//game.camera.follow(runner);
			
			started = true;
		
		}
		
		function update() {

			if (game.input.keyboard.isDown(Phaser.Keyboard.LEFT)) {
			
				if (!jumping && !kicking){
					jumping = true;
					runner.loadTexture('jump', 0);
					var anim = runner.animations.add('jump');					
					anim.onComplete.add(jumpCompleted, this);
					runner.animations.play('jump', 30);
					runner.body.velocity.y -= 2000;
				}
						
			}
			
			
			if (game.input.keyboard.isDown(Phaser.Keyboard.RIGHT)) {
			
				if (!kicking && !jumping){
					kicking = true;
		
					runner.loadTexture('kick', 0);
					var anim = runner.animations.add('kick');		
					anim.onComplete.add(kickCompleted, this);
					runner.animations.play('kick', 30);
					// todo: runner to ball range check...					
					ball.body.velocity.x += 1200;
					//ball.body.mass = 100;
					
				}
			
			
			}
			
			if (started){
				//game.camera.x+=5;
				runner.body.x = lastRunnerX + 10;
				
				lastRunnerX = runner.body.x;
				
				//runner.body.data.force[0] = 0;
				//runner.body.data.force[1] = -50;
				
				game.camera.x = runner.body.x - 100;
				
				if (runner.body.angle > 30) runner.body.angle = 30;
				if (runner.body.angle < -30) runner.body.angle = -30;
				
				if (ball.body.x < runner.body.x+runner.width/2) ball.body.x = runner.body.x+runner.width/2;
				
			}
			
			
		
		}
		
		function jumpCompleted(){
		
			jumping=false;
			kicking=false;
			
			runner.loadTexture('run', 0);
			var anim = runner.animations.add('run');
			runner.animations.play('run', 30,true);
		
		}
	
		function kickCompleted(){
		
			jumping=false;
			kicking=false;
			
			runner.loadTexture('run', 0);
			var anim = runner.animations.add('run');
			runner.animations.play('run', 30,true);
		
		}
		
		function render() {
			//game.debug.cameraInfo(game.camera, 32, 32);
			
			if (runner != null) {
				//game.debug.spriteCoords(runner, 32, 500);
			}

		}

		

    };