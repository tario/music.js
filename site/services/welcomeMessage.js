var musicShowCaseApp = angular.module("MusicShowCaseApp");
musicShowCaseApp.factory("WelcomeMessage", ['$cookies', function($cookies) {
    var skip = function() {
      return !!$cookies.get("welcome_skip");
    };

    var setSkip = function(value) {
      if (value) {
        $cookies.put("welcome_skip", value);
      } else {
        $cookies.remove("welcome_skip");
      }
    };

    return {
      setSkip: setSkip,
      skip: skip
    };
}]);
