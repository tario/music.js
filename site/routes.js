var musicShowCaseApp = angular.module("MusicShowCaseApp");

musicShowCaseApp.config(["$routeProvider", "$locationProvider", function($routeProvider, $locationProvider) {
  $routeProvider
    .when('/editor/instrument/:id', {
      templateUrl: 'site/templates/editor.html',
      controller: 'EditorController'
    })
    .when('/editor/song/:id', {
      templateUrl: 'site/templates/songEditor.html',
      controller: 'SongEditorController',
      resolve: {
        indexMap: ["$route", "$q", "FileRepository", function($route, $q, FileRepository) {
          var id = $route.current.params.id;
          var block_ids = {};

          return FileRepository.getFile(id)
            .then(function(file) {
              if (file) {
                file.contents.tracks.forEach(function(track) {
                  track.blocks.forEach(function(block){
                    if (block && block.id) {
                      if (!block_ids[block.id]){
                        block_ids[block.id] = FileRepository.getIndex(block.id);
                      }
                    }
                  })
                });
              };

              return $q.all(block_ids);
            });
        }]
      }
    })
    .when('/editor/pattern/:id', {
      templateUrl: 'site/templates/patternEditor.html',
      controller: 'PatternEditorController'
    });

  // configure html5 to get links working on jsfiddle
  //$locationProvider.html5Mode(true);
}]);;



