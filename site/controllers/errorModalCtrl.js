var musicShowCaseApp = angular.module("MusicShowCaseApp");
musicShowCaseApp.controller("errorModalCtrl", ["$scope", "$uibModalInstance", "text", "title", function($scope, $uibModalInstance, text, title) {
  $scope.text = text;
  $scope.title = title;
  $scope.dismiss = function() {
    $uibModalInstance.dismiss();
  };
}]);

