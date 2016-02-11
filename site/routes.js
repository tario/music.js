var musicShowCaseApp = angular.module("MusicShowCaseApp");

musicShowCaseApp.config(["$routeProvider", "$locationProvider", function($routeProvider, $locationProvider) {
  $routeProvider
   .when('/editor/:id', {
    templateUrl: 'site/templates/editor.html',
    controller: 'EditorController'
  });

  // configure html5 to get links working on jsfiddle
  //$locationProvider.html5Mode(true);
}]);;



