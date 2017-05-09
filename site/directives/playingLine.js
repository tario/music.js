musicShowCaseApp.directive("playingLine", ["$timeout", "TICKS_PER_BEAT", function($timeout, TICKS_PER_BEAT) {
  return {
    scope: {},
    replace: true,
    templateUrl: "site/templates/directives/playingLine.html",
    link: function(scope, element) {
      var t0;
      var playing = true;
      var bpm;
      var parent = scope.$parent;

      var callback = function() {
        if (parent && parent.file && playing) {
          var ticks = TICKS_PER_BEAT * (window.performance.now() - t0) * bpm / 60000;
          var displacement = ticks*parent.zoomLevel*parent.beatWidth/TICKS_PER_BEAT;

          console.log(displacement);
          element.css("left", (displacement) + "px");
        }
        requestAnimationFrame(callback);
      };

      var playingLine = $(element);
      var requestId = requestAnimationFrame(callback);

      scope.$on('startClock', function(evt, _t0) {
        playing = true;
        bpm = parent.file.bpm;
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

