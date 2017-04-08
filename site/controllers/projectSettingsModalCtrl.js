var musicShowCaseApp = angular.module("MusicShowCaseApp");
musicShowCaseApp.controller("projectSettingsModalCtrl", ["$q", "$scope", "$uibModalInstance", "FileRepository", "project", "buttonText", function($q, $scope, $uibModalInstance, FileRepository, project, buttonText) {
  var currentObserver;
  var immediateUpdateSearch = function() {
    if (currentObserver) currentObserver.close();
    currentObserver = FileRepository.search($scope.searchKeyword, {type: ['project']})
      .observe(function(files) {
        $scope.filesTotal = files.total;
        $scope.files = files.results;
      });
  };

  $scope.project = project;
  $scope.buttonText = buttonText;

  var getIndex = function(id) {
    return FileRepository.getFile(id)
      .then(function(file) {
        return file.index;
      });
  };

  $scope.refs = [];
  $q.all(($scope.project.ref||[]).map(getIndex))
    .then(function(refs) {
      $scope.refs = refs
    });

  $scope.updateSearch = fn.debounce(immediateUpdateSearch,250);
  $scope.cancel = function() {
    $uibModalInstance.dismiss();
  };

  $scope.done = function() {
    $scope.project.ref = $scope.refs.map(getId);
    $uibModalInstance.close($scope.project);
  };

  var getId = function(x) { return x.id; };
  $scope.remove = function(file) {
    $scope.refs = $scope.refs.filter(function(f) {
      return f.id !== file.id;
    });
  };

  $scope.add = function(file) {
    if ($scope.refs.map(getId).indexOf(file.id) === -1) {
      $scope.refs.push(file);
    }
  };

  immediateUpdateSearch();
}]);
