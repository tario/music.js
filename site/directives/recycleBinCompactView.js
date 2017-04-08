var musicShowCaseApp = angular.module("MusicShowCaseApp");
musicShowCaseApp.directive("recycleBinCompactView", ["$timeout", "$uibModal", "FileRepository", "ErrMessage", function($timeout, $uibModal, FileRepository, ErrMessage) {
  return {
    templateUrl: 'site/templates/directives/recycleBinCompactView.html',
    scope: {},
    link: function(scope, element, attrs) {
      scope.iconForType = function(type) {
        if (type === "instrument") return "keyboard-o";
        if (type === "song") return "th";
        if (type === "pattern") return "music";
        if (type === "project") return "folder-o";
        return "question";
      };

      var observer = FileRepository.observeRecycled(function() {
        FileRepository.searchRecycled(null, {limit: 10})
          .then(function(result) {
            $timeout(function() {
              scope.files = result.results.slice(0, 4);
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
        FileRepository.restoreFromRecycleBin(file.id)
          .then(function() {
            if (file.type === 'project') {
              document.location = "#/editor/" + file.id;
            } else {
              document.location = "#/editor/"+file.project+"/"+file.type+"/"+file.id;
            }
          });
      };

      scope.onDropComplete= function(file) {
        FileRepository.moveToRecycleBin(file.id)
          .catch(function(err) {
            if (err.type && err.type === 'cantremove') {
              ErrMessage('common.error_title', 'common.cantremove_error');
            } else {
              throw err;
            }
          });
      };
    }
  };
}]);

