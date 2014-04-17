var BRIDGE_IP = '192.168.1.101';
var USERNAME = 'aValidUser';

bindButton('#allOn', 'PUT', USERNAME + '/groups/0/action', { on: true, bri:255 });
bindButton('#allOff', 'PUT', USERNAME + '/groups/0/action', { on: false });
bindButton('#brightnessLow', 'PUT', USERNAME + '/groups/0/action', { bri: 10 });
bindButton('#brightnessFull', 'PUT', USERNAME + '/groups/0/action', { bri: 255 , transitiontime: 2});
bindButton('#blink', 'PUT', USERNAME + '/groups/0/action', { alert: 'select' });
bindButton('#blinkmore', 'PUT', USERNAME + '/groups/0/action', { alert: 'lselect' });
// bindButton('#colorloop', 'PUT', USERNAME + '/groups/0/action', { effect: 'colorloop' });
bindButton('#stopEffect', 'PUT', USERNAME + '/groups/0/action', { effect: 'none' });
bindButton('#getFullConfig', 'GET', USERNAME);

function bindButton(selector, type, resource, body) {
  $(selector).on('click', function() {
    console.log(selector);
    send(type, resource, body);
  });
}

function send(type, resource, body) {
  return $.ajax({
    url: 'http://' + BRIDGE_IP + '/api/' + resource,
    type: type,        
    data: JSON.stringify(body),
    success: function(data, textStatus, jqXHR) {
      //$('#output').text(JSON.stringify(data, null, 4));
    },
    error: function(jqXHR, textStatus, errorThrown) {
      $('#output').text(textStatus + errorThrown);
    }
  });
}

$('#colorloop').on('click', function() {
  var lights = [4,3,5,2,1,8,6,7];

  function f() {
    if (lights.length) {
      send('PUT', USERNAME + '/lights/' + lights.shift() + '/state', { effect: 'colorloop' , on: true}).then(function() { 
        setTimeout(f, 500); 
      });
    }
  }
  f();
});

var timeOutVar;

$('#knightrider').on('click', function() {
  var lights = [4,3,5,2,1,8,6,7];
  console.log("knightrider");
  var reverseOrderLights = [7,6,8,1,2,5,3,4];
  var previousLight;
  var lightBeforePreviousLight;
  var lightsToUse = lights.slice(0);

  var forward = true;
  function f() { // goes through the array of lights, setting them on and off
    var currentLight = lightsToUse.shift();

    if (lightsToUse.length === 0) {
      if (forward) { // lightsToUse is standard order array
        lightsToUse = reverseOrderLights.slice(0); // use reverse order array
        forward = false;
        console.log("Reversing");
      } else {
        lightsToUse = lights.slice(0);
        forward = true;
        console.log("Going forward again");
      }
    }

    // set light to red (hue 65280) with full brightness
    send('PUT', USERNAME + '/lights/' + currentLight + '/state', {on: true, hue: 65280, effect: "none", bri:255, sat:255, transitiontime: 2}).then(
      function() {
        if (previousLight !== undefined) {
          send('PUT', USERNAME + '/lights/' + previousLight + '/state', {on: false, transitiontime: 1}).then(
            function() {
              previousLight = currentLight;
              lightBeforePreviousLight = previousLight;
              timeOutVar = setTimeout(f, 200);
            });
          
            function setLightsOff() {
                if (lightBeforePreviousLight !== undefined) {
                  //send('PUT', USERNAME + '/lights/' + lightBeforePreviousLight + '/state', {on: false, transitiontime: 0});
                  console.log("the lightBeforePreviousLight is " + lightBeforePreviousLight);
                } else {
                  console.log("lightBefPrevLight is undefined");
                }
            }

            setTimeout(setLightsOff, 200);
        } else {
          previousLight = currentLight;
          lightBeforePreviousLight = previousLight;
          timeOutVar = setTimeout(f, 200);
        }
      }
    );
  }
  f();
});

$('#knightrideroff').on('click', function() {
  console.log("Knight Rider Off");
  send('PUT', USERNAME + '/groups/0/action', {on: false});
  clearInterval(timeOutVar);
});

$('#dutchflag').on('click', function() {
  var lights = [4,3,5,2,1,8,6,7];
  console.log("dutch flag");
  send('PUT', USERNAME + '/lights/' + lights[2] + '/state', {on: true, hue: 65280, bri:255, transitiontime: 10}); // red
  send('PUT', USERNAME + '/lights/' + lights[3] + '/state', {on: true, sat:0, bri:255, transitiontime: 20}); // white
  send('PUT', USERNAME + '/lights/' + lights[4] + '/state', {on: true, hue: 46920, bri: 255, transitiontime: 30}); // blue
});

var policeTimeoutVar;

$('#police').on('click', function() {
  var lights = [4,3,5,2,1,8,6,7];

  var shouldUseRedFlash = true;
  var hueNumber = 65280; // red
  function flash() {
    if (shouldUseRedFlash) {
      hueNumber = 65280;
    } else {   
      hueNumber = 46920 // blue
    }
    send('PUT', USERNAME + '/lights/1/state', {on: true, hue: hueNumber, transitiontime: 0}).then(
      function() {
        shouldUseRedFlash = !shouldUseRedFlash;
        console.log("setting lights to on with huenumber " + hueNumber + " at " + Math.round(+new Date()/100));
        policeTimeoutVar = setTimeout(flash, 50);
      });
    }
  flash();
});

$('#policeoff').on('click', function() {
  console.log("Police Off");
  send('PUT', USERNAME + '/groups/0/action', {on: false});
  clearInterval(policeTimeoutVar);
});

$('#boing').on('click', function() {
  var lights = [4,3,5,2,1,8,6,7];

  function f() {
    if (lights.length) {
      send('PUT', USERNAME + '/lights/' + lights.shift() + '/state', { alert: 'select' }).then(f);
    }
  }
  f();
});

var changecolorCounter = 0;
var changecolorColors = [[0.675,0.322],[0.542,0.420],[0.409,0.518],[0.421,0.181]];
$('#changecolor').on('click', function() {
  changecolorCounter++;
  if (changecolorCounter >= changecolorColors.length) {
    changecolorCounter = 0;
  }
  var xy = changecolorColors[changecolorCounter];
  send('PUT', USERNAME + '/groups/0/action', { on: true, xy: xy });
});