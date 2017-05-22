!(function(w){
	LGlobal.align=LStageAlign.BOTTOM_MIDDLE;
	LGlobal.stageScale=LStageScaleMode.SHOW_ALL;
	LGlobal.screen(LStage.FULL_SCREEN);
	width = 640, heigth = 640 / window.innerWidth * window.innerHeight;
	LInit(20, 'game', width, heigth, main, LEvent.INIT)
	
	var loadingLeyer,backLeyer,stageLayer,scoreLayer,timeLayer,pager,countLayer,gameBody;
	var gameLayer;
	var imglist;
	var stopFlag;
	var MOVE_STEP = 10;
	var itemSI=false;
	var imgdata=[
		{name : "bg", path : "images/bg.jpg"},
		{name : "feng", path : "images/feng.png"},
		{name : "cup", path : "images/cup.png"},
		{name : "coin", path : "images/coin.png"},
		{name : "bomb", path : "images/bomb.png"},
		{name : "time", path : "images/time.png"},
		{name : "cup_coin", path : "images/cup_coin.png"},
		{name : "pearl", path : "images/pearl.png"},
		{name : "money", path : "images/money.png"}
	]
	function main(){
		LMouseEventContainer.set(LMouseEvent.MOUSE_DOWN,true);
		LMouseEventContainer.set(LMouseEvent.MOUSE_UP,true);
		LMouseEventContainer.set(LMouseEvent.MOUSE_MOVE,true);

		backLeyer = new LSprite();
		addChild(backLeyer);

		loadingLayer= new LoadingSample5();
		backLeyer.addChild(loadingLayer);
		LLoadManage.load(
			imgdata,
			function(progress){
				loadingLayer.setProgress(progress);
			},
			function(result){
				imglist = result;
				backLeyer.removeChild(loadingLayer);
				gameReady();
			}
		)
		function gameReady(){
			LGlobal.backgroundColor = "#b1ebed";
			stageLayer = new LSprite();
			addChild(stageLayer);

			var background = new Background();
			stageLayer.addChild(background);
			background.y = LGlobal.heigth-background.childList[0].heigth;

			countLayer = new CountDown();
			stageLayer.addChild(countLayer);
		}
		function gameStart(level){
			stageLayer.removeChild(countLayer);

			gameLevel = level;
	    	stopFlag = false;
	    	score = 0;
	    	gameBody = new GameBody();
			stageLayer.addChild(gameBody);
		}
		function GameBody(){
			base(this,LSprite,[]);
			this.init();
		}
		GameBody.prototype.init = function(){
			var self = this;

	    	var background = new Background();
	    	self.addChild(background);
	    	background.y= LGlobal.height-background.childList[0].height;

			feng = new Person();
			feng.x = 400;
			feng.y = LGlobal.height-feng.man.childList[0].height-30;
			self.addChild(feng);

			paper = new Paper();
			paper.x = 250;
			paper.y = LGlobal.height-paper.childList[0].height-20;
			self.addChild(paper);

			scoreLayer = new Score();
			scoreLayer.x = 415;
			scoreLayer.y = 10;
			self.addChild(scoreLayer);

			timeLayer = new CDTime();
			timeLayer.x = 10;
			timeLayer.y = 10;
			self.addChild(timeLayer);	
			timeLayer.end = function(){
				self.gameOver();
			};

			itemLayer = new LSprite();
			self.addChild(itemLayer);

			flytxtLayer = new LSprite();
			self.addChild(flytxtLayer);

			feng.change("go");
	    	timeLayer.start(900);
			self.setItem();


			self.addEventListener(LMouseEvent.MOUSE_UP, self.mouseup);
			self.addEventListener(LMouseEvent.MOUSE_DOWN, self.mousedown);
			self.addEventListener(LEvent.ENTER_FRAME,self.onframe);
		}
		GameBody.prototype.setItem = function(){
			var _add = gameLevel == 1 ? function(){
				itemLayer.addChild(new Item("coin"));
				} : ( gameLevel == 2 ? function(){
					var _ran = Math.random();
					if( _ran < 0.7 ){
						itemLayer.addChild(new Item("coin"));
						return;
					}
					itemLayer.addChild(new Item("bomb"));
				} : function(){
					var _ran = Math.random();
					if( _ran < 0.6 ){
						itemLayer.addChild(new Item("coin"));
						return;
					}
					if (_ran < 0.9 ) {
						itemLayer.addChild(new Item("bomb"));
						return;
					};
					itemLayer.addChild(new Item("pearl"));
			});
			itemSI && clearInterval(itemSI);
			itemSI = setInterval(function(){
				_add();
			},1000/30*(200/MOVE_STEP));
		}
		GameBody.prototype.isStop = function(){
			if(stopFlag){
				return true;
			}
			return false;
		};
		GameBody.prototype.mousedown = function(event){
			var self = event.clickTarget;
			if(gameBody.isStop())return;
			self.addEventListener(LMouseEvent.MOUSE_MOVE,self.mousemove);
			return;
		};
		GameBody.prototype.mouseup = function(event){
			var self = event.clickTarget;
			if(gameBody.isStop())return;
			self.removeEventListener(LMouseEvent.MOUSE_MOVE, self.mousemove);
		};
		GameBody.prototype.mousemove = function(event){
			var self = event.clickTarget;

			paper.x = event.offsetX-78;
			if(gameBody.isStop())return;
		};
		GameBody.prototype.clearItem = function(){
			clearInterval(itemSI);
			itemLayer.removeAllChild();
		}		
		GameBody.prototype.gameOver = function(event){
			var self = this;
			stopFlag = true;

			var _cam = gameLevel*5+5;

			self.clearItem();

			self.removeEventListener(LMouseEvent.MOUSE_UP, self.mouseup);
			self.removeEventListener(LMouseEvent.MOUSE_MOVE, self.mousemove);
			self.removeEventListener(LMouseEvent.MOUSE_DOWN, self.mousedown);

			if( score >= _cam ){
				feng.change("happy");
			}else{
				feng.change("sad");
			}
		};
		GameBody.prototype.onframe = function(event){
			var self = event.target,child,i,l;
			if (gameBody.isStop()) return;
			for (var i = 0,l=itemLayer.childList.length; i<l; i++) {
				child = itemLayer.childList[i];
				if (child.hasOut) {
					child.remove();
					i--;
					l--;
				}
			}
		};
		//转化为二位数
		function pad(num, n) {
		    var len = num.toString().length;
		    while(len < n) {
		        num = "0" + num;
		        len++;
		    }
		    return num;
		}	    
	    function dateFormat(input) { 
	        var w = input%100 > 9?input%100:'0'+input%100;
	        var s = Math.floor(input/100)%60>9?Math.floor(input/100)%60:'0'+Math.floor(input/100)%60;
	        var m = Math.floor(input/100/60) > 9?Math.floor(input/100/60):'0'+Math.floor(input/100/60);
	        return m+':'+s+':'+w;   
	    } 
		//背景
		function Background(){
			base(this,LSprite,[]);
			this.init();
		}
		Background.prototype.init=function(){
			var self=this;
			self.back = new LBitmap(new LBitmapData(imglist["bg"],0,0,640,960));
			self.addChild(self.back);
		}
		//人物
		function Person(){
			base(this,LSprite,[]);
			this.init();
		}
		Person.prototype.init = function(){
			var self = this;
			var list = LGlobal.divideCoordinate(780,969,3,3);
			var data = new LBitmapData(imglist["feng"],0,0,260,323);
			self.man = new LAnimationTimeline(data,list);	
			self.man.speed = 8;
			self.man.setLabel("go",0,0);
			self.man.setLabel("happy",1,0);
			self.man.setLabel("sad",2,0);
			self.man.gotoAndPlay("go");
			self.man.stop();
			self.addChild(self.man);					
		}
		Person.prototype.change = function(_label){
			var self = this;
			self.man.gotoAndPlay(_label);
			self.man.play();
		}
		//桶
		function Paper(){
			base(this,LSprite,[]);
			this.init();
		}
		Paper.prototype.init = function(){
			var self = this;
			self.cup = new LBitmap(new LBitmapData(imglist['cup'],0,0,157,114));
			self.coin = new LBitmap(new LBitmapData(imglist['cup_coin'],0,0,63,13));
			self.nums = 0;
			self.addChild(self.cup);
		}
		//分数
		function Score(){
			base(this,LSprite,[]);
			this.init();
		}
		Score.prototype.init = function(){
			var self = this;
			self.back = new LBitmap(new LBitmapData(imglist['money'],0,0,209,72))
			self.main = new LTextField();
			self.main.x = 127;
			self.main.y = 26;
			self.main.textAlign = "center";
			self.main.text = "00";
			self.main.size = 20;
			self.main.color = "#FFFFFF";
			self.main.font = "Verdana";
			self.addChild(self.back);
			self.addChild(self.main);
		}
		Score.prototype.change = function(_val){
			var self = this;
			self.main.text = pad(_val,2);
		}	
		//321倒计时
		function CountDown(){
			base(this,LSprite,[]);
			this.init();		 	
		 }
		 CountDown.prototype.init = function(){
			var self = this;
			var index = 3;
			var timer;
			self.main = new LTextField();
			self.main.x = 327;
			self.main.y = 356;
			self.main.textAlign = "center";
			self.main.text = index;
			self.main.size = "40";
			self.main.font = "Verdana";
			self.addChild(self.main);
			timer = setInterval(function(){
				index--;
				self.main.text  =  index;
				if(index === 0){
					self.main.text  = "go";
					clearInterval(timer);
					gameStart(3)
				}	
			},1000)		 	
		 }
		//游戏倒计时
		function CDTime(){
			base(this,LSprite,[]);
			this.init();
		}
		CDTime.prototype.init = function(){
			var self = this;
			self.back = new LBitmap(new LBitmapData(imglist['time'],0,0,210,74))
			self.main = new LTextField();
			self.main.x = 137;
			self.main.y = 26;
			self.main.textAlign = "center";
			self.main.text = "000";
			self.main.size = "20";
			self.main.color = "#FFFFFF";
			self.main.font = "Verdana";
			self.addChild(self.back);
			self.addChild(self.main);
		}
		CDTime.prototype.start = function(atime){
			var self = this;
			var timeNum = atime;
			var si;
			si = setInterval(function(){
				timeNum--;
				self.main.text = dateFormat(Math.floor((timeNum*1000/30)/10));
				if( timeNum == 0 ){
					clearInterval(si);
					self.end();
				}
			},1000/20)
		}
		CDTime.prototype.end = function(){
			console.log("en")
		}	
		function FlyScore(_txt,_type){
			base(this,LSprite,[]);
			this.init(_txt,_type);
		}
		FlyScore.prototype.init = function(_txt,_type){
			var self = this;
			self.main = new LTextField();
			self.main.text = _txt;
			self.main.size = 20;
			self.main.textAlign = "right";
			self.main.font = "Verdana";

			if(_type == -1){
				self.main.color = "#b0211d";
			}else{
				self.main.color = "#1a6725";
			}
			self.addChild(self.main);
			self.alpha = 1;
			self.y = LGlobal.height-200;
			self.x = paper.x+50;
			LTweenLite.to(self,1,{y:LGlobal.height-300,alpha:0,ease:LEasing.Sine.easeOut,onComplete:function(){
				self.remove();
			}})
		}
		//金子
		function Item(_name){
			base(this,LSprite,[]);
			this.init(_name);
		}		
		Item.prototype.init = function(_name){
			var self = this;
			self.name = _name;
			if( self.name == "coin" ){
				self.box = new LBitmap(new LBitmapData(imglist['coin'],0,0,46,43));
			}
			if( self.name == "pearl" ){
				self.box = new LBitmap(new LBitmapData(imglist['pearl'],0,0,72,72));
			}
			if( self.name == "bomb" ){
				self.box = new LBitmap(new LBitmapData(imglist['bomb'],0,0,62,52));
			}
			self.addChild(self.box);
			self.rotate = Math.floor(Math.random()*180);
			self.x = Math.floor(Math.random()*500)+72;
			self.addEventListener(LEvent.ENTER_FRAME,self.onframe);
		}

		Item.prototype.onframe = function(event){
			if(gameBody.isStop())return;
			var self = event.target;
			self.y += MOVE_STEP;
			if( self.y > LGlobal.height ){ self.hasOut = true; }
			if( self.hitTestObject(paper) ){
				self.visible = 0
				if( self.name == "coin" ){
					score++;
					flytxtLayer.addChild(new FlyScore("+1",1))
				}else if ( self.name == "pearl" ){
					score += 2;
					flytxtLayer.addChild(new FlyScore("+2",1))
				}else{
					score -= 2;
					flytxtLayer.addChild(new FlyScore("-2",-1))
				}
				if( score < 0 ){ score = 0 }
				scoreLayer.change(score);
				if( score % 3 == 0 ){
				}
			}
		}
	}
})(window);
