var musicShowCaseApp = angular.module("MusicShowCaseApp");
musicShowCaseApp.factory("translationsLoader", ['$q', 'TypeService', 'esTranslations', 'enTranslations', function($q, TypeService, esTranslations, enTranslations) {
    return function(options) {
      var baseTranslation = {}

      if (options.key==='es') {
        baseTranslation = esTranslations;
      }

      if (options.key==='en') {
        baseTranslation = enTranslations;
      }

      return TypeService.loadTranslations(options)
        .then(function(tr) {
          for (var k in tr) {
            baseTranslation[k] = tr[k];
          }

          return baseTranslation;
        })

      var deferred = $q.defer();
      deferred.resolve(baseTranslation);
      return deferred.promise;
    };
}]);
