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
    language: 'Language:',
    HELP: 'HELP',
    more: 'more'
  },
  pattern: {
    drop_instrument: 'drop instrument here'
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
  BUTTON_LANG_EN: 'English',
  BUTTON_LANG_ES: 'Spanish'
  
};

musicShowCaseApp.config(['$translateProvider', function ($translateProvider) {
  // add translation table
  $translateProvider
    .translations('en', enTranslations)
    .fallbackLanguage('en');
}]);
