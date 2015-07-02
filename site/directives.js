var musicShowCaseApp = angular.module("MusicShowCaseApp");

musicShowCaseApp.directive("musicObjectEditor", ["$timeout", "$http", "TypeService", "pruneWrapper", function($timeout, $http, TypeService, pruneWrapper) {
  return {
    scope: {
      file: "=file"
    },
    templateUrl: "objectEditor.html",
    link: function(scope, element, attrs) {
      var file;
      var exported;
      var currentObject; 
      var currentSubObjects;
      var types = TypeService.getTypes();

      var getObject = function(file) { return file.object; };

      var updateObject = function(newValue, subfiles) {
        var subobjects;

        if (subfiles) {
          subobjects = subfiles.map(getObject).map(pruneWrapper);
        }
        currentObject = exported(newValue, subobjects);
        $timeout(function() {
          scope.file.object = currentObject;
          if (scope.file && scope.file.changed) scope.file.changed();
        });
      };

      var updateTemplate = function(file) {
        if (!file) return;

        types.then(function() {
          $timeout(function() {
            scope.selectedType = file.type;
            scope.templateUrl = "site/components/"+file.type+"/index.html";
            scope.object = file.object;

            $http.get("site/components/" + file.type + "/runner.js")
              .then(function(result) {
              
              var runnerCode = result.data;
              var module = {export: function(){}};
              eval(runnerCode);

              exported = module.export;
              updateObject(file.data, currentSubObjects);
            });
          });
        });
      };
      if (scope.file) updateTemplate(scope.file);

      types.then(function(types) {
        scope.types = types;
      });
      
      var changeType = function(newValue) {
        if (!newValue) return;
        if (!scope.file) return;
        scope.file.type = newValue;
        updateTemplate(scope.file);
      };

      scope.observer = {
        notify: function() {
          // TODO: decouple multiobjects
          currentSubObjects = scope.file.objects;
          updateObject(scope.file.data, scope.file.objects);
        }
      };

      scope.$watch("selectedType", changeType)
      scope.$watch("file", updateTemplate);
      scope.$watch("file.data", fn.debounce(function(newValue) { updateObject(newValue, currentSubObjects); },800), true);
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
      scope.maxElements = attrs.maxelements ? parseInt(attrs.maxelements) : Infinity;
      var addObject = function(newObject) {
        $timeout(function() {
          var newObjectChanged = function() { 
            scope.observer.notify();
          };
          scope.collection.objects=scope.collection.objects||[];
          scope.collection.objects.push(newObject);

          scope.observer.notify();
        });
      };

      var newObjectChanged = function() { 
        scope.observer.notify();
      };
      if (attrs.minelements) {
        for (var i=0; i<parseInt(attrs.minelements); i++) {
          addObject({name: "New Object", changed: newObjectChanged, type: attrs.defaulttype || "test"});
        }
      }

      scope.addObject = function() {
        addObject({name: "New Object", changed: newObjectChanged})
      };
    }
  };
}]);