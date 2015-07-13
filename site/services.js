var musicShowCaseApp = angular.module("MusicShowCaseApp", ['ui.codemirror', 'ngRoute', 'ui.bootstrap']);
musicShowCaseApp.service("MusicContext", function() {
  var music;

  var Recordable = function(music, playable, name) {
    this._playable = playable;
    this._music = music;
    this._name = name;
  };

  Recordable.prototype.record = function() {
    var playable = this._playable;
    var recording = music.record();
    var recordFileName = this._name;
    var playing = playable.play();

    MUSIC.Utils.FunctionSeq.preciseTimeout(function(){
      recording.stop();
      recording.exportWAV(function(blob) {
        var a = document.createElement("a");
        document.body.appendChild(a);
        a.style = "display: none";

        var url  = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = recordFileName + ".wav";
        a.click();
        window.URL.revokeObjectURL(url);
      });
    }, playable.duration());
  };

  return {
    runFcn: function(f) {
      if (music) {
        music.prune();
      }
      music = new MUSIC.Context().sfxBase();

      return f(music);

    },

    run: function(code) {
      if (music) {
        music.prune();
      }
      music = new MUSIC.Context().sfxBase();

      try {
        return {object: eval("(function() {\n" + code + "\n})")()};
      } catch(e) {
        return {error: e.toString()};
      }
    }
  };
});

musicShowCaseApp.service("KeyboardFactory", function() {
  return {
    keyboard: function(instrument) {
      var notes = {};
      var keyCodeToNote = {
              90: 'C', 83: 'C#', 88: 'D',  68: 'D#', 67: 'E',
              86: 'F', 71: 'F#', 66: 'G', 72: 'G#', 78: 'A', 
              74: 'A#', 77: 'B'};

      return {
        name: "Keyboard",
        keyUp: function(keyCode) {
          var n = notes[keyCode];
          if (!n) return;
          notes[keyCode] = undefined;
          n.stop();
        },

        keyDown: function(keyCode) {
          var n = notes[keyCode];
          var noteName;
          if (n) return;

          noteName = keyCodeToNote[keyCode];
          
          // depends on music.js
          var note = instrument.note(MUSIC.noteToNoteNum(noteName)+36);
          if (note == undefined) return;
          notes[keyCode] = note.play();
        }
      };
    }
  };
});

musicShowCaseApp.service("TypeService", function($http, $q) {

  var plugins = ["core"];
  var types = [];
  var m = function(pluginName) {
    return {
      type: function(typeName, options, constructor) {
        types.push({
          templateUrl: "site/plugin/" + pluginName + "/" + options.template + ".html",
          parameters: options.parameters,
          constructor: constructor,
          name: typeName,
          composition: options.composition,
          description: options.description
        })
      }
    };
  };

  var loadPlugin = function(pluginName) {
    return $http.get("site/plugin/" + pluginName + "/index.js")
      .then(function(result) {
        var runnerCode = result.data;
        var module = {export: function(){}};
        eval(runnerCode);

        module.export(m(pluginName));
      });
  };

  var pluginsLoaded = $q.all(plugins.map(loadPlugin));

  var getTypes = function() {
      return pluginsLoaded.then(function() {
        return types;
      });
  };

  var getType = function(typeName, callback) {
    pluginsLoaded
      .then(function() {
        callback(types.filter(function(type) { return type.name === typeName; })[0]);
      });
  };

  return {
    getTypes: getTypes,
    getType: getType
  };

});

musicShowCaseApp.service("CodeRepository", function($http, $q) {
  return {
    getExample: function(uri) {
      return $http.get(uri).then(function(r) {
        return {
          type: "script",
          data: {
            code: r.data
          }
        };
      });
    },

    getExampleList: function() {
      return $http.get("exampleList.json").then(function(r) {
        return r.data;
      });
    }
  };
});

musicShowCaseApp.factory("pruneWrapper", function() {
  return function(fcn) {
    return function(music) {
      var sfxBase = music.sfxBase();
      var obj = fcn(sfxBase);
      obj.dispose = function() {
        sfxBase.prune();
      };
      return obj;
    };
  };
});

