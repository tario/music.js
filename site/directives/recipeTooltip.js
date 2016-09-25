var musicShowCaseApp = angular.module("MusicShowCaseApp");
musicShowCaseApp.directive("recipeTooltip", ["$parse", "$timeout", function($parse, $timeout) {
  return {
    restrict: 'E',
    scope: {},
    template: '<div ng-click="onClick($event)" class="recipe-tooltip"><p>{{text}}</p></div>',
    link: function(scope, element, attrs) {
      var rtIdGetter = $parse(attrs.rtId);
      var tooltipElementId = rtIdGetter(scope.$parent);

      scope.onClick = function(e) {
        scope.$parent.recipe.raise("tooltip_click");
        e.stopImmediatePropagation();
      };

      scope.$on("_tooltip_display_" + tooltipElementId, function(event, args) {
        $timeout(function() {
          scope.text = args.text;
          $(element).addClass('show-recipe-tooltip');
        })
      });

      scope.$on("_tooltip_hide_" + tooltipElementId, function() {
        $(element).removeClass('show-recipe-tooltip');
      });

      scope.$on("__tooltip_hide_all", function() {
        $(element).removeClass('show-recipe-tooltip');
      });

    }
  };
}]);

