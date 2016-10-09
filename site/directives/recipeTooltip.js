var musicShowCaseApp = angular.module("MusicShowCaseApp");
musicShowCaseApp.directive("recipeTooltip", ["$parse", "$timeout", function($parse, $timeout) {
  return {
    restrict: 'E',
    scope: {},
    template: '<div ng-click="onClick($event)" ng-class="{\'show-recipe-tooltip\': tooltipEnabled}" class="recipe-tooltip"><p>{{text}}</p></div>',
    link: function(scope, element, attrs) {
      var rtIdGetter = $parse(attrs.rtId);
      var tooltipElementId = rtIdGetter(scope.$parent);

      scope.tooltipEnabled = false;
      scope.onClick = function(e) {
        scope.$parent.recipe.raise("tooltip_click");
        e.stopImmediatePropagation();
      };

      scope.$on("_tooltip_display_" + tooltipElementId, function(event, args) {
        $timeout(function() {
          scope.text = args.text;
          scope.tooltipEnabled = true;
        })
      });

      scope.$on("_tooltip_hide_" + tooltipElementId, function() {
        scope.tooltipEnabled = false;
      });

      scope.$on("__tooltip_hide_all", function() {
        scope.tooltipEnabled = false;
      });
    }
  };
}]);

