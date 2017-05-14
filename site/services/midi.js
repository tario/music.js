var musicJs = angular.module("MusicShowCaseApp");
musicJs.factory("Midi", ['$q', function($q) {
  var midiAccessRequested;
  if (navigator.requestMIDIAccess) {
      midiAccessRequested = navigator.requestMIDIAccess({ sysex: false });
  }

  var wrapInput = function(input) {
    var enable = function() {
      input.onmidimessage = onMIDIMessage;
      input.enabled = true;
    };

    var disable = function() {
      input.onmidimessage = null;
      input.enabled = false;
    };

    var update = function() {
      if (this.enabled) {
        enable()
      } else {
        disable();
      }
    };

    var ret = {
      enabled: !!input.onmidimessage,
      enable: enable,
      disable: disable,
      update: update,
      name: input.name
    };

    return ret;
  };

  var getStatus = function() {
    return midiAccessRequested
      .then(function(midiAccess) {
        var data = {connected: false};
        var inputs = midiAccess.inputs.values();

        for (var input = inputs.next(); input && !input.done; input = inputs.next()) {
          if (input.value.onmidimessage) {
            data.connected = true;
          }
        }
        return data;
      });
  };

  var getInputs = function() {
    return midiAccessRequested
      .then(function(midiAccess) {
        var retInputs = [];
        var inputs = midiAccess.inputs.values();

        for (var input = inputs.next(); input && !input.done; input = inputs.next()) {
            retInputs.push(wrapInput(input.value));
        }
        return retInputs;
      });
  };

  var eventListeners = [];
  var registerEventListener = function(callback) {
    var destroy = function() {
      eventListeners = eventListeners.filter(function(c) { return c !== callback; });
    };

    eventListeners.push(callback);

    return {
      destroy: destroy
    };
  };

  var onMIDIMessage = function(event) {
    eventListeners.forEach(function(callback) {
      callback(event);
    });
  };

  return {
    getInputs: getInputs,
    registerEventListener: registerEventListener,
    getStatus: getStatus
  };
}]);
