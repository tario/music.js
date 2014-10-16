var musicShowCaseApp = angular.module("MusicShowCaseApp", ['ui.codemirror']);

musicShowCaseApp.controller("MainController", function($scope, $http) {
	var music;
 	
 	$scope.editorOptions = {
        lineWrapping : true,
        lineNumbers: true,
        mode: 'javascript'
    };

    var run = function(code) { // TODO extract to service
    	if (music) {
    		music.dispose();
    	}

    	music = new MUSIC.Context();
		try {
		    eval(code);
		   	$scope.codeError = null;
		} catch (e) {
			$scope.codeError = e.stack;
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


