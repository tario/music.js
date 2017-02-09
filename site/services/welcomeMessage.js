var musicShowCaseApp = angular.module("MusicShowCaseApp");
musicShowCaseApp.factory("WelcomeMessage", ['localforage', function(localforage) {
    var skip = function() {
      return localforage.getItem("welcome_skip")
        .then(function(result) {
          return !!result;
        });
    };

    var setSkip = function(value) {
      if (value) {
        return localforage.setItem("welcome_skip", value);
      } else {
        return localforage.removeItem("welcome_skip");
      }
    };

    return {
      setSkip: setSkip,
      skip: skip
    };
}]);
