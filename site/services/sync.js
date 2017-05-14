var musicJs = angular.module("MusicShowCaseApp");
musicJs.factory("Sync", ['$q', function($q) {
  return function() {
    var promise = $q.when();
    this.sync = function(f) {
      return function() {
        var _args = arguments;
        var _self = this;
        var defer = $q.defer();

        promise = promise.then(function() {
          return f.apply(_self, _args)
            .then(function(value) {
              defer.resolve(value);
            })
            .catch(function(err) {
              defer.reject(err);
            });
        });
        return defer.promise;
      };
    };
  };
}]);
