var musicShowCaseApp = angular.module("MusicShowCaseApp");
var enTranslations = {
  open_project: {
    p1: 'Select the project you want to open',
    title: 'Open Project'
  },
  array_editor: {
    tooltip: {
      remove_item: 'Removes the object from array',
      add_item: 'Click to add a new object to array',
      edit_item: 'Click to edit this object'
    }
  },
  index: {
    not_implemented: 'Sorry. Not implemented Yet :P',
    filter: 'Type here the word to filter objects',
    tooltip: {
      type: {
        instrument: 'This is a resource object of type instrument',
        pattern: 'This is a resource object of type pattern',
        song: 'This is a resource object of type song',
        fx: 'This is a resource object of type fx'
      },
      type_p1: 'To use the resource, drag them from here into your creation on the right',
      type_p2: 'To instead, *edit* the resource, double click it',
      index: 'This is the object index, you can find here your crafting outputs and inputs'
    }
  },
  project: {
    basic_info: 'Properties',
    references: 'References',
    settings: 'Project Settings',
    'new': 'New Project'
  },
  menu: {
    'new': 'File',
    new_instrument: 'New Instrument',
    new_pattern: 'New Pattern',
    new_song: 'New Song',
    new_project: 'New Project...',
    open_project: 'Open Project...',
    file_import: 'Import...',
    tools: 'Tools',
    tools_preferences: 'Preferences',
    help_view_help: 'View Help',
    help_recipes: 'Recipes',
    help_recipes_intro: 'Basic intro tour',
    help_recipes_howto_create_song: 'How to create a song',
    help_recipes_howto_create_instrument: 'How to create an instrument (square + 2 voices echo)',
    help_contextual_help: 'Contextual Help',
    help_welcome: 'Welcome!',
    help_about: 'About Music.js',
    recycle_bin: 'Recycle Bin...',
    tooltip: {
      'new': 'You can create new blank items from this option',
      preferences: 'You can edit your preferences here',
      help: 'Menu to access help options and about'
    },
    project: 'Project',
    project_settings: 'Settings...',
    project_remove_project: 'Remove Project',
    project_export_project: 'Export Project'
  },
  contextual_help: {
    enable: 'Enable Contextual Help',
    disable: 'Disable Contextual Help'
  },
  recycle: {
    p1: 'This is the recycle bin, from here, you can restore the items that have been removed',
    p2: 'Remember: items in the recycle bin will be permanently deleted if and when available storage space runs out',
    p3: '* Double-click the item you want to RESTORE',
    title: 'Recycle Bin',
    compact_title: 'Recycle Bin',
    compact_hint_restore: '* Double-click the item you want to RESTORE',
    compact_hint_open: '* Click here to open recycle bin window',
    EMPTY: 'EMPTY'
  },
  welcome: {
    title: 'Welcome to Music.js: 8bit Edition',
    p1: 'Music.js is a web application that allows the composition of melodies powered (optionally) by javascript programming',
    p2: 'This first basic edition, is fully oriented towards retro/8bit music by providing elemental oscillators, noise generators and basic modulation patterns',
    p3: 'Do you want a basic tour?',
    nevershow: 'Never show this message again'
  },
  about: {
    title: 'About Music.js: 8bit Edition',
    p3: 'In the long term, the goal of music.js is to cover all the layers needed between HTML5 Web Audio API provided by browsers and fully usable music composition application similar to known ones like FL Studio',
    authors: 'AUTHORS',
    i_am: 'I am Dario Seminara, but also I should give credit to some key library authors:',
    credit: {
      mohayonao: '@mohayonao (Author of Timbre.js)',
      higuma: '@higuma (Author of WebAudioRecorder)',
      kristopolous: '@kristopolous (Author of BOOTSTRA.386 Bootstrap Template)'
    },
    contribute: 'CONTRIBUTE',
    contact_me: 'Contact me at github'
  },
  common: {
    yes: 'Yes',
    no: 'No',
    ok: 'Ok',
    dismiss: 'Dismiss',
    cancel: 'Cancel',
    create: 'Create',
    open: 'Open',
    name: 'Name',
    language: 'Language:',
    loader_error: 'Error when trying to load file',
    cantremove_error: 'Can not delete the file if it is being used',
    cantremove_project_error: 'Can not delete the project if it is being used in another project',
    error_title: 'Error',
    HELP: 'HELP',
    more: 'more',
    remove: 'Remove',
    'export': 'Export',
    reset: 'Reset',
    play: 'Play',
    stop: 'Stop',
    record: 'Rec.',
    bpm: 'Bpm',
    add: 'Add',
    tooltip: {
      playing_speed: 'Playing speed, number of beats per minute',
      remove_item: 'Removes item, you can restore it from recycle bin',
      modulation: 'You can setup the effects modulation for {{name}} here. If you leave it empty, there will be no modulation at all'
    },
    new_instrument: 'New Instrument',
    new_pattern: 'New Pattern',
    new_song: 'New Song',
    modulation: '{{name}} Modulation'
  },
  help: {
    FLOW: 'MUSIC.JS FLOW',
    RECIPES: 'RECIPES',
    p1: 'In order to create a song, you need to craft it, and craft the materials.',
    p2: 'Actually, there are three types of craftable resources: instruments, patterns and songs',
    p3: 'While the right section shows the item being crafted. The left pannel shows the crafting materials',
    p4: 'You can drop resources (instruments or patterns) into drop zones, when applicable',
    p5: 'To use the resource on the item being crafted, you need to drag it to any of the dropzones',
    p6: 'Following this principle, you can use instruments to compose patterns, and finally, patterns to compose songs',
    p7: 'Furthermore, you can compose your custom instruments, from a range of effects:',
    p8: 'Don\'t worry, if you don\'t get it at first, there are recipes and contextual help at your disposal',
    recipes: {
      p1: 'Recipes are interactive mini-tutorials on how to craft anything here (example: a song)',
      p2: 'Some tutorials (such as \'intro\') only explain a few things about the main interface',
      p3: 'It\'s recommended to follow these recipes if you don\'t know what to do or how to start using the app. The recipes are reachable from the help menu (?)'
    },
    CONTEXTUAL_HELP: "CONTEXTUAL HELP",
    contextual_help: {
      p1: 'There is a series of tooltips explaining on detail the different features of the app. You can enable or disable these tooltips by clicking on the box in the left-bottom corner of the screen'
    }
  },
  stack: {
    drop_elements_here: "drop new elements here",
    tooltip: {
      you_can_drop_new_effects_here: 'You can drop new effects from the object index here',
      remove: 'Removes the effect element from the pipeline',
      up: 'Changes the order of the element, to execute it AFTER',
      down: 'Changes the order of the element, to execute it BEFORE',
      expand: 'Expand/Shrink the display of advanced options for the element'
    }
  },
  editor: {
    keyboard_instructions: 'Use ZXCVBNM keys to play instrument, or hover mouse on virtual keyboard',
    tooltip: {
      test_instrument_here: 'Test the instrument here, using mouse or keyboard',
      type_here_instrument: 'Type here the name of the instrument'
    }
  },
  pattern: {
    track_muted: 'Muted',
    track_solo: 'Solo',
    measure_beats: 'Measure beats',
    amount_beats: 'Amount of beats per measure',
    measure_count: 'Measure count',
    zoom_level: 'Zoom level',
    total_measures: 'Total count of measures on pattern',
    tracks: 'Tracks',
    drop_instrument: 'drop instrument here',
    tooltip: {
      change_name: 'Change the pattern name',
      zoom_level: 'Zoom level for all tracks',
      play: 'Click to play the pattern',
      stop: 'Click to stop playing',
      remove_track: 'Click to remove track',
      compact_view_p1: 'Track compact view: see the notes without having to expand the track.',
      compact_view_p2: 'Click here to expand the track',
      drop_zone: 'Instrument drop zone, drop instruments from the left panel to use it on the track',
      editor_notes_p1: 'Note area, add the notes here:',
      editor_notes_p2: 'Click to add a new one, and drag to change value/time',
      editor_notes_p3: 'CTRL+Z to undo changes',
      editor_notes_p4: 'CTRL+Y to redo changes',
      add_track: 'Click this button to add new empty tracks',
      note_event_p1: 'Note event. Drag from the right edge to change the duration or press delete key to remove',
      note_event_p2: 'Drag to change the value and/or starting time',
      note_event_p3: 'Note event. Click to select and edit it',
      muted: 'Disable the track in order to silence it',
      solo: 'Isolate the track so that it is the only one that plays. Can be more than one'
    }
  },
  song: {
    drop_pattern: "Drop pattern here",
    tooltip: {
      measure_beats: "Amount of beats per measure. Make sure this value match the measure length of the patterns",
      play: "Click to play the song",
      stop: "Click to stop playing the song",
      download: "Click to record the song and download the audio file",
      drop_pattern: "Drop zone for patterns, drop here a pattern from the panel on the left",
      remove_block: "Click here to remove the pattern and leave the block empty",
      play_block: "Click here to play this block only"
    }
  },
  BUTTON_LANG_EN: 'English',
  BUTTON_LANG_ES: 'Spanish'

};

musicShowCaseApp.constant("enTranslations", enTranslations);
