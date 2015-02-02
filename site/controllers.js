var musicShowCaseApp = angular.module("MusicShowCaseApp");

musicShowCaseApp.controller("EditorController", function($scope, $timeout, $routeParams, $http, MusicContext, CodeRepository, KeyboardFactory) {
  var uri = $routeParams.uri;
  var exported;

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

      $scope.object = file.object; //object;
    });
  });

   $http.get("site/components/jseditor/runner.js")
     .then(function(result) {
      var runnerCode = result.data;
      var module = {export: function(){}};
      eval(runnerCode);

      exported = module.export(MusicContext);
   });

  var update = function(newValue) {
    if (!exported) return;      

    var resultArray = exported(newValue);
    $timeout(function() {
      $scope.playables = [];
      $scope.instruments = [];
      resultArray.forEach(processEntity);
    });
  };
  $scope.$watch("object", fn.debounce(update,800), true);

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



