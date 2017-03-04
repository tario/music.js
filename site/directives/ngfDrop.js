var musicShowCaseApp = angular.module("MusicShowCaseApp");
musicShowCaseApp.directive("ngfDrop", ["$parse", function($parse) {
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      var ngfDropGetter = $parse(attrs.ngfDrop);

      var allowDrag = function(e) {
        e.dataTransfer.dropEffect = 'copy';
        e.preventDefault();
      }

      var onDrop = function(e) {
        ngfDropGetter(scope, {'$files': e.dataTransfer.files});
        e.preventDefault();
      };

      window.addEventListener('dragenter', allowDrag);
      window.addEventListener('dragover', allowDrag)
      window.addEventListener('drop', onDrop);

      scope.$on("$destroy", function() {
        window.removeEventListener('dragenter', allowDrag);
        window.removeEventListener('dragover', allowDrag);
        window.removeEventListener('drop', onDrop);
      });
    }
  };
}]);
