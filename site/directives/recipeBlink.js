var musicShowCaseApp = angular.module("MusicShowCaseApp");
musicShowCaseApp.directive("recipeBlink", ["$parse", "$timeout", function($parse, $timeout) {
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      var recipeBlinkGetter = $parse(attrs.recipeBlink);
      var blinkElementId = recipeBlinkGetter(scope);

      if (!Array.isArray(blinkElementId)) blinkElementId = [blinkElementId];

      var registerEvent = function(blinkElementId) {
        scope.$on("_blink_enable_" + blinkElementId, function(event, args) {
          $timeout(function() {
            $(element).addClass('blink');
          })
        });

        scope.$on("_blink_disable_" + blinkElementId, function() {
          $(element).removeClass('blink');
        });

        scope.$on("__blink_disable_all", function() {
          $(element).removeClass('blink');
        });
      };
      blinkElementId.forEach(registerEvent);
    }
  };
}]);

