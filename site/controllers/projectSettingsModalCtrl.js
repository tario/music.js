var musicShowCaseApp = angular.module("MusicShowCaseApp");
musicShowCaseApp.controller("projectSettingsModalCtrl", ["$q", "$scope", "$uibModalInstance", "project", "buttonText", function($q, $scope, $uibModalInstance, project, buttonText) {
  $scope.project = project;
  $scope.buttonText = buttonText;

  $scope.cancel = function() {
    $uibModalInstance.dismiss();
  };

  $scope.done = function() {
    $uibModalInstance.close($scope.project);
  };
}]);
