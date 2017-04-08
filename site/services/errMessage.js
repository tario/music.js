var musicShowCaseApp = angular.module("MusicShowCaseApp");
musicShowCaseApp.factory("ErrMessage", ['$uibModal', '$translate', function($uibModal, $translate) {
  return function(title, text) {
    var modalIns = $uibModal.open({
      templateUrl: "site/templates/modal/error.html",
      controller: "errorModalCtrl",
      windowClass: 'error',
      resolve: {
        text: function() {
          return $translate(text);
        },
        title: function() {
          return $translate(title);
        }
      }
    });

    return modalIns;
  };
}]);
