enchant();

enchant.Sound.enabledInMobileSafari = true;

if(location.protocol == 'file:'){
    enchant.ENV.USE_WEBAUDIO = false;
    console.log('1');
}

window.onload = function () {
    game = new Game(854, 400);
    game.fps = 60;
    game.score = 0;
	game.topscore = 10000;
    game.touched = false;
    game.apressed = false;
    game.ended = true;
    game.preload('ship.png');
    game.preload('bullet.png');
    game.preload('comet_large.png');
    game.preload('comet_med.png');
    game.preload('comet_small.png');
	game.preload('black.png');
    game.preload('shoot.wav');
    game.preload('die.wav');
    game.preload('explode.wav');
   
    game.onload = function () {
        player = new Player(0, 188);
        enemies = new Array();
        game.rootScene.backgroundColor = 'black';
        
        //Executed every 20 frames
        game.rootScene.addEventListener('enterframe', function () {
            if(game.frame%20 == 0 && !game.ended){
                var y = rand(400);
                var enemy = new Comet(854, y, rand(90) - 45, 3, rand(5)+2);
                enemies.push(enemy);
				if(game.score>25000)
				{
					var y = rand(400);
					var enemy = new Comet(854, y, rand(90) - 45, 2, rand(5)+3);
					enemies.push(enemy);
				}
				if(game.score>50000)
				{
					var y = rand(400);
					var enemy = new Comet(854, y, rand(90) - 45, 2, rand(5)+4);
					enemies.push(enemy);
				}
				if(game.score>100000)
				{
					var y = rand(400);
					var enemy = new Comet(854, y, rand(90) - 45, 2, rand(5)+5);
					enemies.push(enemy);
				}
				
                game.rootScene.removeChild(scoreLabel);
                game.rootScene.addChild(scoreLabel);
                game.rootScene.removeChild(topScoreLabel);
                game.rootScene.addChild(topScoreLabel);
            }
            
            if(window.wiiu){
                if(game.frame%3 == 0 && game.input.a && !game.ended){
                	var s = new PlayerShoot(player.x, player.y);
                }
            }
            
            scoreLabel.score = game.score;
			if(game.score>game.topscore){
				game.topscore = game.score;
				topScoreLabel.score = game.topscore;
			}
			else{
				topScoreLabel.score = game.topscore;
			}
        });
        scoreLabel = new ScoreLabel(4, 4);
        game.rootScene.addChild(scoreLabel);
		topScoreLabel = new TopScoreLabel(310, 4);
		game.rootScene.addChild(topScoreLabel);

		gameOver = new MutableText(350, 150, 300);
		gameOver.text = "GAME OVER";
		
		restart = new MutableText(280, 250, 400);
		if(window.wiiu){
			restart.text = "PRESS A TO RESTART";
		}
		else{
			restart.text = "TAP/CLICK TO RESTART";
		}
		
		credits = new MutableText(480, 380, 400);
		credits.text = "CREATED BY ADAM COMPEAU";
		
		intro = new MutableText(280, 200, 400);
		if(window.wiiu){
			intro.text = "PRESS A TO START";
        }
		else{
			intro.text = "TAP/CLICK TO START";
		}
		game.rootScene.addChild(intro);
    };
    game.start();
};

var Player = enchant.Class.create(enchant.Sprite, {
    initialize: function (x, y) {
        enchant.Sprite.call(this, 35, 27);
        this.image = game.assets['ship.png'];
        this.x = x;
        this.y = y;
        this.frame = 0;

        game.rootScene.addEventListener('touchstart', function (e) {
            player.y = e.y;
            game.touched = true;
			if(game.ended)
			{
				game.rootScene.removeChild(gameOver);
				game.rootScene.removeChild(restart);
				game.rootScene.removeChild(credits);
				game.rootScene.removeChild(intro);
				scoreLabel.x = 4;
                scoreLabel.y = 4;
				game.score = 0;
				game.ended = false;
			}
        });
        game.rootScene.addEventListener('touchmove', function (e) {
            player.y = e.y;
        });
        game.rootScene.addEventListener('touchend', function (e) {
            player.y = e.y;
            game.touched = false;
        });

        this.addEventListener('enterframe', function () {
            if(!window.wiiu){
            	if(game.touched && game.frame%3 == 0 && !game.ended){
                	var s = new PlayerShoot(player.x, player.y);
                }
            }
			
			if (this.x > 854) {
				this.x = 854;
            }
			if (this.x < 0) {
				this.x = 0;
            }
			if (this.y > 400) {
                //this.direction = -this.direction;
                this.y = -this.height;
            }
            if (this.y < -this.height) {
                //this.direction = -this.direction;
                this.y = 400;
            }
			
			for (var i in enemies) {
                if (enemies[i].intersect(this)) {
					var lefthit = this.x+11;
					var righthit = this.x+15;
					var tophit = this.y+18;
					var bottomhit = this.y+9;
					if(lefthit>enemies[i].x+enemies[i].width || 
						enemies[i].x>righthit ||
						bottomhit>enemies[i].y+enemies[i].height ||
						enemies[i].y>tophit)
						{}
                    else{
						game.assets['die.wav'].clone().play();
						
						game.rootScene.addChild(gameOver);
                        
						scoreLabel.x = 350;
                        scoreLabel.y = 180;
						
						game.rootScene.addChild(restart);
						game.rootScene.addChild(credits);
                        
						for (var i in enemies) {
                            enemies[i].remove();
							var y = rand(400);
							var enemy = new Comet(3000, y, rand(90) - 45, 3);
							enemy.moveSpeed = 0;
							enemies[i] = enemy;
							enemies[i].remove();
                        }
                        
						game.ended = true;
					}
                }
            }
			
			if(window.wiiu){
				player.x += game.input.lstick.x * 10;
				player.y += game.input.lstick.y * 10;
                if(game.input.a){
                	if(game.apressed == false && !game.ended)
                    {
                		var s = new PlayerShoot(player.x, player.y);
                    }
					if(game.apressed == false && game.ended)
					{
						game.rootScene.removeChild(gameOver);
						game.rootScene.removeChild(restart);
						game.rootScene.removeChild(credits);
						game.rootScene.removeChild(intro);
						scoreLabel.x = 4;
                        scoreLabel.y = 4;
						game.score = 0;
						game.ended = false;
					}
                	game.apressed = true;
                }
                else
                {
                	game.apressed = false;
                }
			}
        });

        game.rootScene.addChild(this);
    }
});


