var musicShowCaseApp = angular.module("MusicShowCaseApp");
var esTranslations = {
  menu: {
    'new': 'Archivo',
    new_instrument: 'Nuevo Instrumento',
    new_pattern: 'Nuevo Patron',
    new_song: 'Nueva Cancion',
    tools: 'Herramientas',
    tools_preferences: 'Preferencias',
    help_view_help: 'Ver Pagina de Ayuda',
    help_recipes: 'Recetas',
    help_recipes_intro: 'Recorrido Introductorio',
    help_recipes_howto_create_song: 'Como crear una cancion',
    help_contextual_help: 'Ayuda Contextual',
    help_welcome: '¡Bienvenido!',
    help_about: 'Acerca de Music.js'
  },
  contextual_help: {
    enable: 'Activar Ayuda Contextual',
    disable: 'Desactivar Ayuda Contextual'
  },
  welcome: {
    title: 'Bienvenido a Music.js: Edicion de 8bit',
    p1: 'Music.js es una aplicacion web que permite componer musica con el poder de javascript (opcional)',
    p2: 'La primera version esta totalmente orientada a la musica retro/8bit mediante osciladores elementales, generadores de ruido y patrones de modulacion',
    p3: '¿Quieres realizar un recorrido basico?',
    nevershow: 'Nunca mostrar este mensaje de nuevo'
  },
  about: {
    title: 'Acerca de Music.js: Edicion de 8bit',
    p3: 'A largo plazo, el objetivo de music.js es cubrir todas las capas necesarias entre el API de Web Audio provista pòr los navegadores y una solucion completa de composicion musical similar a las mas conocidas como por ej FL Studio',
    authors: 'AUTORES',
    i_am: 'Yo soy Dario Seminara, pero tambien tengo que dar credito a autores de varias librerias que son clave:',
    credit: {
      mohayonao: '@mohayonao (Autor de Timbre.js)',
      higuma: '@higuma (Autor de WebAudioRecorder)',
      kristopolous: '@kristopolous (Autor de la plantilla de bootstrap BOOTSTRA.386)'
    },
    contribute: 'CONTRIBUIR',
    contact_me: 'Contactame a travez de github'
  },
  common: {
    yes: 'Si',
    no: 'No',
    dismiss: 'Cerrar'
  }
};

musicShowCaseApp.config(['$translateProvider', function ($translateProvider) {
  // add translation table
  $translateProvider
    .translations('es', esTranslations)
    .use('es');
}]);