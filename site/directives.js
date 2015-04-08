var musicShowCaseApp = angular.module("MusicShowCaseApp");

musicShowCaseApp.directive("musicObjectEditor", ["$timeout", "$http", "MusicContext", "TypeService", function($timeout, $http, MusicContext, TypeService) {
  return {
    scope: {
      file: "=file"
    },
    templateUrl: "objectEditor.html",
    link: function(scope, element, attrs) {
      var file;
      var exported;
      var currentObject; 

      var getObject = function(file) { return file.object; };

      var updateObject = function(newValue, subfiles) {
        var subobjects;

        if (subfiles) {
          subobjects = subfiles.map(getObject);
        }
        currentObject = exported(newValue, subobjects);
        scope.file.object = currentObject;
        if (scope.file && scope.file.changed) scope.file.changed();
      };

      var updateTemplate = function(file) {
        if (!file) return;
        scope.selectedType = file.type;
        scope.templateUrl = "site/components/"+file.type+"/index.html";
        scope.object = file.object;

        $http.get("site/components/" + file.type + "/runner.js")
          .then(function(result) {
          
          var runnerCode = result.data;
          var module = {export: function(){}};
          eval(runnerCode);

          exported = module.export(MusicContext);
          updateObject(file.data);
        });
      };
      if (scope.file) updateTemplate(scope.file);

      TypeService.getTypes().then(function(types) {
        scope.types = types;
      });
      
      var changeType = function(newValue) {
        if (!scope.file) return;
        scope.file.type = newValue;
        updateTemplate(scope.file);
      };

      scope.observer = {
        notify: function() {
          // TODO: decouple multiobjects
          updateObject(scope.file.data, scope.file.objects);
        }
      };

      scope.$watch("selectedType", changeType)
      scope.$watch("file", updateTemplate);
      scope.$watch("file.data", fn.debounce(function(newValue) { updateObject(newValue); },800), true);
    }
  };
}]);

musicShowCaseApp.directive("arrayEditor", ["$timeout", function($timeout) {
  return {
    scope: {
      collection: "=collection",
      observer: "=observer"
    },
    templateUrl: "arrayEditor.html",
    link: function(scope, element, attrs) {
      scope.addObject = function() {
        $timeout(function() {
          var newObjectChanged = function() { 
            scope.observer.notify();
          };
          var newObject = {name: "New Object", changed: newObjectChanged};
          scope.collection.objects=scope.collection.objects||[];
          scope.collection.objects.push(newObject);

          scope.observer.notify();
        });
      };
    }
  };
}]);