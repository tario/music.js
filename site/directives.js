var musicShowCaseApp = angular.module("MusicShowCaseApp");

musicShowCaseApp.directive("editor", function() {

  return {
    scope: {
      object: "=object"
    },
    templateUrl: function(elem, attr) {
      return "site/components/jseditor/index.html";
    },
    link: function(scope, element, attrs) {
    }
  };

});



