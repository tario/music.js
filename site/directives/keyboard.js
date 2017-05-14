var musicShowCaseApp = angular.module("MusicShowCaseApp");
musicShowCaseApp.directive("keyboard", ["$timeout", "$uibModal", "Midi", function($timeout, $uibModal, Midi) {
  return {
    scope: {
      instrument: '=instrument'
    },
    templateUrl: "site/templates/keyboard.html",
    link: function(scope, element, attrs) {
      var inputs;
      var onMIDIMessage = function(event) {
        var command = event.data[0];
        var value = event.data[1];
        var velocity = event.data[2];

        var octaveNumber = Math.floor((value-36)/12);
        if (octaveNumber < 0) return;

        var oct = scope.octaves[octaveNumber];
        if (!oct) return;

        if (command === 144) {
          oct.midi[value % 12] = true;
          oct.update();
        } else if (command === 128) {
          oct.midi[value % 12] = false;
          oct.update();
        }
      };
      var listener = Midi.registerEventListener(onMIDIMessage);
      var updateMidiStatus = function() {
        Midi.getStatus()
          .then(function(data) {
            $timeout(function() {
              scope.midiConnected = data.connected;
            });
          });
      };

      updateMidiStatus();

      scope.$on("$destroy", function() {
        listener.destroy();
      });

      var keyCodeToNote = {
              90: 'C', 83: 'C#', 88: 'D',  68: 'D#', 67: 'E',
              86: 'F', 71: 'F#', 66: 'G', 72: 'G#', 78: 'A', 
              74: 'A#', 77: 'B'};

      var stopAll = function(x) {
        return x.stopAll();
      };

      var update = function(octave) {
        return octave.update();
      };

      scope.midiSetup = function() {
        var modalIns = $uibModal.open({
          templateUrl: "site/templates/modal/midiSettings.html",
          controller: "midiSettingsModalCtrl"
        }).result.then(updateMidiStatus);
      };

      scope.stopAll = function() {
        scope.octaves.forEach(stopAll);
      };

      var octave = function(base) {
        return {
          mouse: {},
          key: {},
          midi: {},
          note: [],
          play: function(idx) {
            if (this.note[idx]) return;

            this.note[idx] = scope.instrument.note(base+idx).play();
          },
          stop: function(idx) {
            if (!this.note[idx])return;
            this.note[idx].stop();
            this.note[idx] = undefined;
          },
          update: function() {
            for (var idx=0; idx<12; idx++) {
              if (this.mouse[idx] || this.key[idx] || this.midi[idx]) {
                this.play(idx);
              } else {
                this.stop(idx);
              }
            }

            $timeout(function(){});
          },
          stopAll: function() {
            this.note.forEach(function(note) {
              if(note && note.stop) note.stop();
            });
            this.note = [];
          }
        };
      };

      var mouseOff = function(octave) {
        octave.mouse = {};
        octave.update();
      };

      scope.mouseLeave = function(octave, idx) {
        octave.mouse[idx] = false;

        octave.update();
      };

      scope.mouseEnter = function(octave, idx) {
        scope.octaves.forEach(mouseOff);
        octave.mouse[idx] = true;

        scope.octaves.forEach(update);
      };

      var keyDownHandler = function(e) {
        if (document.activeElement.tagName.toLowerCase() === "input") return;

        var keyCode = e.keyCode;
        var noteName = keyCodeToNote[keyCode];
        if (!noteName) return;

        var idx = MUSIC.noteToNoteNum(noteName);
        scope.octaves[1].key[idx] = true;
        scope.octaves[1].update();

        scope.$digest();
      }

      var keyUpHandler = function(e) {
        var keyCode = e.keyCode;
        var noteName = keyCodeToNote[keyCode];
        if (!noteName) return;

        var idx = MUSIC.noteToNoteNum(noteName);
        scope.octaves[1].key[idx] = false;
        scope.octaves[1].update();

        scope.$digest();
      }

      $(document).bind("keydown", keyDownHandler);
      $(document).bind("keyup", keyUpHandler);

      scope.$on("$destroy", function() {
        $(document).unbind("keydown", keyDownHandler);
        $(document).unbind("keyup", keyUpHandler);
        scope.octaves.forEach(function(octave) {
          octave.stopAll();
        });
      });

      scope.octaves = [24,36,48,60,72].map(octave);
      scope.$watch("instrument", function(instrument) {
        scope.instrument = instrument;
      });
    }
  };

}]);
