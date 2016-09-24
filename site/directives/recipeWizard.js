var musicShowCaseApp = angular.module("MusicShowCaseApp");
musicShowCaseApp.directive("recipeWizard", ["$timeout", function($timeout) {
  return {
    restrict: 'E',
    template: '<div class="recipe-wizard"><p>{{text}}</p></div>',
    link: function(scope, element, attrs) {
    }
  };
}]);

