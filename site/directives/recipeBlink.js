var musicShowCaseApp = angular.module("MusicShowCaseApp");
musicShowCaseApp.directive("recipeBlink", ["$parse", "$timeout", "Recipe", function($parse, $timeout, Recipe) {
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      var recipeBlinkGetter = $parse(attrs.recipeBlink);
      var blinkElementId = recipeBlinkGetter(scope);

      if (!Array.isArray(blinkElementId)) {
        blinkElementId = [blinkElementId];
      }

      var blink = function() {
        $timeout(function() {
          $(element).addClass('blink');
        });
      };

      var noblink = function() {
        $timeout(function() {
          $(element).removeClass('blink');
        });
      };

      var registerEvent = function(blinkElementId) {
        if (Recipe.getBlinks().indexOf(blinkElementId) !== -1) {
          blink();
        }

        scope.$on("_blink_enable_" + blinkElementId, function(event, args) {
          blink();
        });

        scope.$on("_blink_disable_" + blinkElementId, function() {
          noblink();
        });

        scope.$on("__blink_disable_all", function() {
          noblink();
        });
      };

      blinkElementId.forEach(registerEvent);
    }
  };
}]);

