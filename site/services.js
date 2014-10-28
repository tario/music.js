var musicShowCaseApp = angular.module("MusicShowCaseApp", ['ui.codemirror']);
musicShowCaseApp.service("MusicContext", function() {
  var music;
  return {
    run: function(code) {
      if (music) {
        music.dispose();
      }
      music = new MUSIC.Context();

      try {
        eval(code);
        return {};
      } catch(e) {
        return {error: e.toString()};
      }
    }
  };
});

musicShowCaseApp.service("CodeRepository", function($http) {
  return {
    getDefault: function() {
      return $http.get("defaultCode.js").then(function(r) {
        return r.data;
      });
    }
  };
});
