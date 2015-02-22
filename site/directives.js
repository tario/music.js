var musicShowCaseApp = angular.module("MusicShowCaseApp");

musicShowCaseApp.directive("musicObjectEditor", ["$timeout", "$http", "MusicContext", function($timeout, $http, MusicContext) {
  return {
    scope: {
      file: "=file",
      observer: "=observer"
    },
    templateUrl: "objectEditor.html",
    link: function(scope, element, attrs) {
      var file;
      var exported;
      var currentObject; 

      var updateObject = function(newValue) {
        if (!newValue) return;
        currentObject = exported(newValue);
        if (scope.observer) scope.observer.changed(currentObject);
      };

      var updateTemplate = function(file) {
        if (!file) return;
        scope.templateUrl = "site/components/"+file.type+"/index.html";
        scope.object = file.object;

        $http.get("site/components/" + file.type + "/runner.js")
          .then(function(result) {
          
          var runnerCode = result.data;
          var module = {export: function(){}};
          eval(runnerCode);

          exported = module.export(MusicContext);
        });
      };
      if (scope.file) updateTemplate(scope.file);
      
      scope.$watch("file", updateTemplate);
      scope.$watch("object", fn.debounce(updateObject,800), true);
    }
  };
}]);