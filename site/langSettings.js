var musicShowCaseApp = angular.module("MusicShowCaseApp");

musicShowCaseApp.config(['$translateProvider', function ($translateProvider) {
  var getBrowserLanguage = function() {
    if (!$translateProvider.resolveClientLocale()) return 'en'
    var langCode = $translateProvider.resolveClientLocale().split("-")[0];
    if (!langCode) return 'en';
    return $translateProvider.translations()[langCode] ? langCode : 'en';
  };

  var currentLanguage = localStorage.getItem("lang");
  $translateProvider
    .preferredLanguage(currentLanguage || getBrowserLanguage());

  $translateProvider
    .fallbackLanguage('en');

  $translateProvider.useSanitizeValueStrategy(null);
  $translateProvider.useLoader('translationsLoader');

}]);
