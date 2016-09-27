var musicShowCaseApp = angular.module("MusicShowCaseApp");
musicShowCaseApp.factory("Recipe", ['$timeout', '$rootScope', '$http', function($timeout, $rootScope, $http) {
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
      var step = currentRecipe.steps[currentStep||currentRecipe.currentStep];
      $rootScope.$broadcast("__blink_disable_all");
      $rootScope.$broadcast("__tooltip_hide_all");
      if (!step) return;

      (step.blink||[]).forEach(function(blink_id) {
        $rootScope.$broadcast("_blink_enable_" + blink_id);
      });

      for (var tooltip_id in step.tooltip||{}) {
        $rootScope.$broadcast("_tooltip_display_" + tooltip_id, {text: step.tooltip[tooltip_id]});
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

    var start = function(name) {
      var loadEventHandler = function(eventHandlerData) {
        if (eventHandlerData.next_step_on) {
          return next_step_on(eventHandlerData.next_step_on);
        } else if (eventHandlerData.delay) {
          return delay(loadEventHandler(eventHandlerData.inner), eventHandlerData.delay);
        }
      };

      var loadStep = function(stepData) {
        return {
          blink: stepData.blink,
          tooltip: stepData.tooltip,
          eventHandler: loadEventHandler(stepData.eventHandler)
        };
      };

      return $http.get("/recipes/" + name +".json")
        .then(function(result) {
          var recipeData = result.data;

          currentRecipe.steps = recipeData.steps.map(loadStep);
          currentRecipe.currentStep = 0;
          runRecipeStep();     
        });
    };

    start.raise = function(name) {
      handleEvent(name);
    };

    return {
      start: start,
      step: runRecipeStep,
      handleEvent: handleEvent
    };
}]);
