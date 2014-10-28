var musicShowCaseApp = angular.module("MusicShowCaseApp");

musicShowCaseApp.controller("MainController", function($scope, $http, MusicContext) {
  var music;

  $scope.editorOptions = {
        lineWrapping : true,
        lineNumbers: true,
        mode: 'javascript'
    };

    var run = function(code) { // TODO extract to service
      var results = MusicContext.run(code);
      if (results.error) {
        $scope.codeError = results.error;
      } else {
        $scope.codeError = null;
      }
      $scope.$digest();
    };

  $http.get("defaultCode.js").then(function(r) {
    $scope.code = r.data;
  });

  var timeoutHandle = undefined;
  $scope.$watch('code', function() {
    clearTimeout(timeoutHandle);
    timeoutHandle = setTimeout(function() {
      run($scope.code);
    }, 500);
  });

});



