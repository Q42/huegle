window.Page = new (function(){

	var self = this;
	var touch = 'ontouchstart' in document.documentElement,
			$html, $body,
			selectedColorIndex,
			touchState = 0,
			hex = '0123456789ABCDEF',
			pixelState = {};

	var colors = {
		'0': '#000000', // black
		'1': '#EEEEEE', // white
		'2': '#8126C0', // purple
		'3': '#2A4BD7', // blue
		'4': '#EE2A2A', // red
		'5': '#814A19', // brown
		'6': '#8CD600', // green

		'7': '#F139A1', // pink
		'8': '#FFEE33' // yellow DONKERDER?
		//'9': '#000000'// extra kleur, nog kiezen
	};

	var hueColors = {
		'0': '000000', // black
		'1': 'EEEEEE', // white
		'2': '8126C0', // purple
		'3': '2A4BD7', // blue
		'4': 'EE2A2A', // red
		'5': '814A19', // brown
		'6': '00ff00', // green
		'7': 'F139A1', // pink
		'8': 'FFEE33' // yellow
		//'9': '000000'
	};

	var hueLampOn = new Array(50);

	// start the game
	this.start = function() {
		// cache elements
		$html = $('html'),
		$body = $('body'),
		$pixels = $('#pixels');

		resize();
		$(window).bind('resize', resize);		

		drawPixelGrid();
		setAllPixelsToDefaultColor(0);
		drawColors();
		createColorCss();
		selectColor(1);

		if (Settings.enableHUE) hue.setAllBrightness(Settings.defaultBrightness);

		prepareHueLamps();

		//loadState("2020040202040420204042220404020040402004040200040");

		//$html.addClass('waiting-for-new-game');

		$(document).on('mousedown touchstart', '.color', clickColor)
		$pixels.bind('mousedown touchstart', pixelDown);
		$(document).on('mousemove touchmove', 'html', move);
		$(document).on('mouseup touchend', 'html.pixelDown', pixelUp);
		$('#done').bind('click', pressDone);
		$('#clear').bind('click', pressClear);
		$('#flash').bind('click', pressFlash);
			
	};

	function resize() {
		//var top = Math.max(0, Math.round($(window).height() / 2 - $('#gameboard').height()/2));
		//top = Math.max(45, top);
		//$gameboard.css('top', top + 'px');
	}

	function drawPixelGrid() {
		var html = '';
		for (var y=0; y<7; y++) {
			for (var x=0; x<7; x++) {
				html += '<div data-x="'+x+'" data-y="'+y+'" id="pixel-'+x+'-'+y+'" class="pixel"></div>';
			}
			if (y <= 5)
				html += '<br/>';
		}
		$('#pixels').html(html);
	}

	function setAllPixelsToDefaultColor(colorIndex) {
		if (typeof(colorIndex) != 'number') 
			colorIndex = 1;
		for (var y=0; y<7; y++)
			for (var x=0; x<7; x++)
				applyColor(x, y, colorIndex, true);
	}

	function drawColors() {
		var html = '';
		for (var color=0; color<9; color++) {
			html += '<div data-color="'+color+'" id="color-'+color+'" class="color"></div>';
			if (color == 4)
				html += '<br/>';
		}
		$('#colors').html(html);
	}

	function createColorCss() {
		var css = '';
		for (var color in colors) {
			css += '#color-' + color + ' { background-color: ' + colors[color] + '; }';
		}
		$('head').append('<style>' + css + '</style>');
	}

	function selectColor(colorNr) {
		$('.color').removeClass('selected');
		$('#color-' + colorNr).addClass('selected');
		selectedColorIndex = colorNr;
	}

	function clickColor(event) {
		Utils.eat(event);
		var colorNr = $(event.target || event.srcElement).closest('.color').attr('data-color') * 1;
		selectColor(colorNr);
	}

	function pixelDown(event) {
		var pointerEvent = event.touches? event.touches[0] : event;
		$html.addClass('pixelDown');
		touchState = 1;		
		Utils.eat(event);
		var $pixel = $(event.target || event.srcElement).closest('.pixel');
		if (!$pixel.length) return;
		var x = $pixel.attr('data-x'),
				y = $pixel.attr('data-y');

		var currentColor = getColor(x, y) * 1;
		var color = selectedColorIndex;

		//if (currentColor == color) color = 0; // toggle!

		applyColor(x, y, color);


		showPixels(false);
		
		setTimeout(function() { showPixels(true); }, 500);
	}

	function showPixels(show) {
		if (show)
			$('#waitlayer').hide(); 
		else 
			$('#waitlayer').show();
	}

	// when moving around
	function move(event) {
		if (touchState == 0) return;
		var $pixel = $(event.target || event.srcElement).closest('.pixel');
		if (!$pixel.length) return;
		var x = $pixel.attr('data-x'),
				y = $pixel.attr('data-y'),
				stateId = x + '-' + y;

		var currentPixelColor = pixelState[stateId];
		if (!currentPixelColor || currentPixelColor != selectedColorIndex) {
			applyColor(x, y, selectedColorIndex);
		}
	}

	function pixelUp(event) {
		Utils.eat(event);
		$html.removeClass('pixelDown');		
		touchState = 0;		
	}

	function applyColor(x, y, colorIndex, ignoreHue) {
		stateId = x + '-' + y;
		pixelState[stateId] = colorIndex
		var color = colors[colorIndex];
		var $pixel = $('#pixel-' + x + '-' + y);
		$pixel.css('background-color', color).attr('data-color', colorIndex);

		var sendToHue = !ignoreHue && Settings.enableHUE;

		var lampNr = (x*1 + y*7) + 1;
		var hueColor = hueColors[colorIndex];
		//console.log("setting lamp " + lampNr + " to color " + hueColor);
		if (hueColor == '000000') {
			// turn off
		  if (sendToHue) {
		  	hue.turnOff(lampNr);
		  	hueLampOn[lampNr] = false;
		  }
		} else {
		  if (sendToHue) {
		  		var waiting = 0;
		  		hue.setColorAndState(lampNr, hueColor, true);

		  		// now, re-do is some time later to avoid misses
		  		setTimeout(function() {
		  			hue.setColor(lampNr, hueColor);
		  		}, 2000);
		  		
		  		if (!hueLampOn[lampNr]) {
		  			hueLampOn[lampNr] = true;
		  		}
			}
		}
		

	}

	var getColor = this.getColor = function(x, y) {
		var $pixel = $('#pixel-' + x + '-' + y);
		var color = $pixel.attr('data-color');
		return color;
	}

	var getState = this.getState = function() {
		var state = '';
		for (var y=0; y<7; y++) {
			for (var x=0; x<7; x++) {
				var color = getColor(x, y) * 1;
				var hexColor = hex.substr(color, 1);
				state += hexColor;
			}
		}
		return state;
	}

	var loadState = this.loadState = function(state) {
		for (var y=0; y<7; y++) {
			for (var x=0; x<7; x++) {
				var i = y * 7 + x;
				var hexColor = state.substr(i, 1);
				var color = hex.indexOf(hexColor);
				applyColor(x, y, color);
			}
		}
	}

	// Hue lamps logic
	function prepareHueLamps() {
		
		if (!Settings.enableHUE) return; // debug setting for Martin

		hue.turnOffAll();
		hue.setAllBrightness(hue.defaultBrightness);
		//hue.setAllColors('ff0000');
	}

	function sleep(ms) {
		//alert(0);
	}

	function pressClear(event) {
		
		if (Settings.enableHUE) {
			hue.setAllColors('000000');
			hue.turnOffAll();
		}

		setAllPixelsToDefaultColor(0);

		return Utils.eat(event);
	}

	function pressDone(event) {
		Utils.eat(event);
		
		$('#waitlayer').show();

		//setTimeout(function() { saveDrawing("");}, 0);
		document.location.href = 'index.html#back';

		return false;
	}

	function pressFlash(event) {
		
		hue.flashAll(0);

		return Utils.eat(event);
	}

	function saveDrawing(name) {
		var state = getState();
		$.post('http://q42huegame.appspot.com/drawings', {apikey:'googlehuegame007yeah', name:"", drawing:state}, function() {
			document.location.href = 'index.html#back';
		});
	}

})();


$(function() {
	Page.start();
})