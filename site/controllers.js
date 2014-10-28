var musicShowCaseApp = angular.module("MusicShowCaseApp");

musicShowCaseApp.controller("MainController", function($scope, MusicContext, CodeRepository, KeyboardFactory) {
  var music;

  $scope.editorOptions = {
        lineWrapping : true,
        lineNumbers: true,
        mode: 'javascript'
    };

    var run = function(code) {
      var results = MusicContext.run(code);
      if (results.error) {
        $scope.codeError = results.error;
      } else {
        $scope.instruments = results.instruments.map(KeyboardFactory.keyboard);
        $scope.codeError = null;
      }
      $scope.$digest();
    };

  CodeRepository.getDefault().then(function(code) {
    $scope.code = code.replace(/\r\n/g, "\n"); // workaround for ui-codemirror bug
                                              // see https://github.com/angular-ui/ui-codemirror/issues/30
  });

  CodeRepository.getExampleList().then(function(examples) {
    $scope.examples = examples;
  });

  $scope.switchTo = function(ex) {
    CodeRepository.getExample(ex.uri).then(function(code) {
      $scope.code = code.replace(/\r\n/g, "\n"); // workaround for ui-codemirror bug
                                                // see https://github.com/angular-ui/ui-codemirror/issues/30
    });
  };

  var timeoutHandle = undefined;
  $scope.$watch('code', function() {
    clearTimeout(timeoutHandle);
    timeoutHandle = setTimeout(function() {
      run($scope.code);
    }, 500);
  });

});



