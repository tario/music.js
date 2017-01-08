var musicShowCaseApp = angular.module("MusicShowCaseApp");
musicShowCaseApp.controller("recycleBinModalCtrl", ["$scope", "$timeout", "$uibModalInstance", "FileRepository", function($scope, $timeout, $uibModalInstance, FileRepository) {
  $scope.dismiss = function() {
    $uibModalInstance.dismiss();
  };

  $scope.iconForType = function(type) {
    if (type === "instrument") return "keyboard-o";
    if (type === "song") return "th";
    if (type === "pattern") return "music";
    if (type === "fx") return "magic";
    return "question";
  }

  $scope.updateSearch = fn.debounce(function() {
    FileRepository.searchRecycled($scope.searchKeyword)
      .then(function(results) {
        $timeout(function() {
          $scope.files = results.results;
          $scope.filesTotal = results.total;
        });
      })
  },500);

  $scope.restoreFromRecycleBin = function(file) {
    FileRepository.restoreFromRecycleBin(file.id)
      .then(function() {
        $scope.updateSearch();
      });
  };

  $timeout(function() {
    $scope.updateSearch();
  });
}]);

