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
      $scope.observer = {};
      $scope.observer.notify = function() {
        $timeout(function() {
          $scope.instruments = [];
          $scope.playables = [];

          var obj = MusicContext.runFcn(function(music) {
            return file.object(music);
          });

          if (obj.note) {
            // instrument
            $scope.instruments.push(KeyboardFactory.keyboard(obj));
          } else if (obj.play) {
            $scope.playables.push(obj);
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



