var musicShowCaseApp = angular.module("MusicShowCaseApp", ['ui.codemirror']);

musicShowCaseApp.controller("MainController", function($scope, $http) {
	var music = new MUSIC.Context();
 	
 	$scope.editorOptions = {
        lineWrapping : true,
        lineNumbers: true,
        mode: 'javascript'
    };

	$http.get("defaultCode.js").then(function(r) {
		$scope.code = r.data;
		eval($scope.code);
	});

	$scope.run = function() {
		eval($scope.code);
	};
});


