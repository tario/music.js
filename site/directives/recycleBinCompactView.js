var musicShowCaseApp = angular.module("MusicShowCaseApp");
musicShowCaseApp.directive("recycleBinCompactView", ["$timeout", "$uibModal", "FileRepository", function($timeout, $uibModal, FileRepository) {
  return {
    templateUrl: 'site/templates/directives/recycleBinCompactView.html',
    scope: {},
    link: function(scope, element, attrs) {
      scope.iconForType = function(type) {
        if (type === "instrument") return "keyboard-o";
        if (type === "song") return "th";
        if (type === "pattern") return "music";
        return "question";
      };

      var observer = FileRepository.observeRecycled(function() {
        FileRepository.searchRecycled()
          .then(function(result) {
            $timeout(function() {
              scope.files = result.results.slice(-4).reverse();
            });
          });
      });

      scope.$on("destroy", observer.destroy);
      
      scope.openRecycleBin = function() {
        // show recycle bin modal
        var modalIns = $uibModal.open({
          templateUrl: "site/templates/modal/recycleBin.html",
          controller: "recycleBinModalCtrl"
        });
      };

      scope.restore = function(file) {
        FileRepository.restoreFromRecycleBin(file.id);
      };

      scope.onDropComplete= function(file) {
        FileRepository.moveToRecycleBin(file.id);
      };
    }
  };
}]);

