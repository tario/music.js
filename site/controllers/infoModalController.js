var musicShowCaseApp = angular.module("MusicShowCaseApp");
musicShowCaseApp.controller("infoModalCtrl", ["$scope", "$uibModalInstance", function($scope, $uibModalInstance) {
  $scope.dismiss = function() {
    $uibModalInstance.dismiss();
  };
}]);
