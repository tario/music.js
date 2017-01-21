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

      scope.termschanged = function() {
        scope.$broadcast('termschanged');
      };

      scope.oscTermsUpdateFromWaveForm = fn.debounce(function(waveform, terms, resolution) {

        try {
          var waveform = eval("(function(t) { return " + waveform + "; })");
          var count = resolution;
          var values = new Array(count);
          for (var i = 0; i < count; i++) {
            values[i] = waveform(i/count);
            if (isNaN(values[i])) throw "Not a number: " + values[i];
          }

          var ft = new DFT(values.length);
          ft.forward(values);

          for (var i=0;i<count;i++) {
            terms.cos[i] = ft.real[i];
            terms.sin[i] = ft.imag[i];
          }
          terms.cos.length = ft.real.length/2;
          terms.sin.length = ft.imag.length/2;

          var f = function(t){
            var ret = 0;
            for (var i=1;i<count/2;i++) {
              var a = terms.sin[i];
              var b = terms.cos[i];

              ret = ret + a * Math.sin(t*2*Math.PI*i);
              ret = ret + b * Math.cos(t*2*Math.PI*i);
            }
            return ret;
          };

          var maxvalue = 0;
          var count = terms.sin.length;
          for (var i=0; i<count; i++) {
            var value = f(i/count);
            if (value>maxvalue) {
              maxvalue=value;
            } else if (value<-maxvalue) {
              maxvalue=-value;
            }
          }

          for (var i=0;i<count;i++) {
            terms.sin[i] = terms.sin[i] / maxvalue;
            terms.cos[i] = terms.cos[i] / maxvalue;
          }

          $timeout(function() {
            scope.invalidWaveform = false;
          });
          scope.$broadcast('termschanged');
        } catch (err) {
          $timeout(function() {
            scope.invalidWaveform = err.toString();
          });
        }

      },400);

      scope.oscTermsUpdate = fn.debounce(function(serie, terms, errVar) {

        try {
          var serie = eval("(function(n) { return " + serie + "; })");
          for (var n=1;n<512;n++) {
            terms[n]=serie(n);
            if (isNaN(terms[n])) throw "Not a number: " + terms[n];
  
          }
          scope[errVar] = false;
          $timeout(function() {
            scope.$broadcast('termschanged');
          });
        } catch (err) {
          $timeout(function() {
            scope[errVar] = err.toString();
          });
        }
      },400);

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
                      value: (file.data && file.data.modulation && file.data.modulation[component])|| {
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
        scope.modulations.forEach(function(modulation) {
          scope.file.data.modulation = scope.file.data.modulation||{};
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
      data: "=data"
    },
    templateUrl: "site/templates/arrayEditor.html",
    link: function(scope, element, attrs) {
      scope.data.subobjects=scope.data.subobjects||[];
      scope.maxElements = attrs.maxelements ? parseInt(attrs.maxelements) : Infinity;
      scope.currentTab = -1;

      var addObject = function(newObject) {
        $timeout(function() {
          scope.data.subobjects=scope.data.subobjects||[];
          scope.data.subobjects.push(newObject);
        });
      };

      scope.setCurrentTab = function(idx) {
        scope.currentTab = idx;
      };

      scope.removeObject = function(object) {
        scope.data.subobjects = scope.data.subobjects.filter(function(o) {return o !== object; });
      };

      scope.addObject = function() {
        addObject({data: {array: []}, type: "stack"})
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
        scope.$emit("stackChanged");

        $timeout(function() {
          var tmp = scope.file.array[idx1];
          scope.file.array[idx1] = scope.file.array[idx2];
          scope.file.array[idx2] = tmp;
        });
      };

      scope.onDropComplete = function(data, event) {
        scope.$emit("stackChanged");

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
        scope.$emit("stackChanged");

        $timeout(function() {
          var oldCollection = scope.file.array;
          scope.file.array = [];
          for (var i=0; i<oldCollection.length; i++) {
            if (i!==idx) scope.file.array.push(oldCollection[i]);
          }
        });
      };

      scope.add = function() {
        scope.$emit("stackChanged");

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

musicShowCaseApp.directive("customOscGraph", ["$timeout", function($timeout) {
  return {
    scope: {
      terms: "=terms"
    },
    template: '<canvas class="wavegraph"></canvas>',
    link: function(scope, element, attrs) {
      var f = function(t){
        var ret = 0;
        for (var i=1;i<scope.terms.sin.length;i++) {
          var a = scope.terms.sin[i];
          var b = scope.terms.cos[i];

          ret = ret + a * Math.sin(t*2*Math.PI*i);
          ret = ret + b * Math.cos(t*2*Math.PI*i);
        }
        return ret;
      };

      var redraw = function() {
        var canvas = element.children("canvas")[0];
        var context = canvas.getContext('2d');

        canvas.width = canvas.clientWidth/4;
        canvas.height = canvas.clientHeight/4;

        var drawLine = function(x0, y0, x1, y1, color) {
          context.save();
          context.beginPath();
          context.moveTo(x0, y0);
          context.lineTo(x1, y1);
          context.strokeStyle = color;
          context.lineWidth = 1;
          context.stroke();
          context.restore(); 
        };

        var drawFunc = function(color) {
          context.save();
          context.save();
          context.translate(0,canvas.height/2);
          context.scale(canvas.width,canvas.height/2);

          context.moveTo(0, -f(0)*0.8);
          for (var i=1; i<=64; i++) {
            var t = i/64;
            context.lineTo(t, -f(t)*0.8);
          }
          context.restore();
          context.lineJoin = 'round';
          context.lineWidth = 1;
          context.strokeStyle = color;
          context.stroke();
          context.restore();
        };

        drawLine(0, canvas.height/2, canvas.width, canvas.height/2, 'aqua');
        drawFunc("#FFF");


      };

      scope.$on("termschanged", fn.debounce(function() {
        redraw();
      },500));
    }
  };
}]);


musicShowCaseApp.directive("patternTrackCompactView", ["$timeout", "TICKS_PER_BEAT", function($timeout, TICKS_PER_BEAT) {
  return {
    scope: {
      /* Current pattern */
      pattern: "=pattern",
      /* Current track */
      track: "=track",
      /* Display params */
      zoomLevel: "=zoomLevel",
      beatWidth: "=beatWidth",
      /* File params (common to all tracks) */
      measure: "=measure",
      measureCount: "=measureCount"
    },
    templateUrl: "site/templates/directives/patternTrackCompactView.html",
    link: function(scope, element) {
      scope.TICKS_PER_BEAT = TICKS_PER_BEAT;
      var semitoneToNote = function(n) {
        return [0,[0,1], 1, [1,2], 2, 3, [3,4], 4, [4,5], 5, [5,6], 6][n%12];
      };
      var notation7 = function(n) {
        return ["C","D","E","F","G","A","B"][n % 7];
      };
      scope.noteName = function(n) {
        var note7 = semitoneToNote(n);

        if (Array.isArray(note7)) {
          note7 = note7[0]
          return notation7(note7)  + '#';
        } else {
          return notation7(note7);
        }
      };
      
      var updateGrid = function() {
        scope.mainGridStyle = {
          "background-size": (scope.measure*scope.beatWidth*scope.zoomLevel) + "px 240px",
          "background-position": -scope.pattern.scrollLeft + "px"
        };
      };
      scope.$watch("[measure, beatWidth, zoomLevel, pattern.scrollLeft]", updateGrid);

    }
  };
}]);

musicShowCaseApp.directive("musicEventEditor", ["$timeout", "TICKS_PER_BEAT", function($timeout, TICKS_PER_BEAT) {
  return {
    scope: {
      /* Current pattern */
      pattern: "=pattern",
      /* Current track */
      track: "=track",
      /* Display params */
      zoomLevel: "=zoomLevel",
      beatWidth: "=beatWidth",
      /* File params (common to all tracks) */
      measure: "=measure",
      measureCount: "=measureCount",
      recipe: '=recipe'
    },
    templateUrl: "site/templates/directives/musicEventEditor.html",
    link: function(scope, element, attrs) {
      scope.TICKS_PER_BEAT = TICKS_PER_BEAT;
      var defaultL = TICKS_PER_BEAT;

      var semitoneToNote = function(n) {
        return [0,[0,1], 1, [1,2], 2, 3, [3,4], 4, [4,5], 5, [5,6], 6][n%12];
      };

      var noteToSemitone = function(n) {
        return [0,2,4,5,7,9,11][n%7];
      };

      var notation7 = function(n) {
        return ["C","D","E","F","G","A","B"][n % 7];
      };

      scope.raiseEventChanged = function(oldevt, evt, track) {
        scope.$emit('eventChanged', {oldevt: oldevt,evt: evt, track: track})
      };

      scope.noteName = function(n) {
        var note7 = semitoneToNote(n);

        if (Array.isArray(note7)) {
          note7 = note7[0]
          return notation7(note7)  + '#';
        } else {
          return notation7(note7);
        }
      };

      var updateGrid = function() {
        scope.mainGridStyle = {"background-size": (scope.measure*scope.beatWidth*scope.zoomLevel) + "px 240px"};
      };

      scope.$watch("[measure, beatWidth, zoomLevel]", updateGrid);
      scope.$watch("track.scroll", function() {
        scope.$emit("trackChanged", scope.track);        
      });

      $timeout(updateGrid);

      scope.mouseUp = function(event) {
        scope.mouseMove = function() {};
      };

      scope.mouseLeave = function() {
        scope.mouseMove = function() {};
      };

      var moveEvent = function(evt, offsetX) {
        return function(event) {
          var oldevt = {n:evt.n, s:evt.s, l:evt.l};

          if (!event.target.classList.contains("event-list")) return;
          evt.s = Math.floor((event.offsetX - offsetX) / scope.beatWidth) / scope.zoomLevel * TICKS_PER_BEAT;
          evt.s = Math.floor(evt.s);
          if (evt.s < 0) evt.s = 0;

          var oldN = evt.n;
          evt.n = Math.floor(120 - event.offsetY / 20);

          scope.$emit("trackChanged", scope.track);
          scope.$emit("eventChanged", {oldevt: oldevt, evt:evt, track: scope.track});
        };
      };

      var moveEventFromEvent = function(evt, offsetX) {
        return function(dragevt, event) {
          var oldevt = {n:evt.n, s:evt.s, l:evt.l};
          evt.s = dragevt.s + Math.floor((event.offsetX - offsetX) / scope.beatWidth) / scope.zoomLevel * TICKS_PER_BEAT;
          evt.s = Math.floor(evt.s);
          evt.n = dragevt.n;
          if (evt.s < 0) evt.s = 0;
          scope.$emit("trackChanged", scope.track);
          scope.$emit("eventChanged", {oldevt: oldevt, evt:evt, track: scope.track});
        };
      };

      var cancelMove = function() {
        scope.mouseMoveEvent = function(){};
        scope.mouseMove = function(){};
        scope.mouseLeave = function(){};
      };

      scope.mouseDown = function(event) {
        if (!event.target.classList.contains("event-list")) return;
        var newEvt = {
          n: Math.floor(120 - event.offsetY / 20),
          s: Math.floor(event.offsetX / scope.beatWidth) / scope.zoomLevel * TICKS_PER_BEAT,
          l: defaultL
        };

        newEvt.s = Math.floor(newEvt.s);

        scope.selected = newEvt;

        scope.recipe.raise('pattern_note_added');
        scope.track.events.push(newEvt);

        scope.$emit("trackChanged", scope.track);
        scope.$emit("eventChanged", {oldevt:{}, evt:newEvt, track: scope.track});

        scope.mouseMove = moveEvent(newEvt, 0);
        scope.mouseMoveEvent = moveEventFromEvent(newEvt, 0);

        scope.mouseLeave = function() {
          cancelMove();
        };

        scope.mouseUpResizeEvent = cancelMove;
        scope.mouseUpEvent = cancelMove;
        scope.mouseUp = cancelMove;
      };

      scope.mouseDownEvent = function(evt, event) {
        event.preventDefault();
        document.activeElement.blur();

        scope.$emit("eventSelected", {evt: evt, track: scope.track});
        scope.selected = evt;

        scope.mouseMove = moveEvent(evt, event.offsetX);
        scope.mouseMoveEvent = moveEventFromEvent(evt, event.offsetX);

        scope.mouseLeave = function() {
          cancelMove();
        };

        var _cancelMove = function() {
          scope.recipe.raise('pattern_note_drag');
          cancelMove();
        };

        scope.mouseUpResizeEvent = _cancelMove;
        scope.mouseUpEvent = _cancelMove;
        scope.mouseUp = _cancelMove;
      };

      scope.mouseDownResizeEvent = function(evt, event) {
        event.preventDefault();

        scope.selected = evt;

        scope.mouseMove = function(event) {
          var oldevt = {n:evt.n, s:evt.s, l:evt.l};

          if (!event.target.classList.contains("event-list")) return;
          var refs = Math.floor(event.offsetX / scope.beatWidth) / scope.zoomLevel * TICKS_PER_BEAT;
          evt.l = refs - evt.s;
          evt.l = Math.floor(evt.l);

          if (evt.l<TICKS_PER_BEAT/scope.zoomLevel) evt.l=TICKS_PER_BEAT/scope.zoomLevel;

          defaultL = evt.l;
          scope.$emit("trackChanged", scope.track);
          scope.$emit("eventChanged", {oldevt:oldevt, evt:evt, track: scope.track});
        };

        scope.mouseMoveEvent = function(dragevt, event) {
          var oldevt = {n:evt.n, s:evt.s, l:evt.l};

          var refs = dragevt.s + Math.floor(event.offsetX / scope.beatWidth) / scope.zoomLevel * TICKS_PER_BEAT;
          evt.l = refs - evt.s;
          evt.l = Math.floor(evt.l);

          if (evt.l<TICKS_PER_BEAT/scope.zoomLevel) evt.l=TICKS_PER_BEAT/scope.zoomLevel;

          defaultL = evt.l;

          scope.$emit("trackChanged", scope.track);
          scope.$emit("eventChanged", {oldevt:oldevt, evt:evt, track: scope.track});
        };        

        scope.mouseUpResizeEvent = cancelMove;
        scope.mouseUpEvent = cancelMove;
        scope.mouseUp = cancelMove;
      };

      var keyDownHandler = function(e) {
        if (document.activeElement.tagName.toLowerCase() === "input") return;

        if (e.keyCode == 46) {
          $timeout(function() {
            scope.track.events = scope.track.events.filter(function(evt) { return evt !== scope.selected; });
            scope.$emit("trackChanged", scope.track);
          });
        }
      };

      $(document).bind("keydown", keyDownHandler);
      scope.$on("$destroy", function() {
        $(document).unbind("keydown", keyDownHandler);
      });
    }
  };
}]);

musicShowCaseApp.directive("showScale", ["$timeout", function($timeout) {
  return {
    scope: {
      scale: "=scale"
    },
    template: '<div class="note-cell" ng-repeat="note in notes">{{note}}</div><div class="note-cell" ng-repeat="note in notes">{{note}}</div>',
    link: function(scope, element, attrs) {
      var semitoneToNote = function(n) {
        return [0,[0,1], 1, [1,2], 2, 3, [3,4], 4, [4,5], 5, [5,6], 6][n%12];
      };

      var noteToSemitone = function(n) {
        return [0,2,4,5,7,9,11][n%7];
      };

      var notation7 = function(n) {
        return ["C","D","E","F","G","A","B"][n % 7];
      };

      scope.$watch("scale", function(newVal) {
        $timeout(function() {
          var scale = MUSIC.Utils.Scale(newVal);
          var deltas = [0,1,2,3,4,5,6];

          var initTone = semitoneToNote(newVal);
          if (initTone.length) initTone = initTone[1];

          scope.notes = deltas.map(function(d) {
            var semitone = scale.add(newVal,d);
            var tone = (initTone + d) % 7;
            var alt = "";

            if (noteToSemitone(tone) > semitone % 12) alt = "b";
            if (noteToSemitone(tone) < semitone % 12) alt = "#";
            return notation7(tone) + alt;
          });
        });
      });
    }
  };
}]);

musicShowCaseApp.directive("ngScrollTop", ["$parse", "$timeout", function($parse, $timeout) {
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      var scrollVarGetter = $parse(attrs.ngScrollTop);
      var scrollVarSetter = scrollVarGetter.assign;

      scope.$watch(attrs.ngScrollTop, function() {
        $(element).scrollTop(scrollVarGetter(scope));
      });

      element.on('scroll', function() {
        $timeout(function() {
          scrollVarSetter(scope, $(element).scrollTop());
        });
      });
    }
  };
}]);

musicShowCaseApp.directive("ngScrollLeft", ["$parse", "$timeout", function($parse, $timeout) {
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      var scrollVarGetter = $parse(attrs.ngScrollLeft);
      var scrollVarSetter = scrollVarGetter.assign;

      scope.$watch(attrs.ngScrollLeft, function() {
        $(element).scrollLeft(scrollVarGetter(scope));
      });

      element.on('scroll', function() {
        $timeout(function() {
          scrollVarSetter(scope, $(element).scrollLeft());
        });
      });
    }
  };
}]);

