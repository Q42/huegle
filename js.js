var BRIDGE_IP = Settings.bridgeIP;
var USERNAME = Settings.bridgeKey;

bindButton('#allOff', 'PUT', USERNAME + '/groups/0/action', { on: false });
bindButton('#brightnessLow', 'PUT', USERNAME + '/groups/0/action', { on:true, bri: 10, transitiontime: 2});
bindButton('#brightnessFull', 'PUT', USERNAME + '/groups/0/action', { on: true, bri: 255, transitiontime: 2});
bindButton('#blink', 'PUT', USERNAME + '/groups/0/action', { on: true, alert: 'select' });
bindButton('#blinkmore', 'PUT', USERNAME + '/groups/0/action', { on: true, alert: 'lselect' });
bindButton('#colorloop', 'PUT', USERNAME + '/groups/0/action', { on: true, effect: 'colorloop' });
bindButton('#stopEffect', 'PUT', USERNAME + '/groups/0/action', { on: false, effect: 'none' });
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

var timeOutVar;

$('#knightrider').on('click', function() {


  var lights = [];
  for (i = 1; i < 7*7; i++) {
    lights[lights.length] = i;
  }

  console.log("knightrider");
  var reverseOrderLights = [];
  for (i = 1; i < 7*7; i++) {
    reverseOrderLights[lights.length] = 50 - i;
  }

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


$('#boing').on('click', function() {
  var lights = [];
  for (i = 1; i < 7*7; i++) {
    lights[lights.length] = i;
  }

  function f() {
    if (lights.length) {
      send('PUT', USERNAME + '/lights/' + lights.shift() + '/state', { alert: 'select' })
        .then(function() { Utils.sleep(200); f(); });
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