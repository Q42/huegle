window.Sergey = new (function(){

	// polygon definitions for the 4 buttons
	var polygons = {
		green: [48, 119, 23, 168, 7, 226, 4, 269, 13, 335, 44, 405, 82, 454, 126, 490, 173, 515, 223, 527, 247, 531, 356, 347, 317, 375, 284, 384, 241, 382, 196, 361, 167, 329, 155, 301],
		red: [49, 118, 155, 300, 151, 255, 163, 215, 187, 183, 224, 158, 262, 150, 278, 149, 507, 149, 464, 88, 421, 49, 375, 23, 323, 7, 278, 2, 241, 3, 201, 11, 158, 26, 125, 44, 93, 68, 75, 85],
		yellow: [278, 149, 508, 149, 528, 209, 533, 247, 533, 299, 520, 350, 497, 401, 470, 440, 426, 481, 401, 497, 354, 518, 303, 530, 247, 531, 357, 346, 386, 287, 384, 240, 368, 203, 338, 172, 307, 155],
		blue: [172, 273, 183, 315, 213, 348, 253, 365, 289, 365, 336, 341, 362, 305, 368, 266, 363, 239, 343, 205, 306, 178, 264, 170, 234, 176, 197, 203, 175, 243] 
	}
	
	var self = this;
	var touch = 'ontouchstart' in document.documentElement,
			$html, $body, $buttons, $countdown,
			buttonState = 0,
			state = State.waiting_for_new_game,
			chosenColor = '',
			sequenceToMatch = [],
			playingSequence = [];

	// start the game
	this.start = function() {
		// cache elements
		$html = $('html'),
		$body = $('body'),
		$buttons = $('#buttons'),
		$countdown = $('#countdown'),
		$gameboard = $('#gameboard');

		resize();
		$(window).bind('resize', resize);		

		$html.addClass('waiting-for-new-game');

		var android = window.isOnAndroid();

		$buttons.bind('touchstart' + (android?'':' mousedown'), buttonDown);
		$(document).on('touchmove' + (android?'':' mousemove'), 'html', move);
		$(document).on('touchend' + (android?'':' mouseup'), 'html.buttonDown', buttonUp);

		createSequence(3);

		updateLevel();
		
		if (Settings.enableHUE) {
			$('#waitlayer').show();
			$('#waitlabel').html("");
			window.setTimeout('Sergey.initializeLamps()', 1000);
		}
	};

	this.initializeLamps = function() {
		
		hue.turnOnAll();
		Utils.sleep(500);

		

		
		
		/*
		hue.turnOnAll(1);
		Utils.sleep(200);
		hue.turnOnAll(2);
		Utils.sleep(200);
		hue.turnOnAll(3);
		Utils.sleep(200);
		hue.turnOnAll(4);
		Utils.sleep(200);
*/


		// prep all right colors too
		hue.setAllColors(colorDict.red, 1);
		Utils.sleep(200);
		hue.setAllColors(colorDict.green, 2);
		Utils.sleep(200);
		hue.setAllColors(colorDict.yellow, 3);
		Utils.sleep(200);
		hue.setAllColors(colorDict.blue, 4);

		Utils.sleep(200);
		hue.turnOff(1);
		hue.turnOff(7);
		hue.turnOff(49);
		hue.turnOff(43);

		Utils.sleep(500);

		hue.setAllBrightness(Settings.defaultBrightnessSergey);

		$('#waitlayer').hide();
		$('#waitlabel').html("PRESS<br/>TO<br/>START");
		
	};

	function resize() {
		var top = Math.max(0, Math.round($(window).height() / 2 - $('#gameboard').height()/2));
		//top = Math.max(45, top);
		$gameboard.css('top', top + 'px');
	}

	function clearMySequence() {
		playingSequence = [];
	}

	// when player pressed a color, add it to the playing sequence
	function addToMySequence(color) {
		switch (color) {
			case 'red':
			case 'R':
				playingSequence.push('R');
				break;
			case 'green':
			case 'G':
				playingSequence.push('G');
				break;
			case 'blue':
			case 'B':
				playingSequence.push('B');
				break;
			case 'yellow':
			case 'Y':
				playingSequence.push('Y');
				break;
		}
		testMySequence();
	}

	function testMySequence() {
		var stillGood = true;
		for (var i=0; i<sequenceToMatch.length; i++) {
			if (playingSequence[i] != undefined && playingSequence[i] != sequenceToMatch[i]) {
				stillGood = false;
				break;
			}
		}

		// if still on track, just get out of here
		if (stillGood && playingSequence.length < sequenceToMatch.length)
			return;

		$html.addClass('hideColors');
		state = State.checking;

		// if not good, then not good!
		if (stillGood)
			right();
		else
			wrong();
	}

	function wrong() {
		setTimeout(function() { $countdown.append('<div id="number-wrong" class="number">NO</div>'); setTimeout(function() { $('#number-wrong').addClass('animate'); }, 0); }, 0);		
		clearMySequence();
		setTimeout(function() {
			$countdown.html('');
			self.playSequence();
		}, 2000);
	}

	function right() {
		//if (Settings.enableHUE) hue.flashAll();
		setTimeout(function() { $countdown.append('<div id="number-right" class="number">OK</div>'); setTimeout(function() { $('#number-right').addClass('animate'); }, 0); }, 0);		
		clearMySequence();
		setTimeout(function() {
			$countdown.html('');
			self.increaseSequence(sequenceToMatch);
			self.playSequence(sequenceToMatch);
		}, 2000);
	}

	function buttonDown(event) {
		var pointerEvent = event.touches? event.touches[0] : event;
		$html.addClass('buttonDown');
		buttonState = 1;		
		Utils.eat(event);
		var x = Math.round(pointerEvent.clientX - $('#buttons').offset().left + $('body')[0].scrollLeft),
				y = Math.round(pointerEvent.clientY - $('#buttons').offset().top + $('body')[0].scrollTop);		
		var color = Polygons.inAnyPolygon(x, y, polygons);
		if (color) {
			if (state != State.playing && color != 'blue') return;
			chosenColor = color;
			$buttons.removeClass().addClass(color + '-down');
		}
	}

	// when moving around
	function move(event) {
		if (state != State.playing) return;
		if (buttonState == 0) 
			return;
		var pointerEvent = event.touches? event.touches[0] : event;
		Utils.eat(event);
		var x = Math.round(pointerEvent.clientX - $('#buttons').offset().left + $('body')[0].scrollLeft),
				y = Math.round(pointerEvent.clientY - $('#buttons').offset().top + $('body')[0].scrollTop);		
		var color = Polygons.inAnyPolygon(x, y, polygons);
		chosenColor = color;
		if (color) {
			$buttons.removeClass().addClass(color + '-down');
		}
	}

	function buttonUp(event) {
		Utils.eat(event);
		$html.removeClass('buttonDown');		
		$buttons.removeClass();
		buttonState = 0;

		if (state != State.playing && chosenColor != 'blue') return;

		if (state == State.waiting_for_new_game && chosenColor == 'blue')
			self.startNewGame();
		else if (state == State.playing) {
			playColor(chosenColor);
			addToMySequence(chosenColor);
		}
	}

	function playColor(color, isSequence) {
		if (Settings.enableHUE && isSequence) {
			console.log(color);
			if (color=="red") hue.flashAll(1);
			else if (color=="green") hue.flashAll(2);
			else if (color=="yellow") hue.flashAll(3);
			else if (color=="blue") hue.flashAll(4);
		}
		console.log(color, isSequence)
		Sound.play(color);
	}

	// creates a color array with given length, such as ['R','G','G','B','Y']
	var createSequence = this.createSequence = function(sequenceLength) {
		var colors = ['R', 'G', 'B', 'Y'];
		var sequence = [];
		for (var i=0; i<sequenceLength; i++) {
			var color = Utils.pick(colors);
			sequence.push(color);
		}
		sequenceToMatch = sequence;
		updateLevel();
		return sequence;
	}

	this.increaseSequence = function(sequence) {
		var colors = ['R', 'G', 'B', 'Y'];
		var color = Utils.pick(colors);
		sequence.push(color);
		sequenceToMatch = sequence;
		updateLevel();
		return sequence;
	}

	function updateLevel() {
		$('#level').text('CHAIN ' + sequenceToMatch.length);
	}


	this.playSequence = function(sequence) {		
		// if no sequence given, use default sequenceLength
		if (!sequence)
			sequence = Settings.defaultSequenceLength;
		if (typeof(sequence) == 'number')
			sequence = this.createSequence(sequence);

		sequenceToMatch = sequence;

		$html.addClass('hideColors').removeClass('waiting-for-new-game');
		state = State.playing_sequence;
		var current = 0, colorShown = false, color = '';
		$html.addClass('hideColors');
		setTimeout(playNext, Settings.sequenceColorDelay);		


		function playNext() {			
			if (colorShown) {
				hideColor();
				colorShown = false;
				current++;
				if (current < sequence.length)
					setTimeout(playNext, Settings.sequenceColorDelay);
				else 
					setTimeout(self.endSequence, Settings.sequenceColorDelay);					
			}
			else {
				colorShown = true;
				color = sequence[current];
				showColor();
				setTimeout(playNext, Settings.sequenceColorShownTime);
			}			
		}

		function showColor() {
			$html.addClass('showColor-' + color);
			switch(color) {
				case 'R':
					playColor('red', true);
					break;
				case 'G':
					playColor('green', true);
					break;
				case 'B':
					playColor('blue', true);
					break;
				case 'Y':
					playColor('yellow', true);
					break;
			}			
		}

		function hideColor() {
			$html.removeClass('showColor-' + color);
		}
	}

	this.endSequence = function() {
		$html.removeClass('hideColors');
		state = State.playing;
		clearMySequence();
	}

	this.startNewGame = function() {
		$html.addClass('hideColors').removeClass('waiting-for-new-game');
		self.countDown();		
	}

	this.countDown = function() {
		if (state == State.counting_down)	return;
		state = State.counting_down;
		$countdown.html('')
		setTimeout(function() { $countdown.append('<div id="number3" class="number">3</div>'); setTimeout(function() { $('#number3').addClass('animate'); }, 0); }, 0);		
		setTimeout(function() { $countdown.append('<div id="number2" class="number">2</div>'); setTimeout(function() { $('#number2').addClass('animate'); }, 0); }, 1200);
		setTimeout(function() { $countdown.append('<div id="number1" class="number">1</div>'); setTimeout(function() { $('#number1').addClass('animate'); }, 0); }, 2400);		
		setTimeout(finishedCountDown, 3800);		
	}

	function finishedCountDown() {
		$countdown.html(''); 
		self.playSequence();
	}
})();


/*
// polygon creation code
var poly = [];
$('#buttons').bind('click', function(event) {
	var x = Math.round(event.clientX - $('#buttons').offset().left + $('body')[0].scrollLeft),
			y = Math.round(event.clientY - $('#buttons').offset().top + $('body')[0].scrollTop);
	poly.push(x, y);
	console.log(poly);
});
*/

$(function() {
	Sound.init();
	Sergey.start();
})