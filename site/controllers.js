var musicShowCaseApp = angular.module("MusicShowCaseApp");

musicShowCaseApp.controller("EditorController", function($scope, $timeout, $routeParams, $http, MusicContext, CodeRepository, KeyboardFactory) {
  var uri = $routeParams.uri;

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

          if (file.object.note) {
            // instrument
            $scope.instruments.push(KeyboardFactory.keyboard(file.object));
          } else if (file.object.play) {
            $scope.playables.push(file.object);
          }
        });
      };

    });
  });

  $scope.startPlay = function(playable) {
    playable.playing = playable.play();
  };

  $scope.stopPlay = function(playable) {
    if (!playable.playing) return;
    playable.playing.stop();
    playable.playing = undefined;
  };

});

musicShowCaseApp.controller("MainController", function($scope, $timeout, MusicContext, CodeRepository, KeyboardFactory) {
  var music;

  CodeRepository.getExampleList().then(function(examples) {
    $scope.examples = examples;
  });

  $scope.switchTo = function(example) {
    document.location = "#/editor/"+example.uri;
  };
});



