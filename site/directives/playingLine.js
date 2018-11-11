musicShowCaseApp.directive("playingLine", ["$timeout", "$parse", "TICKS_PER_BEAT", function($timeout, $parse, TICKS_PER_BEAT) {
  return {
    scope: {},
    replace: true,
    templateUrl: "site/templates/directives/playingLine.html",
    link: function(scope, element, attrs) {
      var t0;
      var timeToTicks;
      var playing = false;
      var getBpm = $parse(attrs.bpm);
      var getZoomLevel = $parse(attrs.zoomLevel);
      var getBeatWidth = $parse(attrs.beatWidth);

      var bpm, zoomLevel, beatWidth;

      var ticksToPX = function(ticks) {
        zoomLevel = getZoomLevel(scope.$parent);
        beatWidth = getBeatWidth(scope.$parent);
        return ticks*zoomLevel*beatWidth/TICKS_PER_BEAT;
      };

      var callback = function() {
        if (bpm && playing) {
          var ticks = timeToTicks((window.performance.now() - t0));
          var displacement = ticksToPX(ticks);

          element.css("left", (displacement) + "px");
        }
        requestAnimationFrame(callback);
      };

      var playingLine = $(element);
      var requestId = requestAnimationFrame(callback);

      scope.$on('startClock', function(evt, _timeToTicks) {
        var _t0 = window.performance.now();

        playing = true;
        bpm = getBpm(scope.$parent);

        timeToTicks = _timeToTicks;
        t0 = _t0;
      });

      scope.$on('stopClock', function(evt) {
        playing = false;
      });

      scope.$on('pauseClock', function(evt) {
        var ticks = timeToTicks((window.performance.now() - t0));
        var displacement = ticksToPX(ticks || 0);

        playing = false;
        scope.$emit('pausedClock', ticks);
        element.css("left", (displacement) + "px");
      });

      scope.$on('resetClock', function(evt, baseTicks) {
        var displacement = ticksToPX(baseTicks || 0);

        playing = false;
        element.css("left", (displacement) + "px");
      });


      scope.$on('$destroy', function() {
        cancelAnimationFrame(requestId);
      });
    }
  };
}]);

