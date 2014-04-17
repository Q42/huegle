window.Home = new (function(){

	stopBackgroundLights = false,

	this.start = function() {
		if (document.location.hash == '#back')
			$('#games').addClass('no-animations');
		$('body').addClass('show');
		document.location.hash = '';
		$('#games').removeClass('no-animations');

		var self = this;

		//if (Settings.enableHUE) window.setTimeout('Home.colorloopStart()', 5000);

		if (Settings.enableHUE) window.setTimeout('Home.colorloopStart(1)', 5000);
	},


	this.colorloopStart = function() {
		var showDark = Math.random() > 0.75;

		if (showDark)
			hue.turnOffAll(); 
		else 
			hue.turnOnAll();

		stopBackgroundLights = false;

		
		hue.setAllColors(colorDict.red, 1);
		Utils.sleep(200);
		hue.setAllColors(colorDict.green, 2);
		Utils.sleep(200);
		hue.setAllColors(colorDict.yellow, 3);
		Utils.sleep(200);
		hue.setAllColors(colorDict.blue, 4);

		Utils.sleep(200);

		if (!showDark) {
			hue.turnOff(1);
			hue.turnOff(7);
			hue.turnOff(49);
			hue.turnOff(43);
		}

		window.setTimeout('Home.colorloopStart2()', 2000);
	},

	this.colorloopStart2 = function() {
		//hue.turnOnAll();
		Utils.sleep(1000);

		//hue.setAllColors('ff0000', 0);

			
        window.setTimeout('Home.colorloopStep(1)', 1000);
	},

	this.colorloopStep = function(step) {
		if (stopBackgroundLights) {
			// stop!
			hue.turnOffAll();
			return;
		}

		if (step==1) {
			setTimeout('hue.groupColorLoop(1);', 2000);
			setTimeout('hue.groupColorLoop(2);', 4000);
			setTimeout('hue.groupColorLoop(3);', 6000);
			setTimeout('hue.groupColorLoop(4);', 8000);
		}

		if (step % 30==0) {
			hue.flashAll(0);
		}
		else {
			// star sparkle
			var lamp = Math.floor(Math.random()*49 + 1);
			if (lamp<1) lamp =1;
			if (lamp>49) lamp = 49;
			hue.flash(lamp);
		}

		var startGlow = Math.random() > 0.90;

		if (startGlow) {
			window.setTimeout('Home.glowStep(1)', 1000);
		} else {
			window.setTimeout('Home.colorloopStep(' + (step+1) + ')', 1000);
		}
	},

	this.glowStep = function (step) {
		if (step==1) {
			hue.turnOnAll();
			hue.turnOff(1);
			hue.turnOff(7);
			hue.turnOff(49);
			hue.turnOff(43);
		}

		if (step>8) {
			// back to colorloop
			hue.setAllBrightness(Settings.defaultBrightness);
		
			window.setTimeout('Home.colorloopStep(1)', 1000);
			return;
		}

		var bri = 1;
		if (step % 2==0) bri = 255;
		hue.setAllBrightness(bri, 40);
		
		window.setTimeout('Home.glowStep('+(step+1)+')', 5000);
	}
})();

$(function() {
	Home.start();
})