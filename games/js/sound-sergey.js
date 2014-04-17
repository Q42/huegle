var Sound = (function(){
  var public = {};

  var enabled = false;

  var effects = {
    'red': { channels: 4, current: 0, channel: [] },
    'blue': { channels: 4, current: 0, channel: [] },
    'green': { channels: 4, current: 0, channel: [] },
    'yellow': { channels: 4, current: 0, channel: [] },
    'switch': { channels: 4, current: 0, channel: [] }
  };

  public.init = function() {
    enabled = true;
    var arr = [];
    for (var name in effects) {
      arr.push(name)
      //effects[name] = new Media('/sound/' + name + '.wav');
    }
    toNative('prepareSound', arr.join(','));
  }

  public.play = function (name) {
    if (!enabled) return;
    console.log("playing sound " + name);
    toNative('playSound', name);
  };

  return public;
})();