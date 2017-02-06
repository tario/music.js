var musicShowCaseApp = angular.module("MusicShowCaseApp");
musicShowCaseApp.factory("Recipe", ['$q', '$timeout', '$rootScope', '$http', 'Index', 'FileRepository', function($q, $timeout, $rootScope, $http, Index, FileRepository) {

    var recipeList = ['intro', 'create_a_song', 'create_an_instrument'];
    var blinks = [];

    var currentRecipe = {
      steps: [],
      currentStep: 0
    };

    var handleEvent = function(event, args) {
      var step = currentRecipe.steps[currentRecipe.currentStep];

      if (!step) return;
      if (step.eventHandler) step.eventHandler(event, args);
    };

    var runRecipeStep = function(currentStep) {
      currentStep = currentStep||currentRecipe.currentStep;

      var step = currentRecipe.steps[currentStep];

      blinks = [];

      $rootScope.$broadcast("__blink_disable_all");
      $rootScope.$broadcast("__tooltip_hide_all");
      if (!step) {
        // recipe ends
        Index.isolatedContext = null;
        FileRepository.changed();

        return;
      }

      (step.blink||[]).forEach(function(blink_id) {
        blinks.push(blink_id);
        $rootScope.$broadcast("_blink_enable_" + blink_id);
      });

      for (var tooltip_id in step.tooltip||{}) {
        $rootScope.$broadcast("_tooltip_display_" + tooltip_id, {text: step.tooltip[tooltip_id]});
      }

      if (step.duration) {
        $timeout(function() {
          if (currentRecipe.currentStep <= currentStep) {
            currentRecipe.currentStep = currentStep + 1;
            runRecipeStep();
          }
        }, step.duration*1000);
      }
    };

    var next_step_on = function(eventName) {
      return function(event, args) {
        if (event === eventName) {
          currentRecipe.currentStep++;
          runRecipeStep();
        }
      }
    };

    var delay = function(fcn, ms) {
      return function(event, args) {
        $timeout(function() {
          fcn(event, args);
        }, ms);
      };
    };

    var getLocaleName = function(stepIndex, tooltipName) {
       return "s"+stepIndex+"_tooltip_" + tooltipName;
    };

    var start = function(name) {
      var loadEventHandler = function(eventHandlerData) {
        if (eventHandlerData.next_step_on) {
          return next_step_on(eventHandlerData.next_step_on);
        } else if (eventHandlerData.delay) {
          return delay(loadEventHandler(eventHandlerData.inner), eventHandlerData.delay);
        }
      };

      var loadStep = function(stepData, stepIndex) {

        var tr = {};
        for (var k in stepData.tooltip) {
          tr[k] = "recipe" + "." + name + "." + getLocaleName(stepIndex, k);
        }

        return {
          blink: stepData.blink,
          tooltip: tr,
          eventHandler: loadEventHandler(stepData.eventHandler),
          duration: stepData.duration
        };
      };

      return $http.get("recipes/" + name +".json")
        .then(function(result) {
          var recipeData = result.data;

          if (result.data.isolatedContext) {
            Index.isolatedContext = result.data.isolatedContext + Math.floor(Date.now() / 1000);
            FileRepository.changed();
          }

          currentRecipe.steps = recipeData.steps.map(loadStep);
          currentRecipe.currentStep = 0;
          runRecipeStep();     
        });
    };

    start.raise = function(name) {
      handleEvent(name);
    };

    var loadTranslations = function(options) {
      var key = options.key;

      var loadRecipeTranslation = function(name) {
        return $http.get("recipes/" + name +".json")
          .then(function(result) {
            var recipeData = result.data;
            if (!recipeData.lang) return {};

            var langIndex = recipeData.lang.indexOf(key);
            if (langIndex === -1) return {}

            var data = {};
            recipeData.steps.forEach(function(step, stepIndex) {
              if (step.tooltip) {
                for (var k in step.tooltip) {
                  var tp = step.tooltip[k];
                  var localeName = getLocaleName(stepIndex, k);
                  if (Array.isArray(tp)) {
                    data[localeName] = tp[langIndex];
                  } else {
                    if (langIndex===0) {
                      data[localeName] = tp;
                    }
                  }
                }
              }
            });

            return data;
          });
      };

      var actions = {};
      recipeList.forEach(function(recipeId) {
        actions[recipeId] = loadRecipeTranslation(recipeId);
      });

      return $q.all(actions)
        .then(function(recipeTranslationData) {
          return {
            recipe: recipeTranslationData
          };
        })
    };

    var getBlinks = function() {
      return blinks;
    };

    return {
      start: start,
      step: runRecipeStep,
      handleEvent: handleEvent,
      loadTranslations: loadTranslations,
      getBlinks: getBlinks
    };
}]);
