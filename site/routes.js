var musicShowCaseApp = angular.module("MusicShowCaseApp");

musicShowCaseApp.config(["$routeProvider", "$locationProvider", function($routeProvider, $locationProvider) {
  $routeProvider
    .when('/editor/:project/instrument/:id', {
      templateUrl: 'site/templates/editor.html',
      controller: 'EditorController'
    })
    .when('/editor/:project/song/:id', {
      templateUrl: 'site/templates/songEditor.html',
      controller: 'SongEditorController'
    })
    .when('/editor/:project/pattern/:id', {
      templateUrl: 'site/templates/patternEditor.html',
      controller: 'PatternEditorController'
    })
    .when('/editor/:project', {
      templateUrl: 'site/templates/dashboard.html',
      controller: 'ProjectDashboardController'
    })
    .when('/', {
      templateUrl: 'site/templates/dashboard.html',
      controller: 'DashboardController'
    });

  // configure html5 to get links working on jsfiddle
  //$locationProvider.html5Mode(true);
}]);;



