// vars BRIDGE_IP and USERNAME defined in js.js
var reachable = false;
var loggedin = false;

$(verifyLocalBridgeConnection);

function findLocalBridge() {
  $.get('http://www.meethue.com/api/nupnp').success(function(data) {
    if (data && data[0] && data[0].ipaddress) {
      BRIDGE_IP = data[0].ipaddress;
      verifyLocalBridgeConnection();
    } else {
      console.log('Darn, no bridge found here! Response: ', data);
    }
  });
}

function verifyLocalBridgeConnection() {
  $.ajax({ 
      url: 'http://' + BRIDGE_IP + '/api/' + USERNAME, 
      timeout: 3000
    })
    .success(function(data) {
      console.log("Bridge found on " + BRIDGE_IP);
      reachable = true;
      if (data.error) {
        // press button!
      } else {
        loggedin = true;
      }
    })
    .error(function(data) {
      console.log("Bridge not found locally on " + BRIDGE_IP);
      findLocalBridge();
    });
}