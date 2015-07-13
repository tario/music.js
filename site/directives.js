var musicShowCaseApp = angular.module("MusicShowCaseApp");

musicShowCaseApp.directive("musicObjectEditor", ["$timeout", "$http", "TypeService", "pruneWrapper", function($timeout, $http, TypeService, pruneWrapper) {
  return {
    scope: {
      file: "=file"
    },
    templateUrl: "objectEditor.html",
    link: function(scope, element, attrs) {
      var file;
      var constructor;
      var currentObject; 
      var currentSubObjects;
      var composition;
      var types = TypeService.getTypes();

      scope.composition = attrs.composition;
      scope.parameters = [];
      var getObject = function(file) { return file.object; };

      var truthy = function(x ) { return x; };
      var updateObject = function(newValue, subfiles) {
        var subobjects;

        var nullComposition = function(obj) {
          return obj([]);
        };

        if (subfiles) {
          subobjects = subfiles
            .map(getObject)
            .filter(truthy)
            .map(nullComposition) // apply null composition
            .map(pruneWrapper);
        }

        scope.parameters.forEach(function(parameter) {
          newValue[parameter.data.name] = parameter.value;
        });

        if (composition) {
          currentObject = function() {
            return constructor(newValue, subobjects);
          };
        } else {
          currentObject = function(subobjects) {
            return constructor(newValue, subobjects);
          };
        }

        $timeout(function() {
          scope.file.object = currentObject;
          if (currentObject && scope.file && scope.file.changed) scope.file.changed();
        });
      };

      var updateTemplate = function(file) {
        if (!file) return;

        types.then(function() {
          $timeout(function() {
            scope.selectedType = file.type;
            scope.object = file.object;

            TypeService.getType(file.type, function(type) {
              $timeout(function() {
                constructor = type.constructor;
                composition = type.composition || attrs.composition;
                scope.templateUrl = type.templateUrl;
                scope.type = type;
                if (type.parameters) {
                  scope.parameters = type.parameters.map(function(parameter) {
                    return {
                      data: parameter,
                    };
                  });
                }
                updateObject(file.data, currentSubObjects);
              });
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

      scope.$watch("parameters", fn.debounce(function(newValue) { 
        if (!scope.file) return;
        updateObject(scope.file.data, currentSubObjects); 
      },800), true);
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
      scope.collection.objects=scope.collection.objects||[];
      scope.maxElements = attrs.maxelements ? parseInt(attrs.maxelements) : Infinity;

      scope.stackObserver = {
        notify: function() {
          $timeout(function() {
            scope.observer.notify();
          });
        }
      };
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
        addObject({name: "New Object", changed: newObjectChanged, type: attrs.defaulttype || "test"})
      };
    }
  };
}]);

musicShowCaseApp.directive("musicStack", ["$timeout", function($timeout) {
  return {
    scope: {
      observer: "=observer",
      initFile: "=initFile",
      outputFile: "=outputFile"
    },
    templateUrl: "stack.html",
    link: function(scope, element, attrs) {
      scope.collection = [];
      var observer;

      var outputFile;
      var subfileChanged = function() {
        // do composition of stack
        outputFile.object = function(lastObj) {
          for (var i=scope.collection.length-1; i>=0; i--) {
            lastObj = scope.collection[i].object([lastObj]);
          }
          return lastObj;
        };

        $timeout(function() {
          observer.notify();
        });
      };

      var swap = function(idx1, idx2) {
        $timeout(function() {
          var tmp = scope.collection[idx1];
          scope.collection[idx1] = scope.collection[idx2];
          scope.collection[idx2] = tmp;

          subfileChanged();
        });
      };

      scope.up = function(idx) {
        swap(idx-1, idx);
      };

      scope.down = function(idx) {
        swap(idx+1, idx);
      };

      scope.remove = function(idx) {
        $timeout(function() {
          var oldCollection = scope.collection;
          scope.collection = [];
          for (var i=0; i<oldCollection.length; i++) {
            if (i!==idx) scope.collection.push(oldCollection[i]);
          }

          subfileChanged();
        });
      };

      scope.add = function() {
        $timeout(function() {
          scope.collection.push({changed: subfileChanged, data: {}});
        });
      };

      scope.$watch("outputFile", function(newOutputFile) {
        outputFile = newOutputFile;
      });
      scope.$watch("observer", function(newObserver) {
        observer = newObserver;
      });
      scope.$watch("initFile", function(newFile) {
        if (newFile) {
          newFile.changed = subfileChanged;
          scope.collection.push(newFile);
        }
      });
    }
  };  

}]);