var musicJs = angular.module("MusicShowCaseApp");
musicJs.factory("Midi", ['$q', 'Sync', '_localforage', function($q, Sync, localforage) {
  var setupStore = new Sync();
  var storeInputEnabled = setupStore.sync(function(inputId, enabled) {
    return localforage.getItem("midiSetup")
      .then(function(midiSetup) {
        midiSetup = midiSetup || {};
        midiSetup.inputs = midiSetup.inputs || {};
        midiSetup.inputs[inputId] = enabled;

        return localforage.setItem("midiSetup", midiSetup);
      });
  });

  var midiAccessRequested;
  if (navigator.requestMIDIAccess) {
      midiAccessRequested = navigator.requestMIDIAccess({ sysex: false });
  }

  var wrapInput = function(input) {
    var enable = function() {
      input.onmidimessage = onMIDIMessage;
      input.enabled = true;

      storeInputEnabled(input.id, true);
    };

    var disable = function() {
      input.onmidimessage = null;
      input.enabled = false;

      storeInputEnabled(input.id, false);
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
      name: input.name,
      id: input.id
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

  $q.all({
    inputs: getInputs(),
    midiSetup: localforage.getItem("midiSetup")
  }).then(function(result) {
    var midiSetup = result.midiSetup;

    if (midiSetup && midiSetup.inputs) {
      result.inputs.forEach(function(input) {
        if (midiSetup.inputs[input.id]) {
          input.enable();
        }
      });
    }
  });

  return {
    getInputs: getInputs,
    registerEventListener: registerEventListener,
    getStatus: getStatus
  };
}]);
