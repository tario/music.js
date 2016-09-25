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
              'pattern_track_event_area': 'Now, you can add musical notes. Click the area above to insert new notes,' +
                ' you can drag them to reassign value and position, and change the duration by dragging from the edge.\n' +
                ' add as many as you want and then click this window to continue'
            },
            eventHandler: next_step_on('tooltip_click')
          },
          {
            blink: ['pattern_play'],
            tooltip: {
              'pattern_play': 'Click this button to hear your creation'
            },
            eventHandler: next_step_on('pattern_play_click')
          },
          {
            tooltip: {
              'pattern_play': 'Good! the music is playing...'
            },
            eventHandler: next_step_on('pattern_play_stopped')
          },
          {
            tooltip: {
              'pattern_play': 'Now, we are going to compose a song using this pattern'
            },
            eventHandler: next_step_on('tooltip_click')
          },
          {
            blink: ['pattern_name_input_box'],
            tooltip: {
              'pattern_name_input_box': 'Optionally, you can name your pattern here'
            },
            eventHandler: next_step_on('tooltip_click')
          },
          {
            blink: ['menu_new'],
            tooltip: {
              menu_new: 'Click "new" menu option, this time to create the song'
            },
            eventHandler: next_step_on('menu_new_click')
          },
          {
            blink: ['menu_new_song'],
            tooltip: {
              menu_new_song: 'Click "Song" menu option to create a new song'
            },
            eventHandler: delay(next_step_on('menu_new_song_click'),500)
          },
          { 
            blink: ['song_pattern_dropzone_0_0', 'index_pattern_type'],
            tooltip: {
              'song_pattern_dropzone_0_0': 'Drag your pattern to this block'
            },
            eventHandler: next_step_on('song_pattern_dropped')
          },
          { 
            tooltip: {
              'song_pattern_dropzone_0_0': 'Great!'
            },
            eventHandler: next_step_on('tooltip_click')
          },
          { 
            blink: ['song_pattern_dropzone_0_1', 'index_pattern_type'],
            tooltip: {
              'song_pattern_dropzone_0_1': 'Drag your pattern to this another block'
            },
            eventHandler: next_step_on('song_pattern_dropped')
          },
          { 
            blink: ['song_play'],
            tooltip: {
              'song_play': 'Click this button to hear your creation'
            },
            eventHandler: next_step_on('song_play_click')
          },
          { 
            tooltip: {
              'song_play': 'You should hear your pattern play twice...'
            },
            eventHandler: next_step_on('song_play_stopped')
          },
          { 
            blink: ['song_rec'],
            tooltip: {
              'song_rec': 'Click this button to export an audio file of the song'
            },
            eventHandler: next_step_on('song_rec_click')
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
