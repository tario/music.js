var musicShowCaseApp = angular.module("MusicShowCaseApp");
musicShowCaseApp.controller("projectSettingsModalCtrl", ["$q", "$scope", "$uibModalInstance", "project", function($q, $scope, $uibModalInstance, project) {
  $scope.project = project;

  $scope.cancel = function() {
    $uibModalInstance.dismiss();
  };

  $scope.create = function() {
    $uibModalInstance.close($scope.project);
  };
}]);
