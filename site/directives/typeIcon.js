var musicShowCaseApp = angular.module("MusicShowCaseApp");

musicShowCaseApp.filter("icon_from_type", function() {
  return function(type) {
    if (type === "instrument") return "keyboard";
    if (type === "tempo") return "clock";
    if (type === "song") return "th";
    if (type === "pattern") return "music";
    if (type === "fx") return "magic";
    if (type === "project") return "folder";
    return "question";
  };
});

musicShowCaseApp.directive("typeIcon", ["$parse", function($parse) {
  return {
    restrict: 'A',
    scope: {},
    replace: true,
    template: '<span class="fa fa-{{typeIcon | icon_from_type}}">',
    link: function(scope, element, attrs) {
      var iconTypeName = $parse(attrs.typeIcon);

      scope.$parent.$watch(iconTypeName, function(newValue) {
        scope.typeIcon = iconTypeName(scope.$parent);
      });
    }
  };
}]);
