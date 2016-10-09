var musicShowCaseApp = angular.module("MusicShowCaseApp");
musicShowCaseApp.directive("recipeTooltip", ["$parse", "$timeout", function($parse, $timeout) {
  return {
    restrict: 'E',
    scope: {},
    template: '<div ng-click="onClick($event)" ng-class="{\'show-recipe-tooltip\': tooltipEnabled, \'cap-right\': capRight}" class="recipe-tooltip"><p>{{text}}</p></div>',
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
          var windowWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
          var el = element[0];
          var offset = windowWidth - el.getBoundingClientRect().left;

          scope.capRight = offset < 300;

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

