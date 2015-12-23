var musicShowCaseApp = angular.module("MusicShowCaseApp");

musicShowCaseApp.directive("musicObjectEditor", ["$timeout", "$http", "TypeService", function($timeout, $http, TypeService) {
  return {
    scope: {
      file: "=file"
    },
    templateUrl: "objectEditor.html",
    link: function(scope, element, attrs) {
      var file;
      var types = TypeService.getTypes();

      scope.parameters = [];

      var truthy = function(x ) { return x; };
      var updateObject = function(newValue) {
        scope.parameters.forEach(function(parameter) {
          newValue[parameter.data.name] = parameter.value;
        });

        $timeout(function() {
          if (scope.file && scope.file.changed) scope.file.changed();
        });
      };

      var updateTemplate = function(file) {
        if (!file) return;

        types.then(function() {
          $timeout(function() {
            scope.selectedType = file.type;

            TypeService.getType(file.type, function(type) {
              $timeout(function() {
                scope.templateUrl = type.templateUrl;
                scope.type = type;
                if (type.parameters) {
                  scope.parameters = type.parameters.map(function(parameter) {
                    return {
                      data: parameter,
                    };
                  });
                }
                updateObject(file.data);
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

      scope.$watch("parameters", function(newValue) {
        scope.parameters.forEach(function(parameter) {
          scope.file.data[parameter.data.name] = parameter.value;
        }); 
        scope.$emit("objectChanged");
      }, true);
      scope.$watch("selectedType", changeType)
      scope.$watch("file", updateTemplate);
      //scope.$watch("file.data", fn.debounce(function(newValue) { debugger; },800), true);
    }
  };
}]);

musicShowCaseApp.directive("arrayEditor", ["$timeout", function($timeout) {
  return {
    scope: {
      collection: "=collection"
    },
    templateUrl: "arrayEditor.html",
    link: function(scope, element, attrs) {
      scope.collection.objects=scope.collection.objects||[];
      scope.maxElements = attrs.maxelements ? parseInt(attrs.maxelements) : Infinity;

      var addObject = function(newObject) {
        $timeout(function() {
          scope.collection.objects=scope.collection.objects||[];
          scope.collection.objects.push(newObject);
        });
      };

      if (attrs.minelements) {
        for (var i=0; i<parseInt(attrs.minelements); i++) {
          addObject({name: "New Object", type: attrs.defaulttype || "null"});
        }
      }

      scope.addObject = function() {
        addObject({name: "New Object", type: attrs.defaulttype || "null"})
      };
    }
  };
}]);
musicShowCaseApp.directive("compressedElement", function() {
    return {
      scope: {},
      templateUrl: "compressed.html",
      transclude: true,
      link: function(scope, element, attrs) {
        scope.compressed = true;
      }
    };
});

musicShowCaseApp.directive("musicStack", ["$timeout", function($timeout) {
  return {
    scope: {
      initFile: "=initFile",
      outputFile: "=outputFile"
    },
    templateUrl: "stack.html",
    link: function(scope, element, attrs) {
      scope.collection = [];

      var outputFile;
      var swap = function(idx1, idx2) {
        $timeout(function() {
          var tmp = scope.collection[idx1];
          scope.collection[idx1] = scope.collection[idx2];
          scope.collection[idx2] = tmp;
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
        });
      };

      scope.add = function() {
        $timeout(function() {
          scope.collection.push({data: {}, type: "null"});
        });
      };

      scope.$watch("outputFile", function(newOutputFile) {
        outputFile = newOutputFile;
      });
      scope.$watch("initFile", function(newFile) {
        if (newFile) {
          scope.collection = newFile.data.array;
        }
      });
    }
  };  

}]);