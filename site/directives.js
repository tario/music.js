var musicShowCaseApp = angular.module("MusicShowCaseApp");

musicShowCaseApp.directive("musicObjectEditor", ["$timeout", "$http", "TypeService", function($timeout, $http, TypeService) {
  return {
    scope: {
      file: "=file"
    },
    templateUrl: "site/templates/objectEditor.html",
    link: function(scope, element, attrs) {
      var file;
      var types = TypeService.getTypes();

      scope.parameters = [];
      scope.range = function(init, end) {
        var x = [];
        for (var i=init;i<=end;i++) {
          x.push(i);
        }
        return x;
      };

      var truthy = function(x ) { return x; };
      var updateObject = function(newValue) {
        $timeout(function() {
          if (scope.file && scope.file.changed) scope.file.changed();
        });
      };

      var updateTemplate = function(file) {
        if (!file) return;

        types.then(function() {
          $timeout(function() {
            scope.selectedType = file.type;

            TypeService.getType(file.type, function(type) {
              $timeout(function() {
                scope.templateUrl = type.templateUrl;
                scope.type = type;

                for (var k in type._default) {
                  if (typeof file.data[k] === "undefined") {
                    file.data[k] =type._default[k];
                  }
                }

                if (type.parameters) {
                  scope.parameters = type.parameters.map(function(parameter) {
                    return {
                      name: parameter.name,
                      data: parameter,
                      value: file.data && typeof file.data[parameter.name] !== "undefined" ? file.data[parameter.name] : parameter.value
                    };
                  });
                }
                if (type.components) {
                  scope.modulations = (type.components||[]).map(function(component) {
                    return {
                      name: component,
                      value: {
                        type: "stack",
                        data: {
                          array: []
                        }
                      }
                    };
                  });
                }

                updateObject(file.data);
              });
            });
          });
        });
      };
      if (scope.file) updateTemplate(scope.file);

      types.then(function(types) {
        scope.types = types;
      });
      
      var changeType = function(newValue) {
        if (!newValue) return;
        if (!scope.file) return;
        scope.file.type = newValue;
        updateTemplate(scope.file);
      };

      scope.$watch("modulations", function(newValue) {
        if (!scope.modulations) return;
        scope.file.data.modulation = scope.file.data.modulation||{};
        scope.modulations.forEach(function(modulation) {
          scope.file.data.modulation[modulation.name] = modulation.value;
        }); 
        scope.$emit("objectChanged");
      }, true);

      scope.$watch("parameters", function(newValue) {
        if (!scope.parameters) return;
        scope.parameters.forEach(function(parameter) {
          scope.file.data[parameter.data.name] = parameter.value;
        }); 
        scope.$emit("objectChanged");
      }, true);
      scope.$watch("selectedType", changeType)
      scope.$watch("file", updateTemplate);
      //scope.$watch("file.data", fn.debounce(function(newValue) { debugger; },800), true);
    }
  };
}]);

musicShowCaseApp.directive("arrayEditor", ["$timeout", function($timeout) {
  return {
    scope: {
      collection: "=collection"
    },
    templateUrl: "site/templates/arrayEditor.html",
    link: function(scope, element, attrs) {
      scope.collection.objects=scope.collection.objects||[];
      scope.maxElements = attrs.maxelements ? parseInt(attrs.maxelements) : Infinity;

      var addObject = function(newObject) {
        $timeout(function() {
          scope.collection.objects=scope.collection.objects||[];
          scope.collection.objects.push(newObject);
        });
      };

      if (attrs.minelements) {
        for (var i=0; i<parseInt(attrs.minelements); i++) {
          addObject({name: "New Object", type: attrs.defaulttype || "null"});
        }
      }

      scope.addObject = function() {
        addObject({name: "New Object", type: attrs.defaulttype || "null"})
      };
    }
  };
}]);

musicShowCaseApp.directive("musicStack", ["$timeout", function($timeout) {
  return {
    scope: {
      initFile: "=initFile"
    },
    templateUrl: "site/templates/stack.html",
    link: function(scope, element, attrs) {
      var swap = function(idx1, idx2) {
        $timeout(function() {
          var tmp = scope.file.array[idx1];
          scope.file.array[idx1] = scope.file.array[idx2];
          scope.file.array[idx2] = tmp;
        });
      };

      scope.onDropComplete = function(data, event) {
        if (data.type === "fx") {
          scope.file.array = [{
            type: data.name,
            data: {}
          }].concat(scope.file.array);
        }
      };

      scope.up = function(idx) {
        swap(idx-1, idx);
      };

      scope.down = function(idx) {
        swap(idx+1, idx);
      };

      scope.remove = function(idx) {
        $timeout(function() {
          var oldCollection = scope.file.array;
          scope.file.array = [];
          for (var i=0; i<oldCollection.length; i++) {
            if (i!==idx) scope.file.array.push(oldCollection[i]);
          }
        });
      };

      scope.add = function() {
        $timeout(function() {
          scope.file.array.push({data: {}, type: "null"});
        });
      };

      scope.$watch("initFile", function(newFile) {
        if (newFile) {
          scope.file = newFile.data;
        }
      });
    }
  };  

}]);

musicShowCaseApp.directive("keyboard", ["$timeout", function($timeout) {
  return {
    scope: {
      instrument: '=instrument'
    },
    templateUrl: "site/templates/keyboard.html",
    link: function(scope, element, attrs) {
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

      scope.stopAll = function() {
        scope.octaves.forEach(stopAll);
      };

      var octave = function(base) {
        return {
          mouse: {},
          key: {},
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
              if (this.mouse[idx] || this.key[idx]) {
                this.play(idx);
              } else {
                this.stop(idx);
              }
            }
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
