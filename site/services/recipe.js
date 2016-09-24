var musicShowCaseApp = angular.module("MusicShowCaseApp");
musicShowCaseApp.factory("Recipe", ['$timeout', '$rootScope', function($timeout, $rootScope) {
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
      if (name === 'create_a_song') {
        currentRecipe.steps = [
          {
            blink: ['menu_new'],
            tooltip: {
              menu_new: 'Click "new" menu option'
            },
            eventHandler: next_step_on('menu_new_click')
          },
          { 
            blink: ['menu_new_pattern'],
            tooltip: {
              menu_new_pattern: 'Click "Pattern" menu option to create a new melodic pattern'
            },
            eventHandler: delay(next_step_on('menu_new_pattern_click'),500)
          },
          { 
            blink: ['pattern_instrument_dropzone', 'Square+ADSR'],
            tooltip: {
              'pattern_instrument_dropzone': 'this is the instrument dropzone',
              'Square+ADSR': "To start with, you will need to drag the instrument to the drop zone"
            },
            eventHandler: next_step_on('instrument_dropped')
          },
          {
            tooltip: {
              'pattern_instrument_dropzone': 'perfect! you just assigned the instrument to the track. Click this tooltip to continue',
            },
            eventHandler: next_step_on('tooltip_click')
          },
          {
            tooltip: {
              'pattern_track_event_area': 'Now, you can start to add musical notes'
            },
            eventHandler: next_step_on('tooltip_mouseover')
          }
        ];

        currentRecipe.currentStep = 0;
        runRecipeStep();
      }
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
