var musicShowCaseApp = angular.module("MusicShowCaseApp");
musicShowCaseApp.controller("openProjectModalCtrl", ["$q", "$scope", "$uibModalInstance", 'FileRepository', function($q, $scope, $uibModalInstance, FileRepository) {
  var currentObserver;
  var immediateUpdateSearch = function() {
    if (currentObserver) currentObserver.close();
    currentObserver = FileRepository.search($scope.searchKeyword, {type: ['project']})
      .observe(function(files) {
        $scope.filesTotal = files.total;
        $scope.files = files.results;
      });
  };

  $scope.updateSearch = fn.debounce(immediateUpdateSearch,250);
  $scope.cancel = function() {
    $uibModalInstance.dismiss();
  };

  $scope.select = function(projectId) {
    $scope.selected = projectId;
  };

  $scope.open = function(projectId) {
    $uibModalInstance.close(projectId);
  };

  immediateUpdateSearch();
}]);
