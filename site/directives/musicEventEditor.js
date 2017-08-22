musicShowCaseApp.directive("musicEventEditor", ["$timeout", "TICKS_PER_BEAT", "Pattern", function($timeout, TICKS_PER_BEAT, Pattern) {
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

      var clearShadow = function() {
        scope.shadowEvt = null;
      };

      var defaultMouseLeave = clearShadow;

      var defaultMouseMove = function(event) {
        var clipDistance = TICKS_PER_BEAT / scope.zoomLevel;
        if (!event.target.classList.contains("event-list")) {
          return;
        }


        scope.shadowEvt = scope.shadowEvt || {};
        scope.shadowEvt.n = Math.floor(120 - event.offsetY / 20);
        scope.shadowEvt.l = defaultL;

        if (scope.shadowEvt.s) {
          var exactPosition = Math.floor(event.offsetX / scope.beatWidth / scope.zoomLevel * TICKS_PER_BEAT);
          exactPosition = Math.floor(exactPosition);
          var clipS = Pattern.findClipS(scope.pattern, scope.track, {s: exactPosition, l: defaultL}, exactPosition);

          if (Math.abs(exactPosition - clipS - clipDistance / 2) < clipDistance) {
            scope.shadowEvt.s = clipS;

            Pattern.cutEvent(scope.pattern, scope.track, scope.shadowEvt);
            return;
          }
        }

        scope.shadowEvt.s = Math.floor(Math.floor(event.offsetX / 2 / scope.beatWidth) * 2 / scope.zoomLevel * TICKS_PER_BEAT);
        if (scope.shadowEvt.s < 0) scope.shadowEvt.s = 0;
        Pattern.cutEvent(scope.pattern, scope.track, scope.shadowEvt);
      };

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
        var octave = Math.floor(n/12);

        if (Array.isArray(note7)) {
          note7 = note7[0]
          return notation7(note7) + '#' + octave;
        } else {
          return notation7(note7) + octave;
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

      var addNewEvent = function(newEvt) {
        if (scope.track.events.find(function(evt) {
          return newEvt.s === evt.s && newEvt.n === evt.n;
        })) {
          return;
        }

        newEvt = angular.copy(newEvt);

        if (Pattern.collision(scope.track, newEvt)) return;

        scope.$emit("patternSelectEvent", newEvt);
        scope.selected = newEvt;

        scope.recipe.raise('pattern_note_added');
        scope.track.events.push(newEvt);

        scope.$emit("trackChanged", scope.track);
        scope.$emit("eventChanged", {oldevt:{}, evt:newEvt, track: scope.track});

        scope.mouseMove = moveEvent(newEvt, 0);
        scope.mouseMoveEvent = moveEventFromEvent(newEvt, 0);

        clearShadow();

        scope.mouseLeave = function() {
          defaultMouseLeave();
          cancelMove();
        };

        scope.mouseUpResizeEvent = cancelMove;
        scope.mouseUpEvent = cancelMove;
        scope.mouseUp = cancelMove;
      };

      scope.mouseMoveResizeEvent = function() {
        clearShadow();
      };

      scope.shadowMouseMove = function(event) {
        var deltaS = Math.floor(event.offsetX / 2 / scope.beatWidth) * 2 / scope.zoomLevel * TICKS_PER_BEAT;
        if (deltaS > 0) scope.shadowEvt.s = scope.shadowEvt.s + deltaS;

        Pattern.cutEvent(scope.pattern, scope.track, scope.shadowEvt);
      };

      scope.addFromShadow = function(event) {
        addNewEvent(scope.shadowEvt);
      };

      scope.mouseUp = function(event) {
        scope.mouseMove = defaultMouseMove;
      };

      scope.mouseLeave = function() {
        defaultMouseLeave();
        scope.mouseMove = defaultMouseMove;
      };

      scope.mouseMove = defaultMouseMove;
      scope.mouseMoveEvent = clearShadow;

      var max = function(c1, c2) {
        return c1 > c2 ? c1 : c2;
      };

      var preventCollision = function(evt, f) {
        return function() {
          var savedEvt = angular.copy(evt);
          var ret = f.apply(null, arguments);

          if (Pattern.collision(scope.track, evt)) {
            evt.n = savedEvt.n;
            evt.s = savedEvt.s;
            evt.l = savedEvt.l;
            return;
          }

          if (evt.n !== savedEvt.n || evt.l !== savedEvt.l || evt.s !== savedEvt.s) {
            scope.$emit("trackChanged", scope.track);
            scope.$emit("eventChanged", {oldevt: savedEvt, evt:evt, track: scope.track});
          }
        };
      };

      var moveEvent = function(evt, offsetX) {
        return function(event) {
          var clipDistance = TICKS_PER_BEAT / scope.zoomLevel;
          var oldevt = {n:evt.n, s:evt.s, l:evt.l};

          var exactPosition = Math.floor((event.offsetX - offsetX) / scope.beatWidth / scope.zoomLevel * TICKS_PER_BEAT);
          exactPosition = Math.floor(exactPosition);
          var clipS = Pattern.findClipS(scope.pattern, scope.track, evt, exactPosition);

          if (!event.target.classList.contains("event-list")) return;

          if (Math.abs(exactPosition - clipS - clipDistance / 2) < clipDistance) {
            evt.s = clipS;
          } else {
            evt.s = Math.floor((event.offsetX - offsetX) / 2 / scope.beatWidth) * 2 / scope.zoomLevel * TICKS_PER_BEAT;
            evt.s = Math.floor(evt.s);
          }

          if (evt.s < 0) evt.s = 0;

          var oldN = evt.n;
          evt.n = Math.floor(120 - event.offsetY / 20);
        };
      };

      var moveEventFromEvent = function(evt, offsetX) {
        clearShadow();
        return function(dragevt, event) {
          var clipDistance = TICKS_PER_BEAT / scope.zoomLevel;
          var oldevt = {n:evt.n, s:evt.s, l:evt.l};

          var exactPosition = dragevt.s + Math.floor((event.offsetX - offsetX) / scope.beatWidth / scope.zoomLevel * TICKS_PER_BEAT);
          exactPosition = Math.floor(exactPosition);
          var clipS = Pattern.findClipS(scope.pattern, scope.track, evt, exactPosition);

          if (Math.abs(exactPosition - clipS - clipDistance / 2) < clipDistance) {
            evt.s = clipS;
          } else {
            evt.s = dragevt.s + Math.floor((event.offsetX - offsetX) / 2 / scope.beatWidth) * 2 / scope.zoomLevel * TICKS_PER_BEAT;
            evt.s = Math.floor(evt.s);
          }

          evt.n = dragevt.n;
          if (evt.s < 0) evt.s = 0;
        };
      };

      var cancelMove = function() {
        scope.mouseMoveEvent = clearShadow;
        scope.mouseMove = defaultMouseMove;
        scope.mouseLeave = defaultMouseLeave;
      };

      scope.mouseDown = function(event) {
        if (!event.target.classList.contains("event-list")) return;
        var newEvt = {
          n: Math.floor(120 - event.offsetY / 20),
          s: Math.floor(event.offsetX / scope.beatWidth) / scope.zoomLevel * TICKS_PER_BEAT,
          l: defaultL
        };

        newEvt.s = Math.floor(newEvt.s);

        Pattern.cutEvent(scope.pattern, scope.track, newEvt);
        addNewEvent(newEvt);
      };

      var eventSplit = function(evt, ticks) {
        var originalL = evt.l;
        evt.l = ticks;
        var newEvt = {
          n: evt.n,
          s: evt.s + evt.l,
          l: originalL - ticks
        };
        scope.recipe.raise('pattern_note_added');
        scope.track.events.push(newEvt);
      }

      var eventLeftSplit = function(evt) {
        if (evt.l % 3 === 0) {
          eventSplit(evt, evt.l / 3);
        } else {
          eventCenterSplit(evt);
        }
      };

      var eventRightSplit = function(evt) {
        if (evt.l % 3 === 0) {
          eventSplit(evt, evt.l * 2 / 3);
        } else {
          eventCenterSplit(evt);
        }
      };

      var eventCenterSplit = function(evt) {
        if (evt.l % 2 === 0) {
          eventSplit(evt, evt.l / 2);
        }
      };

      scope.mouseDblClickEvent = function(evt, event) {
        var elementWidth = $(event.target)[0].clientWidth+5;

        if (event.offsetX < elementWidth/3) {
          eventLeftSplit(evt);
        } else if (event.offsetX > elementWidth*2/3) {
          eventRightSplit(evt);
        } else {
          eventCenterSplit(evt);
        }
      };

      scope.mouseDownEvent = function(evt, event) {
        event.preventDefault();
        document.activeElement.blur();

        scope.$emit("eventSelected", {evt: evt, track: scope.track});

        scope.$emit("patternSelectEvent", evt);
        scope.selected = evt;

        scope.mouseMove = preventCollision(evt, moveEvent(evt, event.offsetX));
        scope.mouseMoveEvent = preventCollision(evt, moveEventFromEvent(evt, event.offsetX));

        clearShadow();

        scope.mouseLeave = function() {
          defaultMouseLeave();
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

        scope.$emit("patternSelectEvent", evt);
        scope.selected = evt;

        scope.mouseMove = preventCollision(evt, function(event) {
          var oldevt = {n:evt.n, s:evt.s, l:evt.l};
          var clipDistance = TICKS_PER_BEAT / scope.zoomLevel;
          var clipL = Pattern.findClipL(scope.pattern, scope.track, evt, evt.s);

          if (!event.target.classList.contains("event-list")) return;

          var exactL = Math.floor(event.offsetX / scope.beatWidth / scope.zoomLevel * TICKS_PER_BEAT) - evt.s;

          if (Math.abs(exactL - clipL - clipDistance) < clipDistance) {
            evt.l = clipL;
          } else {
            var refs = Math.floor(event.offsetX / scope.beatWidth / 2) * 2 / scope.zoomLevel * TICKS_PER_BEAT;
            evt.l = refs - evt.s;
            evt.l = Math.floor(evt.l);
            if (evt.l<TICKS_PER_BEAT/scope.zoomLevel) evt.l=TICKS_PER_BEAT/scope.zoomLevel;

            defaultL = evt.l;
          }
        });

        scope.mouseMoveEvent = preventCollision(evt, function(dragevt, event) {
          var oldevt = {n:evt.n, s:evt.s, l:evt.l};
          var clipDistance = TICKS_PER_BEAT / scope.zoomLevel;
          var clipL = Pattern.findClipL(scope.pattern, scope.track, evt, evt.s);

          var exactL = dragevt.s + 
            Math.floor(event.offsetX / scope.beatWidth / scope.zoomLevel * TICKS_PER_BEAT) -
            evt.s;

          if (Math.abs(exactL - clipL - clipDistance) < clipDistance) {
            evt.l = clipL;
          } else {
            var refs = dragevt.s + Math.floor(event.offsetX / scope.beatWidth / 2) * 2 / scope.zoomLevel * TICKS_PER_BEAT;
            evt.l = refs - evt.s;
            evt.l = Math.floor(evt.l);

            if (evt.l<TICKS_PER_BEAT/scope.zoomLevel) evt.l=TICKS_PER_BEAT/scope.zoomLevel;

            defaultL = evt.l;
          }
        });

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

      scope.$on("trackSelectEvent", function(evt, event) {
        scope.selected = event;
      });
    }
  };
}]);
