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
      file = Object.create(file);
      if (file.data.code) {
         file.data.code = file.data.code.replace(/\r\n/g, "\n");
      }
      $scope.file = file;
      $scope.file.changed = function() {
        $timeout(function() {
          $scope.instruments = [];
          $scope.playables = [];
          file.object.forEach(processEntity);
        });
      };

    });
  });

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



