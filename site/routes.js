var musicShowCaseApp = angular.module("MusicShowCaseApp");

musicShowCaseApp.config(["$routeProvider", "$locationProvider", function($routeProvider, $locationProvider) {
  $routeProvider
    .when('/editor/instrument/:id', {
      templateUrl: 'site/templates/editor.html',
      controller: 'EditorController'
    })
    .when('/editor/song/:id', {
      templateUrl: 'site/templates/songEditor.html',
      controller: 'SongEditorController'
    });

  // configure html5 to get links working on jsfiddle
  //$locationProvider.html5Mode(true);
}]);;