var Comet = enchant.Class.create(enchant.Sprite, {
    initialize: function (x, y, direction, size, speed) {
        this.size = size;

        if (size == 3) {
            enchant.Sprite.call(this, 62, 64);
            this.image = game.assets['comet_large.png'];
        } else if (size == 2) {
            enchant.Sprite.call(this, 28, 30);
            this.image = game.assets['comet_med.png'];
        } else if (size == 1) {
            enchant.Sprite.call(this, 16, 17);
            this.image = game.assets['comet_small.png'];
        }

        this.x = x;
        this.y = y;
        this.frame = 3;

        //Sets rotation angle.
        this.omega = 0;

        //Set movement angle and movement speed (pixels per frame).
        this.direction = direction;
        this.moveSpeed = speed;

        this.addEventListener('enterframe', function () {
            this.move();
            if (this.x > 854 || this.x < -this.width) {
				//this.moveSpeed = 0;
				this.x = 854;
                //this.remove();
            }
            if (this.y > 400) {
                //this.direction = -this.direction;
                this.y = -this.height;
            }
            if (this.y < -this.height) {
                //this.direction = -this.direction;
                this.y = 400;
            }

            for (var i in enemies) {
                if (enemies[i].intersect(this) && enemies[i] != this) {
                    this.direction = -this.direction;
                    if (this.y > enemies[i].y) {
                        this.y += 2;
                    }
                    else {
                        this.y -= 2;
                    }
                }
            }
        });
        game.rootScene.addChild(this);
    },
    move: function () {
        this.direction += this.omega;
        this.x -= this.moveSpeed * Math.cos(this.direction / 180 * Math.PI);
        this.y += this.moveSpeed * Math.sin(this.direction / 180 * Math.PI)
    },
    remove: function () {
        game.rootScene.removeChild(this);
        delete enemies[this.key];
    }
});

var Shoot = enchant.Class.create(enchant.Sprite, {
    initialize: function (x, y, direction) {
        enchant.Sprite.call(this, 15, 4);
        this.image = game.assets['bullet.png'];
        this.x = x+35;
        this.y = y+12;
        this.frame = 1;
        this.direction = direction;
        this.moveSpeed = 25;
        this.addEventListener('enterframe', function () {
            this.x += this.moveSpeed * Math.cos(this.direction);
            this.y += this.moveSpeed * Math.sin(this.direction);
            if(this.y > 400 || this.x > 854 || this.x < -this.width || this.y < -this.height) {
                this.remove();
            }
            if(game.ended)
            {
                this.remove();
            }
        });
		game.assets['shoot.wav'].clone().play();
        game.rootScene.addChild(this);
    },
    remove: function () {
        game.rootScene.removeChild(this);
        delete this;
    }
});

var PlayerShoot = enchant.Class.create(Shoot, {
    initialize: function (x, y) {
        Shoot.call(this, x, y, 0);
        this.addEventListener('enterframe', function () {
            for (var i in enemies) {
                if (enemies[i].intersect(this)) {
					this.x = 4000;
					this.remove();
                    game.score += 100;
					game.assets['explode.wav'].clone().play();
                    var size = enemies[i].size - 1;
                    if (size > 0 && !game.ended) {
                        var enemy = new Comet(enemies[i].x, enemies[i].y+5, rand(45), size, enemies[i].moveSpeed);
                        enemy.key = game.frame;
                        enemies.push(enemy);
                        var enemy2 = new Comet(enemies[i].x, enemies[i].y-5, rand(45) - 45, size, enemies[i].moveSpeed);
                        enemy2.key = game.frame;
                        enemies[i].remove();
                        enemies[i] = enemy2;
                    } else {
                        enemies[i].remove();
						var y = rand(400);
						var enemy = new Comet(3000, y, rand(90) - 45, 3, 0);
						enemies[i] = enemy;
                        enemies[i].remove();
                    }
                }
            }
        });
    }
});

var TopScoreLabel = enchant.Class.create(enchant.ui.MutableText, {
    initialize: function(x, y) {
        enchant.ui.MutableText.call(this, 0, 0);
        switch (arguments.length) {
            case 2:
                this.y = y;
                this.x = x;
                break;
            case 1:
                this.x = x;
                break;
            default:
                break;
        }
        this._score = 0;
        this._current = 0;
        this.easing = 2.5;
        this.text = this.label = 'TOP SCORE:';
        this.addEventListener('enterframe', function() {
            if (this.easing === 0) {
                this.text = this.label + (this._current = this._score);
            } else {
                var dist = this._score - this._current;
                if (0 < dist) {
                    this._current += Math.ceil(dist / this.easing);
                } else if (dist < 0) {
                    this._current += Math.floor(dist / this.easing);
                }
                this.text = this.label + this._current;
            }
        });
    },

    score: {
        get: function() {
            return this._score;
        },
        set: function(newscore) {
            this._score = newscore;
        }
    }
});