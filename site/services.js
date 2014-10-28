var musicShowCaseApp = angular.module("MusicShowCaseApp", ['ui.codemirror']);
angular.module("MusicShowCaseApp").service("MusicContext", function() {
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

