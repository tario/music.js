var musicShowCaseApp = angular.module("MusicShowCaseApp");
musicShowCaseApp.controller("recycleBinModalCtrl", ["$scope", "$timeout", "$uibModalInstance", "FileRepository", function($scope, $timeout, $uibModalInstance, FileRepository) {
  $scope.dismiss = function() {
    $uibModalInstance.dismiss();
  };

  var immediateUpdateSearch = function() {
    FileRepository.searchRecycled($scope.searchKeyword, {limit: 10})
      .then(function(results) {
        $timeout(function() {
          $scope.files = results.results;
          $scope.filesTotal = results.total;
        });
      })
  };

  $scope.updateSearch = fn.debounce(immediateUpdateSearch,250);

  $scope.restoreFromRecycleBin = function(file) {
    FileRepository.restoreFromRecycleBin(file.id).then(immediateUpdateSearch);
  };

  immediateUpdateSearch();
}]);

