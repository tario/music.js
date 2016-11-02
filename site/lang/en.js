var musicShowCaseApp = angular.module("MusicShowCaseApp");
var enTranslations = {
  menu: {
    'new': 'File',
    new_instrument: 'New Instrument',
    new_pattern: 'New Pattern',
    new_song: 'New Song',
    tools: 'Tools',
    tools_preferences: 'Preferences',
    help_view_help: 'View Help',
    help_recipes: 'Recipes',
    help_recipes_intro: 'Basic intro tour',
    help_recipes_howto_create_song: 'How to create a song',
    help_contextual_help: 'Contextual Help',
    help_welcome: 'Welcome!',
    help_about: 'About Music.js'
  },
  contextual_help: {
    enable: 'Enable Contextual Help',
    disable: 'Disable Contextual Help'
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
    dismiss: 'Dismiss',
    language: 'Language:'
  },
  BUTTON_LANG_EN: 'English',
  BUTTON_LANG_ES: 'Spanish'
  
};

musicShowCaseApp.config(['$translateProvider', function ($translateProvider) {
  // add translation table
  $translateProvider
    .translations('en', enTranslations)
    .fallbackLanguage('en');
}]);
