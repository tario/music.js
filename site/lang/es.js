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
  pattern: {
    drop_instrument: 'suelte un instrumento aqui'
  },
  common: {
    yes: 'Si',
    no: 'No',
    dismiss: 'Cerrar',
    language: 'Idioma:',
    HELP: 'AYUDA',
    more: 'mas'
  },
  help: {
    FLOW: 'FLUJO DE MUSIC.JS',
    RECIPES: 'RECETAS',
    p1: 'Para crear una cancion, tienes que ensamblarla, asi como sus componentes',
    p2: 'Hay tres tipos de recursos que se pueden crear: instrumentos, patrones y canciones',
    p3: 'Mientras que la seccion de la izquierda, muestra el elemento que se esta creando, la seccion de la derecha muestra los materiales que se pueden usar',
    p4: 'Puedes arrastrar y soltar esos materiales en las zonas indicadas',
    p5: 'Para usar algun recurso en algun elemento que estes creando, lo tienes que arrastrar a esas zonas',
    p6: 'Siguiendo este principio, puedes usar instrumentos para componer patrones, y finalmente, los patrones para componer las canciones',
    p7: 'Ademas, puedes crear tus propios instrumentos, combinando varios efectos:',
    p8: 'No te preocupes si no lo entiendes ahora mismo, existen recetas y ayuda contextual que puedes usar',
    recipes: {
      p1: 'Las recetas, son mini-tutoriales interactivos que explican como crear algo (por ejemplo, una cancion)',
      p2: 'Algunos tutoriales (Como por ejemplo \'Recorrido Introductorio\') solo explican algunas cosas de la interfaz principal',
      p3: 'Te recomiendo que sigas estas recetas si no sabes que hacer o como empezar a usar la aplicacion. Puedes acceder a las recetas desde el menu de ayuda (?)'
    },
    CONTEXTUAL_HELP: "AYUDA CONTEXTUAL",
    contextual_help: {
      p1: 'Hay una serie de tooltips que explican detalladamente las distintas funcionalidades de la aplicacion. Puedes activar o desactivar estas ayudas clickeando en el recuadro que aparece en la esquina inferior izquierda de la pantalla'
    }
  },
  BUTTON_LANG_EN: 'Ingles',
  BUTTON_LANG_ES: 'Español'
};

musicShowCaseApp.config(['$translateProvider', function ($translateProvider) {
  // add translation table
  $translateProvider
    .translations('es', esTranslations);
}]);