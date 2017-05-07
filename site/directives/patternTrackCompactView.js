musicShowCaseApp.directive("patternTrackCompactView", ["$timeout", "TICKS_PER_BEAT", "Recipe", "Pattern", function($timeout, TICKS_PER_BEAT, Recipe, Pattern) {
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
      scope.recipe = Recipe.start;

      scope.TICKS_PER_BEAT = TICKS_PER_BEAT;
      var semitoneToNote = function(n) {
        return [0,[0,1], 1, [1,2], 2, 3, [3,4], 4, [4,5], 5, [5,6], 6][n%12];
      };
      var notation7 = function(n) {
        return ["C","D","E","F","G","A","B"][n % 7];
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
        scope.mainGridStyle = {
          "background-size": (scope.measure*scope.beatWidth*scope.zoomLevel) + "px 240px",
          "background-position": -scope.pattern.scrollLeft + "px"
        };
      };
      scope.$watch("[measure, beatWidth, zoomLevel, pattern.scrollLeft]", updateGrid);
      scope.$on("trackSelectEvent", function(evt, event) {
        scope.selected = event;
      });


      var mouseUp = function(event) {
        scope.$emit("enableTrack", scope.track);
        scope.mouseMove = function() {};
      };

      scope.mouseUp = mouseUp;

      scope.mouseLeave = function() {
        scope.mouseMove = function() {};
      };

      var cancelMove = function() {
        scope.mouseMoveEvent = function(){};
        scope.mouseMove = function(){};
        scope.mouseLeave = function(){};
      };

      scope.mouseDownEvent = function(evt, event) {
        var moved = false;

        var moveEvent = function(evt, offsetX) {
          return function(event) {
            var clipDistance = TICKS_PER_BEAT / scope.zoomLevel;
            var oldevt = {n:evt.n, s:evt.s, l:evt.l};

            if (!event.target.classList.contains("track-compact-view")) return;

            var exactPosition = Math.floor((event.offsetX - offsetX) / scope.beatWidth / scope.zoomLevel * TICKS_PER_BEAT);
            exactPosition = Math.floor(exactPosition);
            var clipS = Pattern.findClipS(scope.pattern, scope.track, evt, exactPosition);

            if (Math.abs(exactPosition - clipS - clipDistance / 2) < clipDistance) {
              evt.s = clipS;
            } else {
              evt.s = Math.floor((event.offsetX - offsetX) / 2 / scope.beatWidth) * 2 / scope.zoomLevel * TICKS_PER_BEAT;
              evt.s = Math.floor(evt.s);
            }

            if (evt.s < 0) evt.s = 0;
            if (evt.s !== oldevt.s) moved = true;

            scope.$emit("trackChanged", scope.track);
            scope.$emit("eventChanged", {oldevt: oldevt, evt:evt, track: scope.track});
          };
        };

        var moveEventFromEvent = function(evt, offsetX) {
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

            if (evt.s < 0) evt.s = 0;
            if (evt.s !== oldevt.s) moved = true;

            scope.$emit("trackChanged", scope.track);
            scope.$emit("eventChanged", {oldevt: oldevt, evt:evt, track: scope.track});
          };
        };

        event.preventDefault();
        document.activeElement.blur();

        scope.$emit("eventSelected", {evt: evt, track: scope.track});

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
        scope.mouseUp = function() {
          scope.mouseUp = mouseUp;

          if (!moved) scope.$emit("enableTrack", scope.track);

          scope.$emit("patternSelectEvent", evt);
          _cancelMove();
        };
      };

      scope.mouseDownResizeEvent = function(evt, event) {
        var moved = false;

        event.preventDefault();

        scope.mouseMove = function(event) {
          var oldevt = {n:evt.n, s:evt.s, l:evt.l};
          var clipDistance = TICKS_PER_BEAT / scope.zoomLevel;
          var clipL = Pattern.findClipL(scope.pattern, scope.track, evt, evt.s);

          if (!event.target.classList.contains("track-compact-view")) return;

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

          if (evt.l !== oldevt.l) {
            moved = true;
          }

          scope.$emit("trackChanged", scope.track);
          scope.$emit("eventChanged", {oldevt:oldevt, evt:evt, track: scope.track});
        };

        scope.mouseMoveEvent = function(dragevt, event) {
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

          if (evt.l !== oldevt.l) {
            moved = true;
          }          

          scope.$emit("trackChanged", scope.track);
          scope.$emit("eventChanged", {oldevt:oldevt, evt:evt, track: scope.track});
        };        

        scope.mouseUpResizeEvent = cancelMove;
        scope.mouseUpEvent = cancelMove;
        scope.mouseUp = function() {
          scope.mouseUp = mouseUp;

          if (!moved) scope.$emit("enableTrack", scope.track);

          scope.$emit("patternSelectEvent", evt);
          cancelMove();
        };
      };

    }
  };
}]);

