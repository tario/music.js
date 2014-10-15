var musicShowCaseApp = angular.module("MusicShowCaseApp", []);

musicShowCaseApp.controller("MainController", function($scope, $http) {
	var music = new MUSIC.Context();
	$http.get("/defaultCode.js").then(function(r) {
		$scope.code = r.data;
		eval($scope.code);
	});

	$scope.run = function() {
		eval($scope.code);
	};
});


