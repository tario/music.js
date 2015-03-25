var musicShowCaseApp = angular.module("MusicShowCaseApp", ['ui.codemirror', 'ngRoute']);
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
        music.dispose();
      }
      music = new MUSIC.Context();

      return f(music);

    },

    run: function(code) {
      var instrumentsArray = [];
      var playablesArray = [];

      var instruments = {
        add: function(name, inst) {
          instrumentsArray.push({name: name, instrument: MUSIC.Types.cast("instrument", inst)});
        }
      };

      var playables = {
        add: function(name, playable) {
          playablesArray.push({name: name, playable: playable, recordable: new Recordable(music, playable, name)});
        }
      };

      if (music) {
        music.dispose();
      }
      music = new MUSIC.Context();

      try {
        eval(code);
        return {instruments: instrumentsArray, playables: playablesArray};
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
        name: instrument.name,
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
          var note = instrument.instrument.note(MUSIC.noteToNoteNum(noteName)+36);
          if (note == undefined) return;
          notes[keyCode] = note.play();
        }
      };
    }
  };
});

musicShowCaseApp.service("TypeService", function($http, $q) {

  var getTypes = function() {
      return $http.get("typeList.json").then(function(r) {
        return r.data;
      });
  };

  return {
    getTypes: getTypes
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
