var musicShowCaseApp = angular.module("MusicShowCaseApp");
musicShowCaseApp.controller("midiSettingsModalCtrl", ["$scope", "$q", "$timeout", "$uibModalInstance", "Midi", function($scope, $q, $timeout, $uibModalInstance, Midi) {
  Midi.getInputs().then(function(inputs) {
    $scope.inputs = inputs;
  });

  Midi.getConfig().then(function(config) {
    $scope.config = config;
  });

  $scope.updateConfig = function() {
    Midi.setConfig($scope.config);
  };

  $scope.done = function() {
    $uibModalInstance.close();
  };
}]);
