var musicShowCaseApp = angular.module("MusicShowCaseApp");
musicShowCaseApp.directive("ngfLoader", ["$parse", function($parse) {
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      var ngfLoaderGetter = $parse(attrs.ngfLoader);
      var onChange =  function(e) {
        ngfLoaderGetter(scope, {'$files': e.target.files});
        $(element).val("");
      };

      $(element).on('change', onChange);
      scope.$on('$destroy', function() {
        $(element).off('change', onChange);
      });
    }
  };
}]);
