var musicShowCaseApp = angular.module("MusicShowCaseApp");

musicShowCaseApp.controller("EditorController", function($scope, $timeout, $routeParams, $http, MusicContext, CodeRepository, KeyboardFactory) {
  var uri = $routeParams.uri;
  var processEntity = function(entity) {
    if (entity.playable) {
      $scope.playables.push(entity);
    };
    if (entity.instrument) {
      $scope.instruments.push(KeyboardFactory.keyboard(entity));
    };
  };

  CodeRepository.getExample(uri).then(function(file) {
    $timeout(function() {
      if (file.object.code) {
         file.object.code = file.object.code.replace(/\r\n/g, "\n");
      }
      $scope.file = file;
    });
  });

  $scope.observer = {
    changed: function(newValue) {
      $timeout(function() {
        $scope.instruments = [];
        $scope.playables = [];
        newValue.forEach(processEntity);
      });
    }
  };
});

musicShowCaseApp.controller("MainController", function($scope, $timeout, MusicContext, CodeRepository, KeyboardFactory) {
  var music;

  CodeRepository.getExampleList().then(function(examples) {
    $scope.examples = examples;
  });

  $scope.switchTo = function(example) {
    document.location = "/#/editor/"+example.uri;
  };
});



