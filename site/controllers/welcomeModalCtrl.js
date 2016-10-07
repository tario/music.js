var musicShowCaseApp = angular.module("MusicShowCaseApp");
musicShowCaseApp.controller("welcomeModalCtrl", ["$scope", "$uibModalInstance", "Recipe", "WelcomeMessage", function($scope, $uibModalInstance, Recipe, WelcomeMessage) {
  $scope.dontshowagain = WelcomeMessage.skip();

  $scope.dismiss = function() {
    WelcomeMessage.setSkip($scope.dontshowagain);

    $uibModalInstance.dismiss();

  };

  $scope.tutorial = function() {
    WelcomeMessage.setSkip($scope.dontshowagain);

    $uibModalInstance.dismiss();
    Recipe.start('intro');
  };
}]);
