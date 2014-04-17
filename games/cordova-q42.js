// Q42 boot loader ROM version 4.2
$(function() {

  window.QUIkey = window.QUIkey || {};

  // simple bool for preventing window.location setting to qui:// protocol on desktop chrome
  var isAndroid = /android/.test(navigator.userAgent.toLowerCase());

  window.toNative = function(str, paramStr) {
    if (!isAndroid) return;
    url = 'qui://cmd=' + str + '&params=' + paramStr;
    window.location = url; 
  }

  window.isOnAndroid = function() {
    return isAndroid;
  }

  window.detectLanguage = function(defaultLang) {
    var langDetected = window.QUIlocale;
    for (var langSupported in Strings)
      if (langDetected == langSupported)
        return langDetected;
    return defaultLang;
  };

  window.isUnlocked = function() {
    return window.QUIfullGameUnlocked == true;
  };

  window.unlockFullGame = function() {
    if (!isAndroid) return;
    window.location = 'qui://cmd=unlockFullGame';
  }

  window.QUIShakeDetected = function() {
  };

  window.QUIBackPressed = function() {
  };

  // tells the wrapper that the game wants to (and will) handle the back button
  window.claimBackButton = function() {
    if (!isAndroid) return;
    window.location = 'qui://cmd=setKeyValue&params=claimBackButton,1';
  };

  // release a claimed back button
  window.releaseBackButton = function() {
    if (!isAndroid) return;
    window.location = 'qui://cmd=setKeyValue&params=claimBackButton,0';
  };

  window.QUIGameUnlocked = function(unlocked, silent) {
    if (!isAndroid) return;
    window.QUIfullGameUnlocked = unlocked;
    if (unlocked)
      Quento.unlock(silent);
    else
      Quento.chicken();
  };

  window.muteEnable = function() {
    if (!isAndroid) return;
    window.location = 'qui://cmd=setKeyValue&params=mute,1';
    window.QUIkey['mute'] = '1';
  };

  window.muteDisable = function() {
    if (!isAndroid) return;
    window.location = 'qui://cmd=setKeyValue&params=mute,0';
    window.QUIkey['mute'] = '0';
  };

  window.isMute = function() {
    return (window.QUIkey['mute'] == '1');
  }

  window.loadRound = function(defaultRound) {
    var round = window.QUIkey['round'];
    if (round && (round * 1) > 0)
      return round;
    return defaultRound || 1;
  };

  window.saveRound = function(round) {
    if (!isAndroid) return;
    window.location = 'qui://cmd=setKeyValue&params=round,' + round;
    window.QUIkey['round'] = round;
  };

  window.loadColor = function(defaultColor) {
    var color = window.QUIkey['color'];
    if (color && color.length > 0 && color.indexOf('#') == 0)
      return color;
    return defaultColor || '#FFBF00';
  };

  window.saveColor = function(color) {
    if (!isAndroid) return;
    window.location = 'qui://cmd=setKeyValue&params=color,' + color;
    window.QUIkey['color'] = color;
  };

  window.saveState = function(state) {
    if (!isAndroid) return;
    window.location = 'qui://cmd=setKeyValue&params=state,' + state;
    window.QUIkey['state'] = state;
  };

  window.loadState = function() {
    var state = window.QUIkey['state'];
    if (state && state.length > 0 && state.substr(0,1) * 1 >= 0)
      return state;
    return null;
  };

});