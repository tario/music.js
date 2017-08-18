var musicShowCaseApp = angular.module("MusicShowCaseApp");

musicShowCaseApp.directive("musicObjectEditor", ["$timeout", "$http", "TypeService", "Recipe", "MusicObjectFactory", function($timeout, $http, TypeService, Recipe, MusicObjectFactory) {
  return {
    scope: {
      file: "=file"
    },
    templateUrl: "site/templates/objectEditor.html",
    link: function(scope, element, attrs) {
      var file;
      var types = TypeService.getTypes();

      scope.output = {};

      scope.parameters = [];
      scope.recipe = Recipe.start;
      scope.termschanged = function() {
        scope.$broadcast('termschanged');
      };

      scope.f_t = function(str, state) {
        try {
          var ret = eval("(function(t) { return " + str + "; })");
          delete state.error;

          return ret;
        } catch(e) {
          state.error = e.toString();
          throw e;
        }
      };

      scope.oscTermsUpdateFromWaveForm = fn.debounce(function(waveform, terms, resolution) {

        try {
          var waveform = eval("(function(t) { return " + waveform + "; })");
          var count = resolution;
          var values = new Array(count);
          for (var i = 0; i < count; i++) {
            values[i] = waveform(i/count);
            if (isNaN(values[i])) throw "Not a number: " + values[i];
          }

          var ft = new DFT(values.length);
          ft.forward(values);

          for (var i=0;i<count;i++) {
            terms.cos[i] = ft.real[i];
            terms.sin[i] = ft.imag[i];
          }
          terms.cos.length = ft.real.length/2;
          terms.sin.length = ft.imag.length/2;

          var f = function(t){
            var ret = 0;
            for (var i=1;i<count/2;i++) {
              var a = terms.sin[i];
              var b = terms.cos[i];

              ret = ret + a * Math.sin(t*2*Math.PI*i);
              ret = ret + b * Math.cos(t*2*Math.PI*i);
            }
            return ret;
          };

          var maxvalue = 0;
          var count = terms.sin.length;
          for (var i=0; i<count; i++) {
            var value = f(i/count);
            if (value>maxvalue) {
              maxvalue=value;
            } else if (value<-maxvalue) {
              maxvalue=-value;
            }
          }

          for (var i=0;i<count;i++) {
            terms.sin[i] = terms.sin[i] / maxvalue;
            terms.cos[i] = terms.cos[i] / maxvalue;
          }

          $timeout(function() {
            scope.invalidWaveform = false;
          });
          scope.$broadcast('termschanged');
        } catch (err) {
          $timeout(function() {
            scope.invalidWaveform = err.toString();
          });
        }

      },400);

      scope.oscTermsUpdate = fn.debounce(function(serie, terms, errVar) {

        try {
          var serie = eval("(function(n) { return " + serie + "; })");
          for (var n=1;n<512;n++) {
            terms[n]=serie(n);
            if (isNaN(terms[n])) throw "Not a number: " + terms[n];
  
          }
          scope[errVar] = false;
          $timeout(function() {
            scope.$broadcast('termschanged');
          });
        } catch (err) {
          $timeout(function() {
            scope[errVar] = err.toString();
          });
        }
      },400);

      scope.range = function(init, end) {
        var x = [];
        for (var i=init;i<=end;i++) {
          x.push(i);
        }
        return x;
      };

      var truthy = function(x ) { return x; };
      var updateObject = function(newValue) {
        $timeout(function() {
          if (scope.file && scope.file.changed) scope.file.changed();
        });
      };

      var outputObserver;
      scope.$on("$destroy", function() {
        if (outputObserver) outputObserver.destroy();
      });

      var updateTemplate = function(file) {
        if (!file) return;

        if (outputObserver) outputObserver.destroy();
        var outputObserver = MusicObjectFactory().observeOutput(file, function(output) {
          $timeout(function() {
            scope.output = output;
          });
        });

        types.then(function() {
          $timeout(function() {
            scope.selectedType = file.type;

            TypeService.getType(file.type, function(type) {
              $timeout(function() {
                scope.templateUrl = type.templateUrl;
                scope.type = type;

                for (var k in type._default) {
                  if (typeof file.data[k] === "undefined") {
                    file.data[k] =type._default[k];
                  }
                }

                if (type.parameters) {
                  scope.parameters = type.parameters.map(function(parameter) {
                    return {
                      name: parameter.name,
                      data: parameter,
                      value: file.data && typeof file.data[parameter.name] !== "undefined" ? file.data[parameter.name] : parameter.value
                    };
                  });
                }
                if (type.components) {
                  scope.modulations = (type.components||[]).map(function(component) {
                    return {
                      name: component,
                      value: (file.data && file.data.modulation && file.data.modulation[component])|| {
                        type: "stack",
                        data: {
                          array: []
                        }
                      }
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

      scope.$watch("modulations", function(newValue) {
        if (!scope.modulations) return;
        scope.modulations.forEach(function(modulation) {
          scope.file.data.modulation = scope.file.data.modulation||{};
          scope.file.data.modulation[modulation.name] = modulation.value;
        }); 
        scope.$emit("objectChanged");
      }, true);

      scope.$watch("parameters", function(newValue) {
        if (!scope.parameters) return;
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

musicShowCaseApp.directive("arrayEditor", ["$timeout", "Recipe", function($timeout, Recipe) {
  return {
    scope: {
      data: "=data"
    },
    templateUrl: "site/templates/arrayEditor.html",
    link: function(scope, element, attrs) {
      scope.data.subobjects=scope.data.subobjects||[];
      scope.maxElements = attrs.maxelements ? parseInt(attrs.maxelements) : Infinity;
      scope.currentTab = 0;
      scope.recipe = Recipe.start;

      var addObject = function(newObject) {
        $timeout(function() {
          scope.data.subobjects=scope.data.subobjects||[];
          scope.data.subobjects.push(newObject);
          scope.setCurrentTab(scope.data.subobjects.length-1);
        });
      };

      scope.setCurrentTab = function(idx) {
        scope.currentTab = idx;
      };

      scope.removeObject = function(object) {
        scope.data.subobjects = scope.data.subobjects.filter(function(o) {return o !== object; });
      };

      scope.addObject = function() {
        addObject({data: {array: []}, type: "stack"})
      };

      if (scope.data.subobjects.length === 0) {
        scope.addObject();
      }
    }
  };
}]);

musicShowCaseApp.directive("musicStack", ["$timeout", "Recipe", "TypeService", function($timeout, Recipe, TypeService) {
  return {
    scope: {
      initFile: "=initFile",
      dropzoneExtraName: "=dropzoneExtraName"
    },
    templateUrl: "site/templates/stack.html",
    link: function(scope, element, attrs) {
      scope.recipe = Recipe.start;

      var swap = function(idx1, idx2) {
        scope.$emit("stackChanged");

        $timeout(function() {
          var tmp = scope.file.array[idx1];
          scope.file.array[idx1] = scope.file.array[idx2];
          scope.file.array[idx2] = tmp;
        });
      };

      var defaultStackAppend = function(file, data) {
        file.array = [{
          type: data.name,
          data: {}
        }].concat(file.array);
      };

      scope.onDropComplete = function(data, event) {
        if (data.type === "fx") {
          TypeService.getType(data.name)
            .then(function(type) {
              (type.stackAppend ||defaultStackAppend)(scope.file, data);
              scope.$emit("stackChanged");
            });
        }
      };

      scope.up = function(idx) {
        swap(idx-1, idx);
      };

      scope.down = function(idx) {
        swap(idx+1, idx);
      };

      scope.remove = function(idx) {
        scope.$emit("stackChanged");

        $timeout(function() {
          var oldCollection = scope.file.array;
          scope.file.array = [];
          for (var i=0; i<oldCollection.length; i++) {
            if (i!==idx) scope.file.array.push(oldCollection[i]);
          }
        });
      };

      scope.add = function() {
        scope.$emit("stackChanged");

        $timeout(function() {
          scope.file.array.push({data: {}, type: "null"});
        });
      };

      scope.$watch("initFile", function(newFile) {
        if (newFile) {
          scope.file = newFile.data;
        }
      });
    }
  };  

}]);

musicShowCaseApp.directive("customOscGraph", ["$timeout", function($timeout) {
  return {
    scope: {
      terms: "=terms"
    },
    template: '<function-graph f="f" samples=64 t0="0" tf="1" scaley="0.8"></function-graph>',
    link: function(scope, element, attrs) {
      var termsChanged = function() {
        scope.f = function(t){
          var ret = 0;
          for (var i=1;i<scope.terms.sin.length;i++) {
            var a = scope.terms.sin[i];
            var b = scope.terms.cos[i];

            ret = ret + a * Math.sin(t*2*Math.PI*i);
            ret = ret + b * Math.cos(t*2*Math.PI*i);
          }
          return ret;
        };
      };

      scope.f = function() { return 0; };
      scope.$on("termschanged", fn.debounce(termsChanged,10));

      termsChanged();
    }
  };
}]);

musicShowCaseApp.directive("showScale", ["$timeout", function($timeout) {
  return {
    scope: {
      scale: "=scale"
    },
    template: '<div class="note-cell" ng-repeat="note in notes">{{note}}</div><div class="note-cell" ng-repeat="note in notes">{{note}}</div>',
    link: function(scope, element, attrs) {
      var semitoneToNote = function(n) {
        return [0,[0,1], 1, [1,2], 2, 3, [3,4], 4, [4,5], 5, [5,6], 6][n%12];
      };

      var noteToSemitone = function(n) {
        return [0,2,4,5,7,9,11][n%7];
      };

      var notation7 = function(n) {
        return ["C","D","E","F","G","A","B"][n % 7];
      };

      scope.$watch("scale", function(newVal) {
        $timeout(function() {
          var scale = MUSIC.Utils.Scale(newVal);
          var deltas = [0,1,2,3,4,5,6];

          var initTone = semitoneToNote(newVal);
          if (initTone.length) initTone = initTone[1];

          scope.notes = deltas.map(function(d) {
            var semitone = scale.add(newVal,d);
            var tone = (initTone + d) % 7;
            var alt = "";

            if (noteToSemitone(tone) > semitone % 12) alt = "b";
            if (noteToSemitone(tone) < semitone % 12) alt = "#";
            return notation7(tone) + alt;
          });
        });
      });
    }
  };
}]);

musicShowCaseApp.directive("ngScrollTop", ["$parse", "$timeout", function($parse, $timeout) {
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      var scrollVarGetter = $parse(attrs.ngScrollTop);
      var scrollVarSetter = scrollVarGetter.assign;

      scope.$watch(attrs.ngScrollTop, function() {
        $(element).scrollTop(scrollVarGetter(scope));
      });

      element.on('scroll', function() {
        $timeout(function() {
          scrollVarSetter(scope, $(element).scrollTop());
        });
      });
    }
  };
}]);

musicShowCaseApp.directive("ngScrollLeft", ["$parse", "$timeout", function($parse, $timeout) {
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      var scrollVarGetter = $parse(attrs.ngScrollLeft);
      var scrollVarSetter = scrollVarGetter.assign;

      scope.$watch(attrs.ngScrollLeft, function() {
        $(element).scrollLeft(scrollVarGetter(scope));
      });

      element.on('scroll', function() {
        $timeout(function() {
          scrollVarSetter(scope, $(element).scrollLeft());
        });
      });
    }
  };
}]);

