var musicShowCaseApp = angular.module("MusicShowCaseApp", ['ui.codemirror']);
musicShowCaseApp.service("MusicContext", function() {
  var music;

  return {
    run: function(code) {
      var instrumentsArray = [];
      var instruments = {
        add: function(name, inst) {
          instrumentsArray.push({name: name, instrument: inst});
        }
      };
      if (music) {
        music.dispose();
      }
      music = new MUSIC.Context();

      try {
        eval(code);
        return {instruments: instrumentsArray};
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
          var note = instrument.instrument.note(MUSIC.noteToNoteNum(noteName));
          if (note == undefined) return;
          notes[keyCode] = note.play();
        }
      };
    }
  };
});


musicShowCaseApp.service("CodeRepository", function($http, $q) {
  return {
    getDefault: function() {
      return $http.get("defaultCode.js").then(function(r) {
        return r.data;
      });
    },

    getExample: function(uri) {
      return $http.get(uri).then(function(r) {
        return r.data;
      });
    },

    getExampleList: function() {
      return $http.get("exampleList.json").then(function(r) {
        return r.data;
      });
    }
  };
});
