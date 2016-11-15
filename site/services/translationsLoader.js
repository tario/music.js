var musicShowCaseApp = angular.module("MusicShowCaseApp");
musicShowCaseApp.factory("translationsLoader", ['$q', 'TypeService', 'esTranslations', 'enTranslations', 'Recipe', function($q, TypeService, esTranslations, enTranslations, Recipe) {
    return function(options) {
      var baseTranslation = {}

      if (options.key==='es') {
        baseTranslation = esTranslations;
      }

      if (options.key==='en') {
        baseTranslation = enTranslations;
      }

      var addTranslations = function(tr) {
        for (var k in tr) {
          baseTranslation[k] = tr[k];
        }
      };

      return $q.all({
        typeTranslations: TypeService.loadTranslations(options),
        recipeTranslations: Recipe.loadTranslations(options)
      })
        .then(function(result) {
          addTranslations(result.typeTranslations);
          addTranslations(result.recipeTranslations);

          return baseTranslation;
        })
    };
}]);
