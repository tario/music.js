var musicShowCaseApp = angular.module("MusicShowCaseApp");

musicShowCaseApp.controller("MainController", function($scope, MusicContext, CodeRepository) {
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
        $scope.codeError = null;
      }
      $scope.$digest();
    };

  CodeRepository.getDefault().then(function(code) {
    $scope.code = code;
  });

  var timeoutHandle = undefined;
  $scope.$watch('code', function() {
    clearTimeout(timeoutHandle);
    timeoutHandle = setTimeout(function() {
      run($scope.code);
    }, 500);
  });

});



