musicShowCaseApp.directive("playingLine", ["$timeout", "$parse", "TICKS_PER_BEAT", function($timeout, $parse, TICKS_PER_BEAT) {
  return {
    scope: {},
    replace: true,
    templateUrl: "site/templates/directives/playingLine.html",
    link: function(scope, element, attrs) {
      var t0;
      var playing = false;
      var getBpm = $parse(attrs.bpm);
      var getZoomLevel = $parse(attrs.zoomLevel);
      var getBeatWidth = $parse(attrs.beatWidth);

      var bpm, zoomLevel, beatWidth;

      var callback = function() {
        if (bpm && playing) {
          var ticks = TICKS_PER_BEAT * (window.performance.now() - t0) * bpm / 60000;
          var displacement = ticks*zoomLevel*beatWidth/TICKS_PER_BEAT;

          element.css("left", (displacement) + "px");
        }
        requestAnimationFrame(callback);
      };

      var playingLine = $(element);
      var requestId = requestAnimationFrame(callback);

      scope.$on('startClock', function(evt, _t0) {
        playing = true;
        bpm = getBpm(scope.$parent);
        zoomLevel = getZoomLevel(scope.$parent);
        beatWidth = getBeatWidth(scope.$parent);

        t0 = _t0;
      });

      scope.$on('stopClock', function(evt) {
        playing = false;
      });

      scope.$on('resetClock', function(evt) {
        playing = false;
        element.css("left", "0px");
      });


      scope.$on('$destroy', function() {
        cancelAnimationFrame(requestId);
      });
    }
  };
}]);

