var musicShowCaseApp = angular.module("MusicShowCaseApp");

musicShowCaseApp.controller("EditorController", function($scope, $timeout, $routeParams, $http, MusicContext, CodeRepository, KeyboardFactory, MusicObjectFactory) {
  var uri = $routeParams.uri;

  var lastObj;
  var fileChanged = fn.debounce(function(newFile) {
    if (!$scope.file) return;
    
    MusicObjectFactory($scope.file)
      .then(function(obj) {
          if (obj !== lastObj) {
            $scope.instruments = [];
            $scope.playables = [];
            if (obj.note) {
              // instrument
              $scope.instruments.push(KeyboardFactory.keyboard(obj));
            } else if (obj.play) {
              $scope.playables.push(obj);
            }
          }
          lastObj = obj;
      });
  }, 50);
  $scope.$watch('file', fileChanged, true);

  CodeRepository.getExample(uri).then(function(file) {
    $timeout(function() {
      var outputFile = {};

      if (file.data.code) {
         file.data.code = file.data.code.replace(/\r\n/g, "\n");
      }
      $scope.outputFile = outputFile;
      $scope.file = file;
      $scope.observer = {};

      $scope.observer.notify = function() {
        $timeout(function() {
          $scope.instruments = [];
          $scope.playables = [];
          /*var obj = MusicContext.runFcn(function(music) {
            return outputFile.object(null)(music);
          });*/
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



