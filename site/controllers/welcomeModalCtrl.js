var musicShowCaseApp = angular.module("MusicShowCaseApp");
musicShowCaseApp.controller("welcomeModalCtrl", ["$q", "$scope", "$uibModalInstance", "Recipe", "WelcomeMessage", "dontshowagain", function($q, $scope, $uibModalInstance, Recipe, WelcomeMessage, dontshowagain) {
  $scope.dontshowagain = dontshowagain;

  var skipUpdated = $q.when(null);
  $scope.updateSkip = function() {
    skipUpdated = WelcomeMessage.setSkip($scope.dontshowagain);
  };

  $scope.dismiss = function() {
    skipUpdated
      .then(function() {
        $uibModalInstance.dismiss();
      });

  };

  $scope.tutorial = function() {
    skipUpdated
      .then(function() {
        $uibModalInstance.dismiss();
        Recipe.start('intro');
      });
  };
}]);
