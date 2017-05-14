var musicShowCaseApp = angular.module("MusicShowCaseApp");
musicShowCaseApp.controller("midiSettingsModalCtrl", ["$scope", "$q", "$timeout", "$uibModalInstance", "Midi", function($scope, $q, $timeout, $uibModalInstance, Midi) {
  Midi.getInputs().then(function(inputs) {
    $scope.inputs = inputs;
  });

  $scope.done = function() {
    $uibModalInstance.close();
  };
}]);
