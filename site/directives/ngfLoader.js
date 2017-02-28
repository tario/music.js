var musicShowCaseApp = angular.module("MusicShowCaseApp");
musicShowCaseApp.directive("ngfLoader", ["$parse", function($parse) {
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      var ngfLoaderGetter = $parse(attrs.ngfLoader);

      $(element).on('change', function(e) {
        ngfLoaderGetter(scope, {'$files': e.target.files});
        $(element).val("");
      })
    }
  };
}]);
