;

var musicShowCaseApp = angular.module("MusicShowCaseApp", ['ui.codemirror', 'ngRoute', 'ui.bootstrap', 'ngDraggable', 'ngCookies', 'pascalprecht.translate']);
musicShowCaseApp.constant("MUSIC", MUSIC);
musicShowCaseApp.constant("TICKS_PER_BEAT", 96);
musicShowCaseApp.constant("SONG_MAX_TRACKS", 32);
musicShowCaseApp.constant("localforage", localforage);
;

var musicShowCaseApp = angular.module("MusicShowCaseApp");
var enTranslations = {
  midi: {
    settings: 'MIDI Settings',
    inputs: 'Inputs',
    connected: 'MIDI Input Connected',
    disconnected: 'MIDI Input Disconnected (Click to setup)',
    events: 'Events',
    octave: 'Base Octave',
    transpose: 'Transpose'
  },
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
    pause: 'Pause',
    stop: 'Stop',
    record: 'Rec.',
    bpm: 'Bpm',
    bpm_lc: 'bpm',
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
      solo: 'Isolate the track so that it is the only one that plays. Can be more than one',
      instrument_edit: "Click this button to edit the instrument"
    }
  },
  song: {
    drop_pattern: "Drop pattern here",
    tooltip: {
      measure_beats: "Amount of beats per measure. Make sure this value match the measure length of the patterns",
      play: "Click to play/pause the song",
      stop: "Click to stop playing the song",
      download: "Click to record the song and download the audio file",
      drop_pattern: "Drop zone for patterns, drop here a pattern from the panel on the left",
      remove_block: "Click here to remove the pattern and leave the block empty",
      edit_block: "Click here to edit the pattern used by this block"
    }
  },
  BUTTON_LANG_EN: 'English',
  BUTTON_LANG_ES: 'Spanish'
};
musicShowCaseApp.constant("enTranslations", enTranslations);
;

var musicShowCaseApp = angular.module("MusicShowCaseApp");
var esTranslations = {
  midi: {
    settings: 'Opciones de MIDI',
    inputs: 'Entradas',
    connected: 'Entrada MIDI Conectada',
    disconnected: 'Entrada MIDI Desconectada (Click para configurar)',
    events: 'Eventos',
    octave: 'Octava Base',
    transpose: 'Transposicion'
  },
  open_project: {
    p1: 'Selecciona el proyecto que quieras abrir',
    title: 'Abrir Proyecto'
  },
  array_editor: {
    tooltip: {
      remove_item: 'Elimina el objeto de la coleccion',
      add_item: 'Click para agregar un nuevo objeto a la coleccion',
      edit_item: 'Click para editar este objeto'
    }
  },
  index: {
    not_implemented: 'Disculpa, funcionalidad no implementada',
    filter: 'Tipea aqui las palabras clave para filtrar los objetos',
    tooltip: {
      type: {
        instrument: 'Este es un recurso del tipo instrumento',
        pattern: 'Este es un recurso del tipo patron',
        song: 'Este es un recurso del tipo cancion',
        fx: 'Este es un recurso del tipo fx (efecto)'
      },
      type_p1: 'Para usar este recurso, arrastralo desde aqui hasta tu creacion',
      type_p2: 'Para, en lugar de eso, editarlo, haz doble click en el',
      index: 'Este es el indice de objetos, puedes encontrar tus materiales y productos listados aqui'
    }
  },
  project: {
    basic_info: 'Propiedades del proyecto',
    references: 'Referencias',
    settings: 'Configuracion del Proyecto',
    'new': 'Nuevo Proyecto'
  },
  menu: {
    'new': 'Archivo',
    new_instrument: 'Nuevo Instrumento',
    new_pattern: 'Nuevo Patron',
    new_song: 'Nueva Cancion',
    new_project: 'Nuevo Proyecto...',
    open_project: 'Abrir Proyecto...',
    file_import: 'Importar...',
    tools: 'Herramientas',
    tools_preferences: 'Preferencias',
    help_view_help: 'Ver Pagina de Ayuda',
    help_recipes: 'Recetas',
    help_recipes_intro: 'Recorrido Introductorio',
    help_recipes_howto_create_song: 'Como crear una cancion',
    help_recipes_howto_create_instrument: 'Como crear un instrumento (cuadrada + eco a dos voces)',
    help_contextual_help: 'Ayuda Contextual',
    help_welcome: '¡Bienvenido!',
    help_about: 'Acerca de Music.js',
    recycle_bin: 'Papelera de Reciclaje...',
    tooltip: {
      'new': 'Puedes crear nuevos items en blanco desde esta opcion',
      preferences: 'Puedes editar tus preferencias aqui',
      help: 'Menu para acceder a las opciones de ayuda y *Acerca De*'
    },
    project: 'Proyecto',
    project_settings: 'Configuracion...',
    project_remove_project: 'Eliminar Proyecto',
    project_export_project: 'Exportar Proyecto'
  },
  contextual_help: {
    enable: 'Activar Ayuda Contextual',
    disable: 'Desactivar Ayuda Contextual'
  },
  recycle: {
    p1: 'Esta es la papelera de reciclaje, desde aqui puedes restaurar los elementos que han sido eliminados',
    p2: 'Recuerda que los elementos en la papelera se eliminaran permanentemente cuando se agote el espacio disponible',
    p3: '* Haz doble-click en el elemento que quieras RESTAURAR',
    title: 'Papelera de Reciclaje',
    compact_title: 'Papelera de R.',
    compact_hint_restore: '* Haz doble-click en el elemento que quieras RESTAURAR',
    compact_hint_open: '* Haz click aqui para abrir la papelera de reciclaje',
    EMPTY: 'Vacia'
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
    contribute: 'COMO CONTRIBUIR',
    contact_me: 'Contactame a travez de github'
  },
  common: {
    yes: 'Si',
    no: 'No',
    ok: 'Aceptar',
    dismiss: 'Cerrar',
    cancel: 'Cancelar',
    create: 'Crear',
    open: 'Abrir',
    name: 'Nombre',
    loader_error: 'Error al intentar cargar el archivo',
    cantremove_error: 'No se puede eliminar el archivo si esta siendo utilizado',
    cantremove_project_error: 'No se puede eliminar el proyecto si esta siendo usado desde otro proyecto',
    error_title: 'Error',
    language: 'Idioma:',
    HELP: 'AYUDA',
    more: 'mas',
    remove: 'Elimi.',
    'export': 'Exportar',
    reset: 'Fabr.',
    play: 'Reprod.',
    pause: 'Pausar',
    stop: 'Detener',
    record: 'Rec.',
    bpm: 'Ppm',
    bpm_lc: 'ppm',
    add: 'Agreg.',
    tooltip: {
      playing_speed: 'Velocidad de reproduccion, cantidad de pulsos por minuto',
      remove_item: 'Elimina el elemento, puedes restaurarlo desde la papelera de reciclaje',
      modulation: 'Puedes configurar los efectos de modulacion aqui. Si lo dejas vacio, no habra modulacion'
    },
    new_instrument: 'Nuevo Instrumento',
    new_pattern: 'Nuevo Patron',
    new_song: 'Nueva Cancion',
    modulation: 'Modulacion de {{name}}'
  },
  help: {
    FLOW: 'FLUJO DE MUSIC.JS',
    RECIPES: 'RECETAS',
    p1: 'Para crear una cancion, tienes que ensamblarla, asi como sus componentes',
    p2: 'Hay tres tipos de recursos que se pueden crear: instrumentos, patrones y canciones',
    p3: 'Mientras que la seccion de la derecha muestra el elemento que se esta creando, la seccion de la izquierda muestra los materiales que se pueden usar',
    p4: 'Puedes arrastrar y soltar esos materiales en las zonas indicadas',
    p5: 'Para usar algun recurso en algun elemento que estes creando, lo tienes que arrastrar a esas zonas',
    p6: 'Siguiendo este principio, puedes usar instrumentos para componer patrones, y finalmente, los patrones para componer las canciones',
    p7: 'Ademas, puedes crear tus propios instrumentos, combinando varios efectos:',
    p8: 'No te preocupes si no lo entiendes ahora mismo, hay recetas y ayuda contextual que podras usar para familiarizarte con estos conceptos',
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
  editor: {
    keyboard_instructions: 'Usa las teclas ZXCVBNM para tocar el instrumento, o pasa el puntero del mouse sobre el teclado virtual',
    tooltip: {
      test_instrument_here: 'Prueba el instrumento aqui, usando el teclado o el mouse',
      type_here_instrument: 'Escribe aqui el nombre para el instrumento'
    }
  },
  pattern: {
    track_muted: 'Apagado',
    track_solo: 'Solo',
    measure_beats: 'Pulsos/compas',
    measure_count: 'Cant. de compases',
    zoom_level: 'Nivel de zoom',
    tracks: 'Pistas',
    drop_instrument: 'Suelta el instrumento aqui',
    tooltip: {
      amount_beats: 'Cantidad de pulsos por compas',
      total_measures: 'Cantidad total de compases en el patron',
      change_name: 'Cambia el nombre del patron',
      zoom_level: 'Nivel de zoom para todas las pistas',
      play: 'Click para reproducir el patron',
      stop: 'Click para detener la reproduccion',
      remove_track: 'Click para eliminar la pista',
      compact_view_p1: 'Vista compacta de la pista: muestra las notas sin necesidad de expandir la pista.',
      compact_view_p2: 'Clickea aqui para expandir la pista',
      drop_zone: 'Area para soltar el instrumento, arrastra aqui instrumentos del panel izquierdo para usarlos en la pista',
      editor_notes_p1: 'Area de notas, puedes agregar las notas aqui:',
      editor_notes_p2: 'Clickea para agregar una nueva nota, y arrastralas para cambiar su valor y su tiempo de inicio en la secuencia',
      editor_notes_p3: 'CTRL+Z para deshacer cambios',
      editor_notes_p4: 'CTRL+Y para rehacer cambios',
      add_track: 'Clickea este boton para agregar una nueva pista vacia',
      note_event_p1: 'Evento de nota. Arrastra desde el borde derecho para cambiar su duracion, o presiona la tecla SUPR. para eliminarlo',
      note_event_p2: 'Arrastra para cambiar el valor o el tiempo de comienzo en la secuencia',
      note_event_p3: 'Evento de nota. Clickea para seleccionarlo y editarlo',
      muted: 'Desactiva la pista haciendo que no se reproduzca',
      solo: 'Aisla la pista de manera que sea la unica que se reproduzca. Pueden aislarse varias',
      instrument_edit: 'Clickea este boton para editar el instrumento'
    }
  },
  song: {
    drop_pattern: "Suelta el patron aqui",
    tooltip: {
      measure_beats: "Pulsos/Compas. Tiene que coincidir con el de los patrones que se usan",
      play: "Click para reproducir/pausar la cancion",
      stop: "Click para detener la reproduccion",
      download: "Click para grabar la cancion a un archivo de audio y descargarlo",
      drop_pattern: "Area para soltar los patrones, arrastra aqui patrones desde el panel izquierdo",
      remove_block: "Click aqui para eliminar el patron y dejar el bloque vacio",
      edit_block: "Click aqui para saltar a la edicion del patron utilizado en este bloque"
    }
  },
  stack: {
    drop_elements_here: "suelta nuevos elementos aqui",
    tooltip: {
      you_can_drop_new_effects_here: 'Puedes soltar nuevos efectos del indice aqui',
      remove: 'Elimina el efecto de la secuencia',
      up: 'Cambia el orden del elemento, para que se ejecute DESPUES',
      down: 'Cambia el orden del elemento, para que se ejecute ANTES',
      expand: 'Expande/Comprime la vista avanzada del elemento'
    }
  },
  BUTTON_LANG_EN: 'Ingles',
  BUTTON_LANG_ES: 'Español'
};
musicShowCaseApp.constant("esTranslations", esTranslations);
;

var musicShowCaseApp = angular.module("MusicShowCaseApp");
musicShowCaseApp.config(['$translateProvider', function ($translateProvider) {
  var getBrowserLanguage = function getBrowserLanguage() {
    if (!$translateProvider.resolveClientLocale()) return 'en';
    var langCode = $translateProvider.resolveClientLocale().split("-")[0];
    if (!langCode) return 'en';
    return $translateProvider.translations()[langCode] ? langCode : 'en';
  };

  $translateProvider.preferredLanguage(getBrowserLanguage());
  $translateProvider.fallbackLanguage('en');
  $translateProvider.useSanitizeValueStrategy(null);
  $translateProvider.useLoader('translationsLoader');
}]);
;

var musicShowCaseApp = angular.module("MusicShowCaseApp");
musicShowCaseApp.config(["$routeProvider", "$locationProvider", function ($routeProvider, $locationProvider) {
  $routeProvider.when('/editor/:project/instrument/:id', {
    templateUrl: 'site/templates/editor.html',
    controller: 'EditorController'
  }).when('/editor/:project/song/:id', {
    templateUrl: 'site/templates/songEditor.html',
    controller: 'SongEditorController'
  }).when('/editor/:project/pattern/:id', {
    templateUrl: 'site/templates/patternEditor.html',
    controller: 'PatternEditorController'
  }).when('/editor/:project', {
    templateUrl: 'site/templates/dashboard.html',
    controller: 'ProjectDashboardController'
  }).when('/', {
    templateUrl: 'site/templates/dashboard.html',
    controller: 'DashboardController'
  }); // configure html5 to get links working on jsfiddle
  //$locationProvider.html5Mode(true);
}]);
;
;

var musicShowCaseApp = angular.module("MusicShowCaseApp");
musicShowCaseApp.directive("musicObjectEditor", ["$timeout", "$http", "TypeService", "Recipe", "MusicObjectFactory", function ($timeout, $http, TypeService, Recipe, MusicObjectFactory) {
  return {
    scope: {
      file: "=file"
    },
    templateUrl: "site/templates/objectEditor.html",
    link: function link(scope, element, attrs) {
      var file;
      var types = TypeService.getTypes();
      scope.output = {};
      scope.parameters = [];
      scope.recipe = Recipe.start;

      scope.termschanged = function () {
        scope.$broadcast('termschanged');
      };

      scope.f_t = function (str, state) {
        try {
          var ret = eval("(function(t) { return " + str + "; })");
          delete state.error;
          return ret;
        } catch (e) {
          state.error = e.toString();
          throw e;
        }
      };

      scope.oscTermsUpdateFromWaveForm = fn.debounce(function (waveform, terms, resolution) {
        try {
          var waveform = eval("(function(t) { return " + waveform + "; })");
          var count = resolution;
          var values = new Array(count);

          for (var i = 0; i < count; i++) {
            values[i] = waveform(i / count);
            if (isNaN(values[i])) throw "Not a number: " + values[i];
          }

          var ft = new DFT(values.length);
          ft.forward(values);

          for (var i = 0; i < count; i++) {
            terms.cos[i] = ft.real[i];
            terms.sin[i] = ft.imag[i];
          }

          terms.cos.length = ft.real.length / 2;
          terms.sin.length = ft.imag.length / 2;

          var f = function f(t) {
            var ret = 0;

            for (var i = 1; i < count / 2; i++) {
              var a = terms.sin[i];
              var b = terms.cos[i];
              ret = ret + a * Math.sin(t * 2 * Math.PI * i);
              ret = ret + b * Math.cos(t * 2 * Math.PI * i);
            }

            return ret;
          };

          var maxvalue = 0;
          var count = terms.sin.length;

          for (var i = 0; i < count; i++) {
            var value = f(i / count);

            if (value > maxvalue) {
              maxvalue = value;
            } else if (value < -maxvalue) {
              maxvalue = -value;
            }
          }

          for (var i = 0; i < count; i++) {
            terms.sin[i] = terms.sin[i] / maxvalue;
            terms.cos[i] = terms.cos[i] / maxvalue;
          }

          $timeout(function () {
            scope.invalidWaveform = false;
          });
          scope.$broadcast('termschanged');
        } catch (err) {
          $timeout(function () {
            scope.invalidWaveform = err.toString();
          });
        }
      }, 400);
      scope.oscTermsUpdate = fn.debounce(function (serie, terms, errVar) {
        try {
          var serie = eval("(function(n) { return " + serie + "; })");

          for (var n = 1; n < 512; n++) {
            terms[n] = serie(n);
            if (isNaN(terms[n])) throw "Not a number: " + terms[n];
          }

          scope[errVar] = false;
          $timeout(function () {
            scope.$broadcast('termschanged');
          });
        } catch (err) {
          $timeout(function () {
            scope[errVar] = err.toString();
          });
        }
      }, 400);

      scope.range = function (init, end) {
        var x = [];

        for (var i = init; i <= end; i++) {
          x.push(i);
        }

        return x;
      };

      var truthy = function truthy(x) {
        return x;
      };

      var updateObject = function updateObject(newValue) {
        $timeout(function () {
          if (scope.file && scope.file.changed) scope.file.changed();
        });
      };

      var outputObserver;
      scope.$on("$destroy", function () {
        if (outputObserver) outputObserver.destroy();
      });

      var updateTemplate = function updateTemplate(file) {
        if (!file) return;
        if (outputObserver) outputObserver.destroy();
        var outputObserver = MusicObjectFactory().observeOutput(file, function (output) {
          $timeout(function () {
            scope.output = output;
          });
        });
        types.then(function () {
          $timeout(function () {
            scope.selectedType = file.type;
            TypeService.getType(file.type, function (type) {
              $timeout(function () {
                scope.templateUrl = type.templateUrl;
                scope.type = type;

                for (var k in type._default) {
                  if (typeof file.data[k] === "undefined") {
                    file.data[k] = type._default[k];
                  }
                }

                if (type.parameters) {
                  scope.parameters = type.parameters.map(function (parameter) {
                    return {
                      name: parameter.name,
                      data: parameter,
                      value: file.data && typeof file.data[parameter.name] !== "undefined" ? file.data[parameter.name] : parameter.value
                    };
                  });
                }

                if (type.components) {
                  scope.modulations = (type.components || []).map(function (component) {
                    return {
                      name: component,
                      value: file.data && file.data.modulation && file.data.modulation[component] || {
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
      types.then(function (types) {
        scope.types = types;
      });

      var changeType = function changeType(newValue) {
        if (!newValue) return;
        if (!scope.file) return;
        scope.file.type = newValue;
        updateTemplate(scope.file);
      };

      scope.$watch("modulations", function (newValue) {
        if (!scope.modulations) return;
        scope.modulations.forEach(function (modulation) {
          scope.file.data.modulation = scope.file.data.modulation || {};
          scope.file.data.modulation[modulation.name] = modulation.value;
        });
        scope.$emit("objectChanged");
      }, true);
      scope.$watch("parameters", function (newValue) {
        if (!scope.parameters) return;
        scope.parameters.forEach(function (parameter) {
          scope.file.data[parameter.data.name] = parameter.value;
        });
        scope.$emit("objectChanged");
      }, true);
      scope.$watch("selectedType", changeType);
      scope.$watch("file", updateTemplate); //scope.$watch("file.data", fn.debounce(function(newValue) { debugger; },800), true);
    }
  };
}]);
musicShowCaseApp.directive("arrayEditor", ["$timeout", "Recipe", function ($timeout, Recipe) {
  return {
    scope: {
      data: "=data"
    },
    templateUrl: "site/templates/arrayEditor.html",
    link: function link(scope, element, attrs) {
      scope.data.subobjects = scope.data.subobjects || [];
      scope.maxElements = attrs.maxelements ? parseInt(attrs.maxelements) : Infinity;
      scope.currentTab = 0;
      scope.recipe = Recipe.start;

      var addObject = function addObject(newObject) {
        $timeout(function () {
          scope.data.subobjects = scope.data.subobjects || [];
          scope.data.subobjects.push(newObject);
          scope.setCurrentTab(scope.data.subobjects.length - 1);
        });
      };

      scope.setCurrentTab = function (idx) {
        scope.currentTab = idx;
      };

      scope.removeObject = function (object) {
        scope.data.subobjects = scope.data.subobjects.filter(function (o) {
          return o !== object;
        });
      };

      scope.addObject = function () {
        addObject({
          data: {
            array: []
          },
          type: "stack"
        });
      };

      if (scope.data.subobjects.length === 0) {
        scope.addObject();
      }
    }
  };
}]);
musicShowCaseApp.directive("musicStack", ["$timeout", "Recipe", "TypeService", function ($timeout, Recipe, TypeService) {
  return {
    scope: {
      initFile: "=initFile",
      dropzoneExtraName: "=dropzoneExtraName"
    },
    templateUrl: "site/templates/stack.html",
    link: function link(scope, element, attrs) {
      scope.recipe = Recipe.start;

      var swap = function swap(idx1, idx2) {
        scope.$emit("stackChanged");
        $timeout(function () {
          var tmp = scope.file.array[idx1];
          scope.file.array[idx1] = scope.file.array[idx2];
          scope.file.array[idx2] = tmp;
        });
      };

      var defaultStackAppend = function defaultStackAppend(file, data) {
        file.array = [{
          type: data.name,
          data: {}
        }].concat(file.array);
      };

      scope.onDropComplete = function (data, event) {
        if (data.type === "fx") {
          TypeService.getType(data.name).then(function (type) {
            (type.stackAppend || defaultStackAppend)(scope.file, data);
            scope.$emit("stackChanged");
          });
        }
      };

      scope.up = function (idx) {
        swap(idx - 1, idx);
      };

      scope.down = function (idx) {
        swap(idx + 1, idx);
      };

      scope.remove = function (idx) {
        scope.$emit("stackChanged");
        $timeout(function () {
          var oldCollection = scope.file.array;
          scope.file.array = [];

          for (var i = 0; i < oldCollection.length; i++) {
            if (i !== idx) scope.file.array.push(oldCollection[i]);
          }
        });
      };

      scope.add = function () {
        scope.$emit("stackChanged");
        $timeout(function () {
          scope.file.array.push({
            data: {},
            type: "null"
          });
        });
      };

      scope.$watch("initFile", function (newFile) {
        if (newFile) {
          scope.file = newFile.data;
        }
      });
    }
  };
}]);
musicShowCaseApp.directive("customOscGraph", ["$timeout", function ($timeout) {
  return {
    scope: {
      terms: "=terms"
    },
    template: '<function-graph f="f" samples=64 t0="0" tf="1" scaley="0.8"></function-graph>',
    link: function link(scope, element, attrs) {
      var termsChanged = function termsChanged() {
        scope.f = function (t) {
          var ret = 0;

          for (var i = 1; i < scope.terms.sin.length; i++) {
            var a = scope.terms.sin[i];
            var b = scope.terms.cos[i];
            ret = ret + a * Math.sin(t * 2 * Math.PI * i);
            ret = ret + b * Math.cos(t * 2 * Math.PI * i);
          }

          return ret;
        };
      };

      scope.f = function () {
        return 0;
      };

      scope.$on("termschanged", fn.debounce(termsChanged, 10));
      termsChanged();
    }
  };
}]);
musicShowCaseApp.directive("showScale", ["$timeout", function ($timeout) {
  return {
    scope: {
      scale: "=scale"
    },
    template: '<div class="note-cell" ng-repeat="note in notes">{{note}}</div><div class="note-cell" ng-repeat="note in notes">{{note}}</div>',
    link: function link(scope, element, attrs) {
      var semitoneToNote = function semitoneToNote(n) {
        return [0, [0, 1], 1, [1, 2], 2, 3, [3, 4], 4, [4, 5], 5, [5, 6], 6][n % 12];
      };

      var noteToSemitone = function noteToSemitone(n) {
        return [0, 2, 4, 5, 7, 9, 11][n % 7];
      };

      var notation7 = function notation7(n) {
        return ["C", "D", "E", "F", "G", "A", "B"][n % 7];
      };

      scope.$watch("scale", function (newVal) {
        $timeout(function () {
          var scale = MUSIC.Utils.Scale(newVal);
          var deltas = [0, 1, 2, 3, 4, 5, 6];
          var initTone = semitoneToNote(newVal);
          if (initTone.length) initTone = initTone[1];
          scope.notes = deltas.map(function (d) {
            var semitone = scale.add(newVal, d);
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
musicShowCaseApp.directive("ngScrollTop", ["$parse", "$timeout", function ($parse, $timeout) {
  return {
    restrict: 'A',
    link: function link(scope, element, attrs) {
      var scrollVarGetter = $parse(attrs.ngScrollTop);
      var scrollVarSetter = scrollVarGetter.assign;
      scope.$watch(attrs.ngScrollTop, function () {
        $(element).scrollTop(scrollVarGetter(scope));
      });
      element.on('scroll', function () {
        $timeout(function () {
          scrollVarSetter(scope, $(element).scrollTop());
        });
      });
    }
  };
}]);
musicShowCaseApp.directive("ngScrollLeft", ["$parse", "$timeout", function ($parse, $timeout) {
  return {
    restrict: 'A',
    link: function link(scope, element, attrs) {
      var scrollVarGetter = $parse(attrs.ngScrollLeft);
      var scrollVarSetter = scrollVarGetter.assign;
      scope.$watch(attrs.ngScrollLeft, function () {
        $(element).scrollLeft(scrollVarGetter(scope));
      });
      element.on('scroll', function () {
        $timeout(function () {
          scrollVarSetter(scope, $(element).scrollLeft());
        });
      });
    }
  };
}]);
;

musicShowCaseApp.directive("functionGraph", ["$timeout", "$parse", function ($timeout, $parse) {
  return {
    scope: {},
    replace: true,
    template: '<canvas class="wavegraph"></canvas>',
    link: function link(scope, element, attrs) {
      var f;
      var t0 = parseFloat(attrs.t0);
      var tf = parseFloat(attrs.tf);
      var samples = parseInt(attrs.samples);
      var scaley = parseFloat(attrs.scaley);
      scope.$parent.$watch(attrs.f, function (_f) {
        f = _f;
        if (f) redraw();
      });

      var redraw = function redraw() {
        var canvas = element[0];
        var context = canvas.getContext('2d');
        canvas.width = canvas.clientWidth / 4;
        canvas.height = canvas.clientHeight / 4;

        var drawLine = function drawLine(x0, y0, x1, y1, color) {
          context.save();
          context.beginPath();
          context.moveTo(x0, y0);
          context.lineTo(x1, y1);
          context.strokeStyle = color;
          context.lineWidth = 1;
          context.stroke();
          context.restore();
        };

        var drawFunc = function drawFunc(color) {
          context.save();
          context.save();
          context.translate(0, canvas.height / 2);
          context.scale(canvas.width, canvas.height / 2);
          context.moveTo(0, -f(t0) * scaley);

          for (var i = 1; i <= samples; i++) {
            var x = i / samples;
            var t = (tf - t0) * x + t0;
            context.lineTo(x, -f(t) * scaley);
          }

          context.restore();
          context.lineJoin = 'round';
          context.lineWidth = 1;
          context.strokeStyle = color;
          context.stroke();
          context.restore();
        };

        drawLine(0, canvas.height / 2, canvas.width, canvas.height / 2, 'aqua');
        drawFunc("#FFF");
      };
    }
  };
}]);
;

var musicShowCaseApp = angular.module("MusicShowCaseApp");
musicShowCaseApp.directive("keyboard", ["$timeout", "$uibModal", "Midi", "MusicContext", function ($timeout, $uibModal, Midi, MusicContext) {
  return {
    scope: {
      instrument: '=instrument'
    },
    templateUrl: "site/templates/keyboard.html",
    link: function link(scope, element, attrs) {
      var inputs;

      var onMIDIMessage = function onMIDIMessage(event) {
        var command = event.data[0];
        var value = event.data[1];
        var velocity = event.data[2];
        var octaveNumber = Math.floor(value / 12);
        if (octaveNumber < 0) return;
        var oct = scope.octaves[octaveNumber];
        if (!oct) return;

        if (command === 144) {
          oct.midi[value % 12] = true;
          oct.update();
        } else if (command === 128) {
          oct.midi[value % 12] = false;
          oct.update();
        }
      };

      var listener = Midi.registerEventListener(onMIDIMessage);

      var updateMidiStatus = function updateMidiStatus() {
        Midi.getStatus().then(function (data) {
          $timeout(function () {
            scope.midiConnected = data.connected;
          });
        });
      };

      updateMidiStatus();
      scope.$on("$destroy", function () {
        listener.destroy();
      });
      var keyCodeToNote = {
        90: 'C',
        83: 'C#',
        88: 'D',
        68: 'D#',
        67: 'E',
        86: 'F',
        71: 'F#',
        66: 'G',
        72: 'G#',
        78: 'A',
        74: 'A#',
        77: 'B'
      };

      var stopAll = function stopAll(x) {
        return x.stopAll();
      };

      var update = function update(octave) {
        return octave.update();
      };

      scope.midiSetup = function () {
        var modalIns = $uibModal.open({
          templateUrl: "site/templates/modal/midiSettings.html",
          controller: "midiSettingsModalCtrl"
        }).result.then(updateMidiStatus);
      };

      scope.stopAll = function () {
        scope.octaves.forEach(stopAll);
      };

      var octave = function octave(base) {
        return {
          mouse: {},
          key: {},
          midi: {},
          note: [],
          play: function play(idx) {
            if (this.note[idx]) return;
            this.note[idx] = scope.instrument.note(base + idx).play();
          },
          stop: function stop(idx) {
            if (!this.note[idx]) return;
            this.note[idx].stop();
            this.note[idx] = undefined;
          },
          update: function update() {
            for (var idx = 0; idx < 12; idx++) {
              if (this.mouse[idx] || this.key[idx] || this.midi[idx]) {
                this.play(idx);
              } else {
                this.stop(idx);
              }
            }

            $timeout(function () {});
          },
          stopAll: function stopAll() {
            this.note.forEach(function (note) {
              if (note && note.stop) note.stop();
            });
            this.note = [];
          }
        };
      };

      var gesture = function gesture() {
        MusicContext.resumeAudio();
      };

      var mouseOff = function mouseOff(octave) {
        gesture();
        octave.mouse = {};
        octave.update();
      };

      scope.mouseLeave = function (octave, idx) {
        gesture();
        octave.mouse[idx] = false;
        octave.update();
      };

      scope.mouseEnter = function (octave, idx) {
        gesture();
        scope.octaves.forEach(mouseOff);
        octave.mouse[idx] = true;
        scope.octaves.forEach(update);
      };

      var keyDownHandler = function keyDownHandler(e) {
        gesture();
        if (document.activeElement.tagName.toLowerCase() === "input") return;
        var keyCode = e.keyCode;
        var noteName = keyCodeToNote[keyCode];
        if (!noteName) return;
        var idx = MUSIC.noteToNoteNum(noteName);
        scope.octaves[1].key[idx] = true;
        scope.octaves[1].update();
        scope.$digest();
      };

      var keyUpHandler = function keyUpHandler(e) {
        gesture();
        var keyCode = e.keyCode;
        var noteName = keyCodeToNote[keyCode];
        if (!noteName) return;
        var idx = MUSIC.noteToNoteNum(noteName);
        scope.octaves[1].key[idx] = false;
        scope.octaves[1].update();
        scope.$digest();
      };

      $(document).bind("keydown", keyDownHandler);
      $(document).bind("keyup", keyUpHandler);
      var pianoFirstRow = $(element).find(".piano-firstrow .key");
      var pianoSecondRow = $(element).find(".piano-secondrow .key");
      pianoFirstRow.bind("click", gesture);
      pianoSecondRow.bind("click", gesture);
      scope.$on("$destroy", function () {
        $(document).unbind("keydown", keyDownHandler);
        $(document).unbind("keyup", keyUpHandler);
        pianoFirstRow.unbind("click", gesture);
        pianoSecondRow.unbind("click", gesture);
        scope.octaves.forEach(function (octave) {
          octave.stopAll();
        });
      });
      scope.octaves = [24, 36, 48, 60, 72].map(octave);
      scope.$watch("instrument", function (instrument) {
        scope.instrument = instrument;
      });
    }
  };
}]);
;

musicShowCaseApp.directive("musicEventEditor", ["$timeout", "TICKS_PER_BEAT", "Pattern", "MusicContext", function ($timeout, TICKS_PER_BEAT, Pattern, MusicContext) {
  return {
    scope: {
      /* Current pattern */
      pattern: "=pattern",

      /* Current track */
      track: "=track",

      /* Display params */
      zoomLevel: "=zoomLevel",
      beatWidth: "=beatWidth",

      /* File params (common to all tracks) */
      measure: "=measure",
      measureCount: "=measureCount",
      recipe: '=recipe'
    },
    templateUrl: "site/templates/directives/musicEventEditor.html",
    link: function link(scope, element, attrs) {
      scope.TICKS_PER_BEAT = TICKS_PER_BEAT;
      var defaultL = TICKS_PER_BEAT;

      var clearShadow = function clearShadow() {
        scope.shadowEvt = null;
      };

      var defaultMouseLeave = clearShadow;

      var defaultMouseMove = function defaultMouseMove(event) {
        var clipDistance = TICKS_PER_BEAT / scope.zoomLevel;

        if (!event.target.classList.contains("event-list")) {
          return;
        }

        scope.shadowEvt = scope.shadowEvt || {};
        scope.shadowEvt.n = Math.floor(upperLimit() - event.offsetY / 20);
        scope.shadowEvt.l = defaultL;

        if (scope.shadowEvt.s) {
          var exactPosition = Math.floor(event.offsetX / scope.beatWidth / scope.zoomLevel * TICKS_PER_BEAT);
          exactPosition = Math.floor(exactPosition);
          var clipS = Pattern.findClipS(scope.pattern, scope.track, {
            s: exactPosition,
            l: defaultL
          }, exactPosition);

          if (Math.abs(exactPosition - clipS - clipDistance / 2) < clipDistance) {
            scope.shadowEvt.s = clipS;
            Pattern.cutEvent(scope.pattern, scope.track, scope.shadowEvt);
            return;
          }
        }

        scope.shadowEvt.s = Math.floor(Math.floor(event.offsetX / 2 / scope.beatWidth) * 2 / scope.zoomLevel * TICKS_PER_BEAT);
        if (scope.shadowEvt.s < 0) scope.shadowEvt.s = 0;
        Pattern.cutEvent(scope.pattern, scope.track, scope.shadowEvt);
      };

      var semitoneToNote = function semitoneToNote(n) {
        return [0, [0, 1], 1, [1, 2], 2, 3, [3, 4], 4, [4, 5], 5, [5, 6], 6][n % 12];
      };

      var noteToSemitone = function noteToSemitone(n) {
        return [0, 2, 4, 5, 7, 9, 11][n % 7];
      };

      var notation7 = function notation7(n) {
        return ["C", "D", "E", "F", "G", "A", "B"][n % 7];
      };

      scope.raiseEventChanged = function (oldevt, evt, track) {
        scope.$emit('eventChanged', {
          oldevt: oldevt,
          evt: evt,
          track: track
        });
      };

      scope.noteName = function (n) {
        var note7 = semitoneToNote(n);
        var octave = Math.floor(n / 12);

        if (Array.isArray(note7)) {
          note7 = note7[0];
          return notation7(note7) + '#' + octave;
        } else {
          return notation7(note7) + octave;
        }
      };

      var updateGrid = function updateGrid() {
        scope.mainGridStyle = {
          "background-size": scope.measure * scope.beatWidth * scope.zoomLevel + "px 240px"
        };
      };

      scope.$watch("[measure, beatWidth, zoomLevel]", updateGrid);
      scope.$watch("track.scroll", function () {
        scope.$emit("trackChanged", scope.track);
      });
      $timeout(updateGrid);

      var addNewEvent = function addNewEvent(newEvt) {
        if (scope.track.events.find(function (evt) {
          return newEvt.s === evt.s && newEvt.n === evt.n;
        })) {
          return;
        }

        newEvt = angular.copy(newEvt);
        if (Pattern.collision(scope.track, newEvt)) return;
        scope.$emit("patternSelectEvent", newEvt);
        scope.selected = newEvt;
        scope.recipe.raise('pattern_note_added');
        scope.track.events.push(newEvt);
        scope.$emit("trackChanged", scope.track);
        scope.$emit("eventChanged", {
          oldevt: {},
          evt: newEvt,
          track: scope.track
        });
        scope.mouseMove = moveEvent(newEvt, 0);
        scope.mouseMoveEvent = moveEventFromEvent(newEvt, 0);
        clearShadow();

        scope.mouseLeave = function () {
          defaultMouseLeave();
          cancelMove();
        };

        scope.mouseUpResizeEvent = cancelMove;
        scope.mouseUpEvent = cancelMove;
        scope.mouseUp = cancelMove;
      };

      scope.mouseMoveResizeEvent = function () {
        clearShadow();
      };

      scope.shadowMouseMove = function (event) {
        var deltaS = Math.floor(event.offsetX / 2 / scope.beatWidth) * 2 / scope.zoomLevel * TICKS_PER_BEAT;
        if (deltaS > 0) scope.shadowEvt.s = scope.shadowEvt.s + deltaS;
        Pattern.cutEvent(scope.pattern, scope.track, scope.shadowEvt);
      };

      scope.addFromShadow = function (event) {
        addNewEvent(scope.shadowEvt);
      };

      scope.mouseUp = function (event) {
        scope.mouseMove = defaultMouseMove;
      };

      scope.mouseLeave = function () {
        defaultMouseLeave();
        scope.mouseMove = defaultMouseMove;
      };

      scope.mouseMove = defaultMouseMove;
      scope.mouseMoveEvent = clearShadow;

      var upperLimit = function upperLimit() {
        return scope.track.instrument === 'tempo' ? 1024 : 120;
      };

      var max = function max(c1, c2) {
        return c1 > c2 ? c1 : c2;
      };

      var preventCollision = function preventCollision(evt, f) {
        return function () {
          var savedEvt = angular.copy(evt);
          var ret = f.apply(null, arguments);

          if (Pattern.collision(scope.track, evt)) {
            evt.n = savedEvt.n;
            evt.s = savedEvt.s;
            evt.l = savedEvt.l;
            return;
          }

          if (evt.n !== savedEvt.n || evt.l !== savedEvt.l || evt.s !== savedEvt.s) {
            scope.$emit("trackChanged", scope.track);
            scope.$emit("eventChanged", {
              oldevt: savedEvt,
              evt: evt,
              track: scope.track
            });
          }
        };
      };

      var moveEvent = function moveEvent(evt, offsetX) {
        return function (event) {
          MusicContext.resumeAudio();
          var clipDistance = TICKS_PER_BEAT / scope.zoomLevel;
          var oldevt = {
            n: evt.n,
            s: evt.s,
            l: evt.l
          };
          var exactPosition = Math.floor((event.offsetX - offsetX) / scope.beatWidth / scope.zoomLevel * TICKS_PER_BEAT);
          exactPosition = Math.floor(exactPosition);
          var clipS = Pattern.findClipS(scope.pattern, scope.track, evt, exactPosition);
          if (!event.target.classList.contains("event-list")) return;

          if (Math.abs(exactPosition - clipS - clipDistance / 2) < clipDistance) {
            evt.s = clipS;
          } else {
            evt.s = Math.floor((event.offsetX - offsetX) / 2 / scope.beatWidth) * 2 / scope.zoomLevel * TICKS_PER_BEAT;
            evt.s = Math.floor(evt.s);
          }

          if (evt.s < 0) evt.s = 0;
          var oldN = evt.n;
          evt.n = Math.floor(upperLimit() - event.offsetY / 20);
        };
      };

      var moveEventFromEvent = function moveEventFromEvent(evt, offsetX) {
        clearShadow();
        return function (dragevt, event) {
          MusicContext.resumeAudio();
          var clipDistance = TICKS_PER_BEAT / scope.zoomLevel;
          var oldevt = {
            n: evt.n,
            s: evt.s,
            l: evt.l
          };
          var exactPosition = dragevt.s + Math.floor((event.offsetX - offsetX) / scope.beatWidth / scope.zoomLevel * TICKS_PER_BEAT);
          exactPosition = Math.floor(exactPosition);
          var clipS = Pattern.findClipS(scope.pattern, scope.track, evt, exactPosition);

          if (Math.abs(exactPosition - clipS - clipDistance / 2) < clipDistance) {
            evt.s = clipS;
          } else {
            evt.s = dragevt.s + Math.floor((event.offsetX - offsetX) / 2 / scope.beatWidth) * 2 / scope.zoomLevel * TICKS_PER_BEAT;
            evt.s = Math.floor(evt.s);
          }

          evt.n = dragevt.n;
          if (evt.s < 0) evt.s = 0;
        };
      };

      var cancelMove = function cancelMove() {
        scope.mouseMoveEvent = clearShadow;
        scope.mouseMove = defaultMouseMove;
        scope.mouseLeave = defaultMouseLeave;
      };

      scope.mouseDown = function (event) {
        MusicContext.resumeAudio();
        if (!event.target.classList.contains("event-list")) return;
        var newEvt = {
          n: Math.floor(upperLimit() - event.offsetY / 20),
          s: Math.floor(event.offsetX / scope.beatWidth) / scope.zoomLevel * TICKS_PER_BEAT,
          l: defaultL
        };
        newEvt.s = Math.floor(newEvt.s);
        Pattern.cutEvent(scope.pattern, scope.track, newEvt);
        addNewEvent(newEvt);
      };

      var eventSplit = function eventSplit(evt, ticks) {
        var originalL = evt.l;
        evt.l = ticks;
        var newEvt = {
          n: evt.n,
          s: evt.s + evt.l,
          l: originalL - ticks
        };
        scope.recipe.raise('pattern_note_added');
        scope.track.events.push(newEvt);
      };

      var eventLeftSplit = function eventLeftSplit(evt) {
        if (evt.l % 3 === 0) {
          eventSplit(evt, evt.l / 3);
        } else {
          eventCenterSplit(evt);
        }
      };

      var eventRightSplit = function eventRightSplit(evt) {
        if (evt.l % 3 === 0) {
          eventSplit(evt, evt.l * 2 / 3);
        } else {
          eventCenterSplit(evt);
        }
      };

      var eventCenterSplit = function eventCenterSplit(evt) {
        if (evt.l % 2 === 0) {
          eventSplit(evt, evt.l / 2);
        }
      };

      scope.mouseDblClickEvent = function (evt, event) {
        var elementWidth = $(event.target)[0].clientWidth + 5;

        if (event.offsetX < elementWidth / 3) {
          eventLeftSplit(evt);
        } else if (event.offsetX > elementWidth * 2 / 3) {
          eventRightSplit(evt);
        } else {
          eventCenterSplit(evt);
        }
      };

      scope.mouseDownEvent = function (evt, event) {
        MusicContext.resumeAudio();
        event.preventDefault();
        document.activeElement.blur();
        scope.$emit("eventSelected", {
          evt: evt,
          track: scope.track
        });
        scope.$emit("patternSelectEvent", evt);
        scope.selected = evt;
        scope.mouseMove = preventCollision(evt, moveEvent(evt, event.offsetX));
        scope.mouseMoveEvent = preventCollision(evt, moveEventFromEvent(evt, event.offsetX));
        clearShadow();

        scope.mouseLeave = function () {
          defaultMouseLeave();
          cancelMove();
        };

        var _cancelMove = function _cancelMove() {
          scope.recipe.raise('pattern_note_drag');
          cancelMove();
        };

        scope.mouseUpResizeEvent = _cancelMove;
        scope.mouseUpEvent = _cancelMove;
        scope.mouseUp = _cancelMove;
      };

      scope.mouseDownResizeEvent = function (evt, event) {
        MusicContext.resumeAudio();
        event.preventDefault();
        scope.$emit("patternSelectEvent", evt);
        scope.selected = evt;
        scope.mouseMove = preventCollision(evt, function (event) {
          var oldevt = {
            n: evt.n,
            s: evt.s,
            l: evt.l
          };
          var clipDistance = TICKS_PER_BEAT / scope.zoomLevel;
          var clipL = Pattern.findClipL(scope.pattern, scope.track, evt, evt.s);
          if (!event.target.classList.contains("event-list")) return;
          var exactL = Math.floor(event.offsetX / scope.beatWidth / scope.zoomLevel * TICKS_PER_BEAT) - evt.s;

          if (Math.abs(exactL - clipL - clipDistance) < clipDistance) {
            evt.l = clipL;
          } else {
            var refs = Math.floor(event.offsetX / scope.beatWidth / 2) * 2 / scope.zoomLevel * TICKS_PER_BEAT;
            evt.l = refs - evt.s;
            evt.l = Math.floor(evt.l);
            if (evt.l < TICKS_PER_BEAT / scope.zoomLevel) evt.l = TICKS_PER_BEAT / scope.zoomLevel;
            defaultL = evt.l;
          }
        });
        scope.mouseMoveEvent = preventCollision(evt, function (dragevt, event) {
          var oldevt = {
            n: evt.n,
            s: evt.s,
            l: evt.l
          };
          var clipDistance = TICKS_PER_BEAT / scope.zoomLevel;
          var clipL = Pattern.findClipL(scope.pattern, scope.track, evt, evt.s);
          var exactL = dragevt.s + Math.floor(event.offsetX / scope.beatWidth / scope.zoomLevel * TICKS_PER_BEAT) - evt.s;

          if (Math.abs(exactL - clipL - clipDistance) < clipDistance) {
            evt.l = clipL;
          } else {
            var refs = dragevt.s + Math.floor(event.offsetX / scope.beatWidth / 2) * 2 / scope.zoomLevel * TICKS_PER_BEAT;
            evt.l = refs - evt.s;
            evt.l = Math.floor(evt.l);
            if (evt.l < TICKS_PER_BEAT / scope.zoomLevel) evt.l = TICKS_PER_BEAT / scope.zoomLevel;
            defaultL = evt.l;
          }
        });
        scope.mouseUpResizeEvent = cancelMove;
        scope.mouseUpEvent = cancelMove;
        scope.mouseUp = cancelMove;
      };

      var keyDownHandler = function keyDownHandler(e) {
        if (document.activeElement.tagName.toLowerCase() === "input") return;

        if (e.keyCode == 46) {
          $timeout(function () {
            scope.track.events = scope.track.events.filter(function (evt) {
              return evt !== scope.selected;
            });
            scope.$emit("trackChanged", scope.track);
          });
        }
      };

      $(document).bind("keydown", keyDownHandler);
      scope.$on("$destroy", function () {
        $(document).unbind("keydown", keyDownHandler);
      });
      scope.$on("trackSelectEvent", function (evt, event) {
        scope.selected = event;
      });
    }
  };
}]);
;

var musicShowCaseApp = angular.module("MusicShowCaseApp");
musicShowCaseApp.directive("ngfDrop", ["$parse", function ($parse) {
  return {
    restrict: 'A',
    link: function link(scope, element, attrs) {
      var ngfDropGetter = $parse(attrs.ngfDrop);

      var allowDrag = function allowDrag(e) {
        e.dataTransfer.dropEffect = 'copy';
        e.preventDefault();
      };

      var onDrop = function onDrop(e) {
        ngfDropGetter(scope, {
          '$files': e.dataTransfer.files
        });
        e.preventDefault();
      };

      window.addEventListener('dragenter', allowDrag);
      window.addEventListener('dragover', allowDrag);
      window.addEventListener('drop', onDrop);
      scope.$on("$destroy", function () {
        window.removeEventListener('dragenter', allowDrag);
        window.removeEventListener('dragover', allowDrag);
        window.removeEventListener('drop', onDrop);
      });
    }
  };
}]);
;

var musicShowCaseApp = angular.module("MusicShowCaseApp");
musicShowCaseApp.directive("ngfLoader", ["$parse", function ($parse) {
  return {
    restrict: 'A',
    link: function link(scope, element, attrs) {
      var ngfLoaderGetter = $parse(attrs.ngfLoader);

      var onChange = function onChange(e) {
        ngfLoaderGetter(scope, {
          '$files': e.target.files
        });
        $(element).val("");
      };

      $(element).on('change', onChange);
      scope.$on('$destroy', function () {
        $(element).off('change', onChange);
      });
    }
  };
}]);
;

musicShowCaseApp.directive("patternTrackCompactView", ["$timeout", "TICKS_PER_BEAT", "Recipe", "Pattern", "MusicContext", function ($timeout, TICKS_PER_BEAT, Recipe, Pattern, MusicContext) {
  return {
    scope: {
      /* Current pattern */
      pattern: "=pattern",

      /* Current track */
      track: "=track",

      /* Display params */
      zoomLevel: "=zoomLevel",
      beatWidth: "=beatWidth",

      /* File params (common to all tracks) */
      measure: "=measure",
      measureCount: "=measureCount"
    },
    templateUrl: "site/templates/directives/patternTrackCompactView.html",
    link: function link(scope, element) {
      scope.recipe = Recipe.start;
      scope.TICKS_PER_BEAT = TICKS_PER_BEAT;

      var semitoneToNote = function semitoneToNote(n) {
        return [0, [0, 1], 1, [1, 2], 2, 3, [3, 4], 4, [4, 5], 5, [5, 6], 6][n % 12];
      };

      var notation7 = function notation7(n) {
        return ["C", "D", "E", "F", "G", "A", "B"][n % 7];
      };

      scope.noteName = function (n) {
        var note7 = semitoneToNote(n);
        var octave = Math.floor(n / 12);

        if (Array.isArray(note7)) {
          note7 = note7[0];
          return notation7(note7) + '#' + octave;
        } else {
          return notation7(note7) + octave;
        }
      };

      var updateGrid = function updateGrid() {
        scope.mainGridStyle = {
          "background-size": scope.measure * scope.beatWidth * scope.zoomLevel + "px 240px",
          "background-position": -scope.pattern.scrollLeft + "px"
        };
      };

      scope.$watch("[measure, beatWidth, zoomLevel, pattern.scrollLeft]", updateGrid);
      scope.$on("trackSelectEvent", function (evt, event) {
        scope.selected = event;
      });

      var mouseUp = function mouseUp(event) {
        scope.$emit("enableTrack", scope.track);

        scope.mouseMove = function () {};
      };

      scope.mouseUp = mouseUp;

      scope.mouseLeave = function () {
        scope.mouseMove = function () {};
      };

      var cancelMove = function cancelMove() {
        scope.mouseMoveEvent = function () {};

        scope.mouseMove = function () {};

        scope.mouseLeave = function () {};
      };

      scope.mouseDownEvent = function (evt, event) {
        var moved = false;

        var moveEvent = function moveEvent(evt, offsetX) {
          return function (event) {
            MusicContext.resumeAudio();
            var clipDistance = TICKS_PER_BEAT / scope.zoomLevel;
            var oldevt = {
              n: evt.n,
              s: evt.s,
              l: evt.l
            };
            if (!event.target.parentElement.classList.contains("track-compact-view")) return;
            var exactPosition = Math.floor((event.offsetX - offsetX) / scope.beatWidth / scope.zoomLevel * TICKS_PER_BEAT);
            exactPosition = Math.floor(exactPosition);
            var clipS = Pattern.findClipS(scope.pattern, scope.track, evt, exactPosition);

            if (Math.abs(exactPosition - clipS - clipDistance / 2) < clipDistance) {
              evt.s = clipS;
            } else {
              evt.s = Math.floor((event.offsetX - offsetX) / 2 / scope.beatWidth) * 2 / scope.zoomLevel * TICKS_PER_BEAT;
              evt.s = Math.floor(evt.s);
            }

            if (evt.s < 0) evt.s = 0;
            if (evt.s !== oldevt.s) moved = true;
            scope.$emit("trackChanged", scope.track);
            scope.$emit("eventChanged", {
              oldevt: oldevt,
              evt: evt,
              track: scope.track
            });
          };
        };

        var moveEventFromEvent = function moveEventFromEvent(evt, offsetX) {
          return function (dragevt, event) {
            MusicContext.resumeAudio();
            var clipDistance = TICKS_PER_BEAT / scope.zoomLevel;
            var oldevt = {
              n: evt.n,
              s: evt.s,
              l: evt.l
            };
            var exactPosition = dragevt.s + Math.floor((event.offsetX - offsetX) / scope.beatWidth / scope.zoomLevel * TICKS_PER_BEAT);
            exactPosition = Math.floor(exactPosition);
            var clipS = Pattern.findClipS(scope.pattern, scope.track, evt, exactPosition);

            if (Math.abs(exactPosition - clipS - clipDistance / 2) < clipDistance) {
              evt.s = clipS;
            } else {
              evt.s = dragevt.s + Math.floor((event.offsetX - offsetX) / 2 / scope.beatWidth) * 2 / scope.zoomLevel * TICKS_PER_BEAT;
              evt.s = Math.floor(evt.s);
            }

            if (evt.s < 0) evt.s = 0;
            if (evt.s !== oldevt.s) moved = true;
            scope.$emit("trackChanged", scope.track);
            scope.$emit("eventChanged", {
              oldevt: oldevt,
              evt: evt,
              track: scope.track
            });
          };
        };

        event.preventDefault();
        document.activeElement.blur();
        scope.$emit("eventSelected", {
          evt: evt,
          track: scope.track
        });
        scope.mouseMove = moveEvent(evt, event.offsetX);
        scope.mouseMoveEvent = moveEventFromEvent(evt, event.offsetX);

        scope.mouseLeave = function () {
          cancelMove();
        };

        var _cancelMove = function _cancelMove() {
          scope.recipe.raise('pattern_note_drag');
          cancelMove();
        };

        scope.mouseUpResizeEvent = _cancelMove;
        scope.mouseUpEvent = _cancelMove;

        scope.mouseUp = function () {
          scope.mouseUp = mouseUp;
          if (!moved) scope.$emit("enableTrack", scope.track);
          scope.$emit("patternSelectEvent", evt);

          _cancelMove();
        };
      };

      scope.mouseDownResizeEvent = function (evt, event) {
        var moved = false;
        event.preventDefault();

        scope.mouseMove = function (event) {
          MusicContext.resumeAudio();
          var oldevt = {
            n: evt.n,
            s: evt.s,
            l: evt.l
          };
          var clipDistance = TICKS_PER_BEAT / scope.zoomLevel;
          var clipL = Pattern.findClipL(scope.pattern, scope.track, evt, evt.s);
          if (!event.target.parentElement.classList.contains("track-compact-view")) return;
          var exactL = Math.floor(event.offsetX / scope.beatWidth / scope.zoomLevel * TICKS_PER_BEAT) - evt.s;

          if (Math.abs(exactL - clipL - clipDistance) < clipDistance) {
            evt.l = clipL;
          } else {
            var refs = Math.floor(event.offsetX / scope.beatWidth / 2) * 2 / scope.zoomLevel * TICKS_PER_BEAT;
            evt.l = refs - evt.s;
            evt.l = Math.floor(evt.l);
            if (evt.l < TICKS_PER_BEAT / scope.zoomLevel) evt.l = TICKS_PER_BEAT / scope.zoomLevel;
            defaultL = evt.l;
          }

          if (evt.l !== oldevt.l) {
            moved = true;
          }

          scope.$emit("trackChanged", scope.track);
          scope.$emit("eventChanged", {
            oldevt: oldevt,
            evt: evt,
            track: scope.track
          });
        };

        scope.mouseMoveEvent = function (dragevt, event) {
          MusicContext.resumeAudio();
          var oldevt = {
            n: evt.n,
            s: evt.s,
            l: evt.l
          };
          var clipDistance = TICKS_PER_BEAT / scope.zoomLevel;
          var clipL = Pattern.findClipL(scope.pattern, scope.track, evt, evt.s);
          var exactL = dragevt.s + Math.floor(event.offsetX / scope.beatWidth / scope.zoomLevel * TICKS_PER_BEAT) - evt.s;

          if (Math.abs(exactL - clipL - clipDistance) < clipDistance) {
            evt.l = clipL;
          } else {
            var refs = dragevt.s + Math.floor(event.offsetX / scope.beatWidth / 2) * 2 / scope.zoomLevel * TICKS_PER_BEAT;
            evt.l = refs - evt.s;
            evt.l = Math.floor(evt.l);
            if (evt.l < TICKS_PER_BEAT / scope.zoomLevel) evt.l = TICKS_PER_BEAT / scope.zoomLevel;
            defaultL = evt.l;
          }

          if (evt.l !== oldevt.l) {
            moved = true;
          }

          scope.$emit("trackChanged", scope.track);
          scope.$emit("eventChanged", {
            oldevt: oldevt,
            evt: evt,
            track: scope.track
          });
        };

        scope.mouseUpResizeEvent = cancelMove;
        scope.mouseUpEvent = cancelMove;

        scope.mouseUp = function () {
          scope.mouseUp = mouseUp;
          if (!moved) scope.$emit("enableTrack", scope.track);
          scope.$emit("patternSelectEvent", evt);
          cancelMove();
        };
      };
    }
  };
}]);
;

musicShowCaseApp.directive("playingLine", ["$timeout", "$parse", "TICKS_PER_BEAT", function ($timeout, $parse, TICKS_PER_BEAT) {
  return {
    scope: {},
    replace: true,
    templateUrl: "site/templates/directives/playingLine.html",
    link: function link(scope, element, attrs) {
      var t0;
      var timeToTicks;
      var playing = false;
      var getBpm = $parse(attrs.bpm);
      var getZoomLevel = $parse(attrs.zoomLevel);
      var getBeatWidth = $parse(attrs.beatWidth);
      var bpm, zoomLevel, beatWidth;

      var ticksToPX = function ticksToPX(ticks) {
        zoomLevel = getZoomLevel(scope.$parent);
        beatWidth = getBeatWidth(scope.$parent);
        return ticks * zoomLevel * beatWidth / TICKS_PER_BEAT;
      };

      var callback = function callback() {
        if (bpm && playing) {
          var ticks = timeToTicks(window.performance.now() - t0);
          var displacement = ticksToPX(ticks);
          element.css("left", displacement + "px");
        }

        requestAnimationFrame(callback);
      };

      var playingLine = $(element);
      var requestId = requestAnimationFrame(callback);
      scope.$on('startClock', function (evt, _timeToTicks) {
        var _t0 = window.performance.now();

        playing = true;
        bpm = getBpm(scope.$parent);
        timeToTicks = _timeToTicks;
        t0 = _t0;
      });
      scope.$on('stopClock', function (evt) {
        playing = false;
      });
      scope.$on('pauseClock', function (evt) {
        var ticks = timeToTicks(window.performance.now() - t0);
        var displacement = ticksToPX(ticks || 0);
        playing = false;
        scope.$emit('pausedClock', ticks);
        element.css("left", displacement + "px");
      });
      scope.$on('resetClock', function (evt, baseTicks) {
        var displacement = ticksToPX(baseTicks || 0);
        playing = false;
        element.css("left", displacement + "px");
      });
      scope.$on('$destroy', function () {
        cancelAnimationFrame(requestId);
      });
    }
  };
}]);
;

var musicShowCaseApp = angular.module("MusicShowCaseApp");
musicShowCaseApp.directive("recipeBlink", ["$parse", "$timeout", "Recipe", function ($parse, $timeout, Recipe) {
  return {
    restrict: 'A',
    link: function link(scope, element, attrs) {
      var recipeBlinkGetter = $parse(attrs.recipeBlink);
      var blinkElementId = recipeBlinkGetter(scope);

      if (!Array.isArray(blinkElementId)) {
        blinkElementId = [blinkElementId];
      }

      var blink = function blink() {
        $timeout(function () {
          $(element).addClass('blink');
        });
      };

      var noblink = function noblink() {
        $timeout(function () {
          $(element).removeClass('blink');
        });
      };

      var registerEvent = function registerEvent(blinkElementId) {
        if (Recipe.getBlinks().indexOf(blinkElementId) !== -1) {
          blink();
        }

        scope.$on("_blink_enable_" + blinkElementId, function (event, args) {
          blink();
        });
        scope.$on("_blink_disable_" + blinkElementId, function () {
          noblink();
        });
        scope.$on("__blink_disable_all", function () {
          noblink();
        });
      };

      blinkElementId.forEach(registerEvent);
    }
  };
}]);
;

var musicShowCaseApp = angular.module("MusicShowCaseApp");
musicShowCaseApp.directive("recipeTooltip", ["$parse", "$timeout", function ($parse, $timeout) {
  return {
    restrict: 'E',
    scope: {},
    template: '<div ng-click="onClick($event)" ng-class="{\'show-recipe-tooltip\': tooltipEnabled, \'cap-right\': capRight}" class="help-tooltip recipe-tooltip"><p>{{text|translate}}</p></div>',
    link: function link(scope, element, attrs) {
      var rtIdGetter = $parse(attrs.rtId);
      var tooltipElementId = rtIdGetter(scope.$parent);
      scope.tooltipEnabled = false;

      scope.onClick = function (e) {
        scope.$parent.recipe.raise("tooltip_click");
        e.stopImmediatePropagation();
      };

      scope.$on("_tooltip_display_" + tooltipElementId, function (event, args) {
        $timeout(function () {
          var windowWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
          var el = element[0];
          var offset = windowWidth - el.getBoundingClientRect().left;
          scope.capRight = offset < 300;
          scope.text = args.text;
          scope.tooltipEnabled = true;
        });
      });
      scope.$on("_tooltip_hide_" + tooltipElementId, function () {
        scope.tooltipEnabled = false;
      });
      scope.$on("__tooltip_hide_all", function () {
        scope.tooltipEnabled = false;
      });
    }
  };
}]);
;

var musicShowCaseApp = angular.module("MusicShowCaseApp");
musicShowCaseApp.directive("recipeWizard", ["$timeout", function ($timeout) {
  return {
    restrict: 'E',
    template: '<div class="recipe-wizard"><p>{{text}}</p></div>',
    link: function link(scope, element, attrs) {}
  };
}]);
;

var musicShowCaseApp = angular.module("MusicShowCaseApp");
musicShowCaseApp.directive("recycleBinCompactView", ["$timeout", "$uibModal", "FileRepository", "ErrMessage", function ($timeout, $uibModal, FileRepository, ErrMessage) {
  return {
    templateUrl: 'site/templates/directives/recycleBinCompactView.html',
    scope: {},
    link: function link(scope, element, attrs) {
      var observer = FileRepository.observeRecycled(function () {
        FileRepository.searchRecycled(null, {
          limit: 10
        }).then(function (result) {
          $timeout(function () {
            scope.files = result.results.slice(0, 4);
          });
        });
      });
      scope.$on("destroy", observer.destroy);

      scope.openRecycleBin = function () {
        // show recycle bin modal
        var modalIns = $uibModal.open({
          templateUrl: "site/templates/modal/recycleBin.html",
          controller: "recycleBinModalCtrl"
        });
      };

      scope.restore = function (file) {
        FileRepository.restoreFromRecycleBin(file.id).then(function () {
          if (file.type === 'project') {
            document.location = "#/editor/" + file.id;
          } else {
            document.location = "#/editor/" + file.project + "/" + file.type + "/" + file.id;
          }
        });
      };

      scope.onDropComplete = function (file) {
        FileRepository.moveToRecycleBin(file.id).catch(function (err) {
          if (err.type && err.type === 'cantremove') {
            ErrMessage('common.error_title', 'common.cantremove_error');
          } else {
            throw err;
          }
        });
      };
    }
  };
}]);
;

var musicShowCaseApp = angular.module("MusicShowCaseApp");
musicShowCaseApp.filter("icon_from_type", function () {
  return function (type) {
    if (type === "instrument") return "keyboard";
    if (type === "tempo") return "clock";
    if (type === "song") return "th";
    if (type === "pattern") return "music";
    if (type === "fx") return "magic";
    if (type === "project") return "folder";
    return "question";
  };
});
musicShowCaseApp.directive("typeIcon", ["$parse", function ($parse) {
  return {
    restrict: 'A',
    scope: {},
    replace: true,
    template: '<span class="fa fa-{{typeIcon | icon_from_type}}">',
    link: function link(scope, element, attrs) {
      var iconTypeName = $parse(attrs.typeIcon);
      scope.$parent.$watch(iconTypeName, function (newValue) {
        scope.typeIcon = iconTypeName(scope.$parent);
      });
    }
  };
}]);
;

var musicShowCaseApp = angular.module("MusicShowCaseApp");
musicShowCaseApp.factory("MusicObjectFactory", ["MusicContext", "$q", "TypeService", "pruneWrapper", function (MusicContext, $q, TypeService, pruneWrapper) {
  var fileOutputMap = new WeakMap();
  return function (options) {
    var nextId = 0;
    var _last_type = {};
    var ___cache = {};
    var monitor = options && options.monitor;

    var getConstructor = function getConstructor(descriptor, channel) {
      return TypeService.getType(descriptor.type).then(function (type) {
        if (type.monitor && !monitor) {
          return function (subobjects) {
            var wrapped = subobjects[0];
            return function (music) {
              return wrapped(music);
            };
          };
        }

        var ret = function ret(subobjects) {
          var buildComponents = [];

          if (type.components) {
            type.components.forEach(function (componentName) {
              if (!descriptor.data.modulation) return;
              var value = descriptor.data.modulation[componentName];
              if (!value) return;
              if (!value.data) return;
              if (!value.data.array) return;
              if (value.data.array.length === 0) return;
              buildComponents.push(createParametric(value).then(function (obj) {
                return {
                  name: componentName,
                  obj: obj
                };
              }));
            });
          }

          return $q.all(buildComponents).then(function (objs) {
            var components = {};
            objs.forEach(function (obj) {
              components[obj.name] = obj.obj;
            });
            _last_type[channel] = _last_type[channel] || new WeakMap();
            ___cache[channel] = ___cache[channel] || new WeakMap();
            var last_type = _last_type[channel];
            var __cache = ___cache[channel];
            /*>                  if (!last_type.has(descriptor)||last_type.get(descriptor) === descriptor.type) {
                                if (subobjects.length === 1) {
                                  if (__cache.has(descriptor) && __cache.get(descriptor)[subobjects[0].id]) {
                                    return $q(function(resolve) {
                                      resolve(__cache.get(descriptor)[subobjects[0].id]
                                            .update(descriptor.data, components));
                                    });
                                  }
                                } else if (subobjects.length === 0) {
                                  if (__cache.has(descriptor) && __cache.get(descriptor).noid) {
                                    return $q(function(resolve) {
                                      resolve(__cache.get(descriptor).noid
                                            .update(descriptor.data, components));
                                    });
                                  }
                                }
                              }*/

            last_type.set(descriptor, descriptor.type);
            var ret = type.constructor(descriptor.data, subobjects, components);
            nextId++;
            ret.id = nextId;

            if (subobjects.length === 1) {
              if (!__cache.has(descriptor)) __cache.set(descriptor, {});
              __cache.get(descriptor)[subobjects[0].id] = ret;
            } else if (subobjects.length === 0) {
              if (!__cache.has(descriptor)) __cache.set(descriptor, {});
              __cache.get(descriptor).noid = ret;
            }

            return ret;
          });
        };

        ret.subobjects = type.subobjects;
        return ret;
      });
    };

    var createParametricFromStack = function createParametricFromStack(array, idx, channel) {
      if (array.length === 0) return $q.when(null);
      var descriptor = array[idx];
      channel = channel || 0;
      return getConstructor(descriptor, channel).then(function (constructor) {
        if (constructor.subobjects) {
          var getObject = function getObject(d, index) {
            var newArray = d.data.array.concat(array.slice(idx + 1));
            return createParametricFromStack(newArray, 0, channel * 16 + index);
          };

          return $q.all(descriptor.data.subobjects.map(getObject)).then(function (objs) {
            return constructor(objs);
          });
        }

        if (array.length === 1) {
          return constructor([]);
        }

        return createParametricFromStack(array.slice(idx + 1), 0, channel).then(function (obj) {
          return constructor([obj]);
        });
      }).then(function (obj) {
        if (obj && obj.dataLink) {
          obj.dataLink(notifyChangeFor(descriptor));
        }

        return obj;
      });
    };

    var notifyChangeFor = function notifyChangeFor(descriptor) {
      return function (output) {
        if (fileOutputMap.has(descriptor)) {
          var ee = fileOutputMap.get(descriptor);
          ee.emit('changed', output);
        }
      };
    };

    var createParametric = function createParametric(descriptor) {
      if (descriptor.type === "stack") {
        return createParametricFromStack(descriptor.data.array, 0);
      } else {
        return getConstructor(descriptor, 0).then(function (constructor) {
          return constructor([]);
        });
      }
    };

    var destroyAll = function destroyAll(obj) {
      for (var channel in _last_type) {
        _last_type[channel] = new WeakMap();
      }

      for (var channel in ___cache) {
        ___cache[channel] = new WeakMap();
      }

      bases.forEach(function (base) {
        base.prune();
      });
      bases = [];
      return $q.when(null);
    };

    var bases = [];

    var create = function create(descriptor, music) {
      return createParametric(descriptor).then(function (fcn) {
        if (!fcn) return;

        if (music) {
          var base = music.sfxBase();
          bases.push(base);
          return fcn(base);
        }

        return MusicContext.runFcn(function (music) {
          var base = music.sfxBase();
          bases.push(base);
          return fcn(base);
        });
      });
    };

    var observeOutput = function observeOutput(file, listener) {
      var ee;

      if (fileOutputMap.has(file)) {
        ee = fileOutputMap.get(file);
      } else {
        ee = new EventEmitter();
        fileOutputMap.set(file, ee);
      }

      ee.on('changed', listener);
      return {
        destroy: function destroy() {
          ee.removeListener('changed', listener);
        }
      };
    };

    return {
      create: create,
      destroyAll: destroyAll,
      observeOutput: observeOutput
    };
  };
}]);
musicShowCaseApp.service("MusicContext", function () {
  var music;
  var context;

  var Recordable = function Recordable(music, playable, name) {
    this._playable = playable;
    this._music = music;
    this._name = name;
  };

  Recordable.prototype.record = function () {
    var playable = this._playable;
    var recording = music.record();
    var recordFileName = this._name;
    var playing = playable.play();
    MUSIC.Utils.FunctionSeq.preciseTimeout(function () {
      recording.stop();
      recording.exportWAV(function (blob) {
        var a = document.createElement("a");
        document.body.appendChild(a);
        a.style = "display: none";
        var url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = recordFileName + ".wav";
        a.click();
        window.URL.revokeObjectURL(url);
      });
    }, playable.duration());
  };

  return {
    resumeAudio: function resumeAudio() {
      if (!music) {
        context = new MUSIC.Context();
        music = context.sfxBase();
      }

      context.resume();
    },
    runFcn: function runFcn(f) {
      if (!music) {
        context = new MUSIC.Context();
        music = context.sfxBase();
      }

      return f(music);
    },
    record: function record(options, callback) {
      return this.runFcn(function () {
        return context.record(options, callback);
      });
    },
    run: function run(code) {
      if (music) {
        music.prune();
      }

      music = new MUSIC.Context().sfxBase();

      try {
        return {
          object: eval("(function() {\n" + code + "\n})")()
        };
      } catch (e) {
        return {
          error: e.toString()
        };
      }
    }
  };
});
musicShowCaseApp.service("Historial", [function () {
  return function () {
    var array = [];
    var currentVersion = 0;

    var undo = function undo() {
      if (currentVersion > 0) currentVersion--;
      return array[currentVersion];
    };

    var redo = function redo() {
      if (currentVersion < array.length - 1) currentVersion++;
      return array[currentVersion];
    };

    var registerVersion = function registerVersion(data) {
      array = array.slice(0, currentVersion + 1);
      array.push(data);
      if (array.length > 128) array = array.slice(1);
      currentVersion = array.length - 1;
    };

    return {
      registerVersion: registerVersion,
      undo: undo,
      redo: redo
    };
  };
}]);
musicShowCaseApp.service("Pattern", ["MUSIC", 'TICKS_PER_BEAT', function (MUSIC, TICKS_PER_BEAT) {
  var schedule = function schedule(noteseq, file, track, eventPreprocessor, onStop, ctx) {
    var events = track.events.sort(function (e1, e2) {
      return e1.s - e2.s;
    });
    var scaledEvents = events.map(function (evt) {
      return [evt.n, evt.s, evt.l, {
        tc: evt.tc
      }];
    });

    for (var i = 0; i < scaledEvents.length; i++) {
      var evt = scaledEvents[i];
      noteseq.push(eventPreprocessor(evt, scaledEvents), ctx);
    }

    noteseq.paddingTo(TICKS_PER_BEAT * file.measureCount * file.measure);
    noteseq.pushCallback([TICKS_PER_BEAT * file.measureCount * file.measure, onStop]);
    var totalBeats = file.measure * file.measureCount;
  };

  var noteseq = function noteseq(file, track, eventPreprocessor, onStop) {
    var noteseq = new MUSIC.NoteSequence();
    schedule(noteseq, file, track, eventPreprocessor, onStop);
    return noteseq;
  };

  var patternCompose = function patternCompose(file, instruments, base, onStop, options) {
    var start = options && options.start || 0;

    var isTempoTrack = function isTempoTrack(track, idx) {
      idx = base + idx;
      var instrument = instruments[track.instrument + '_' + idx];
      return instrument && instrument.tempo;
    };

    var getEvents = function getEvents(track) {
      return track.events;
    };

    var concat = function concat(a, b) {
      return a.concat(b);
    };

    var byStart = function byStart(a, b) {
      return a.s - b.s;
    };

    var songCtx = {};
    var noteseq = new MUSIC.NoteSequence(null, {
      time: MUSIC.Math.ticksToTime({
        bpm: file.bpm,
        ticks_per_beat: TICKS_PER_BEAT,
        bpm_events: file.tracks.filter(isTempoTrack).map(getEvents).reduce(concat, []).sort(byStart),
        start: start
      }),
      songCtx: songCtx
    });
    file.tracks.forEach(function (track, idx) {
      idx = base + idx;
      var instrument = instruments[track.instrument + '_' + idx];

      if (instrument && !instrument.tempo) {
        var eventPreprocessor = instrument.eventPreprocessor || function (x) {
          return x;
        };

        var context = MUSIC.NoteSequence.context(instrument, null, songCtx);
        schedule(noteseq, file, track, eventPreprocessor, onStop, context);
      }
    });
    var ret = noteseq.makePlayable(null);

    ret.schedule = function (noteSequence, songCtx) {
      var contexts = [];
      songCtx = songCtx || {};
      file.tracks.forEach(function (track, idx) {
        idx = base + idx;
        var instrument = instruments[track.instrument + '_' + idx];

        if (instrument) {
          var eventPreprocessor = instrument.eventPreprocessor || function (x) {
            return x;
          };

          var context = MUSIC.NoteSequence.context(instrument, null, songCtx);
          contexts.push(context);
          schedule(noteSequence, file, track, eventPreprocessor, onStop, context);
        }
      });
      return contexts;
    };

    ret.timeToTicks = function () {
      return MUSIC.Math.timeToTicks({
        bpm: file.bpm,
        ticks_per_beat: TICKS_PER_BEAT,
        bpm_events: file.tracks.filter(isTempoTrack).map(getEvents).reduce(concat, []).sort(byStart),
        start: start
      });
    };

    ret.bpm_events = file.tracks.filter(isTempoTrack).map(getEvents).reduce(concat, []).sort(byStart);
    return ret;
  };

  var higher = function higher(a, b) {
    return a > b ? a : b;
  };

  var computeMeasureCount = function computeMeasureCount(file, measure) {
    if (measure < 1) measure = 1;
    var endTime = file.tracks.map(function (track) {
      return track.events.map(function (evt) {
        return evt.s + evt.l;
      }).reduce(higher, 0);
    }).reduce(higher, 0);
    var measureLength = measure * TICKS_PER_BEAT;
    var measureCount = Math.floor((endTime - 1) / measureLength) + 1;
    if (measureCount < 1) return 1;
    return measureCount;
  };

  var getMutedState = function getMutedState(file) {
    var someSolo = file.tracks.some(function (t) {
      return t.solo;
    });
    return file.tracks.map(function (t) {
      if (someSolo) {
        return t.muted || !t.solo;
      } else {
        return t.muted || !t.instrument;
      }
    });
  };

  var concat = function concat(a, b) {
    return a.concat(b);
  };

  var _not = function _not(self) {
    return function (evt) {
      return evt !== self;
    };
  };

  var findClipS = function findClipS(pattern, track, self, s) {
    var nearest = function nearest(c1, c2) {
      return Math.abs(self.s - c1) < Math.abs(self.s - c2) ? c1 : c2;
    };

    var allEvents = pattern.tracks.map(function (track) {
      return track.events.filter(_not(self));
    }).reduce(concat);
    var allOtherEvents = pattern.tracks.map(function (tr) {
      if (track === tr) return [];
      return tr.events.filter(_not(self));
    }).reduce(concat);
    if (allEvents.length === 0) return 0;
    var clips = allEvents.map(function (evt) {
      return evt.s + evt.l;
    }).concat(allEvents.map(function (evt) {
      return evt.s - self.l;
    })).concat(allOtherEvents.map(function (evt) {
      return evt.s;
    }));
    return clips.reduce(nearest);
  };

  var findClipL = function findClipL(pattern, track, self, s) {
    var nearest = function nearest(c1, c2) {
      return Math.abs(self.s + self.l - c1) < Math.abs(self.s + self.l - c2) ? c1 : c2;
    };

    var allEvents = pattern.tracks.map(function (track) {
      return track.events.filter(_not(self));
    }).reduce(concat);
    var allOtherEvents = pattern.tracks.map(function (tr) {
      if (track === tr) return [];
      return tr.events.filter(_not(self));
    }).reduce(concat);
    if (allEvents.length === 0) return 0;
    var clips = allEvents.map(function (evt) {
      return evt.s;
    }).concat(allOtherEvents.map(function (evt) {
      return evt.s + evt.l;
    }));
    return clips.reduce(nearest) - self.s;
  };

  var cutEvent = function cutEvent(pattern, track, self) {
    var allEvents = track.events.filter(_not(self));
    allEvents.filter(function (evt) {
      return evt.s > self.s;
    }).forEach(function (evt) {
      if (self.s + self.l > evt.s) {
        self.l = evt.s - self.s;
      }
    });
    var measureTicks = pattern.measure * TICKS_PER_BEAT;

    if ((self.s + self.l) % measureTicks < self.s % measureTicks) {
      self.l = self.l - (self.s + self.l) % measureTicks;
    }
  };

  var collision = function collision(track, self) {
    var allEvents = track.events.filter(_not(self));
    return allEvents.some(function (evt) {
      if (evt.n !== self.n) return false;
      if (evt.s <= self.s && self.s < evt.s + evt.l) return true;
      if (self.s <= evt.s && evt.s < self.s + self.l) return true;
      return false;
    });
  };

  return {
    noteseq: noteseq,
    patternCompose: patternCompose,
    computeMeasureCount: computeMeasureCount,
    getMutedState: getMutedState,
    findClipL: findClipL,
    findClipS: findClipS,
    cutEvent: cutEvent,
    collision: collision
  };
}]);
musicShowCaseApp.service("InstrumentSet", ["FileRepository", "MusicObjectFactory", "MusicContext", function (FileRepository, MusicObjectFactory, MusicContext) {
  var ret = function ret(music) {
    var musicObjectFactory;
    var trackControl = {};
    var set = {};
    var created = [];

    var load = function load(id, trackNo) {
      trackNo = trackNo || 0;

      var _id = id + "_" + trackNo;

      if (!set[_id]) {
        trackControl[trackNo] = trackControl[trackNo] || music.gain(1.0);
        set[_id] = FileRepository.getFile(id).then(function (file) {
          if (file.index.type === 'instrument') {
            if (!musicObjectFactory) musicObjectFactory = MusicObjectFactory();
            return musicObjectFactory.create(file.contents, trackControl[trackNo]).then(function (obj) {
              created.push(obj);
              return obj;
            });
          } else {
            return {
              tempo: true
            };
          }
        });
      }

      return set[_id];
    };

    var dispose = function dispose() {
      created.forEach(function (instrument) {
        if (instrument.dispose) {
          instrument.dispose();
        }
      });

      if (musicObjectFactory) {
        return musicObjectFactory.destroyAll();
      }
    };

    var mute = function mute(trackNo, muteState) {
      trackControl[trackNo] = trackControl[trackNo] || music.gain(1.0);
      trackControl[trackNo].update(muteState ? 0.0 : 1.0);
    };

    return {
      load: load,
      mute: mute,
      all: set,
      dispose: dispose
    };
  };

  return function (music) {
    if (music) return ret(music);
    return MusicContext.runFcn(ret);
  };
}]);
musicShowCaseApp.service("FileRepository", ["$http", "$q", "TypeService", "Historial", "Index", "_localforage", function ($http, $q, TypeService, Historial, Index, localforage) {
  var createdFilesIndex = [];
  var createdFiles = {};
  var builtIns = ["site/builtin/defaultProject.json", "site/builtin/samples.json", "site/builtin/smb-underworld.json", "site/builtin/smb-overworld.json", "site/builtin/bomberman.json", "site/builtin/entertainer.json", "site/builtin/eva-thanatos.json", "site/builtin/bioshock-solace.json"];

  var loadBuiltIn = function loadBuiltIn(uri) {
    return $http.get(uri).then(function (r) {
      r.data.forEach(function (obj) {
        var objectId = obj.id;
        createdFiles[objectId] = obj.contents;
        createdFilesIndex.push({
          project: obj.project,
          type: obj.type,
          name: obj.name,
          id: objectId,
          ref: obj.ref,
          builtIn: true
        });
      });
    });
  };

  var createDefault = function createDefault(id, type, name, content) {
    createdFilesIndex.push({
      project: "default",
      type: type,
      id: id,
      name: name,
      noExportable: true
    });
    createdFiles[id] = content;
  };

  createDefault('tempo', 'tempo', 'Tempo', {});
  var builtInLoaded = $q.all(builtIns.map(loadBuiltIn));

  var createId = function createId() {
    var array = [];

    for (var i = 0; i < 32; i++) {
      var value = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 'a', 'b', 'c', 'd', 'e', 'f'][Math.floor(Math.random() * 16)];
      array.push(value);
    }

    return array.join("");
  };

  var genericStateEmmiter = new EventEmitter();
  var recycledEmmiter = new EventEmitter();
  var defaultFile = {
    instrument: {
      type: "stack",
      data: {
        array: []
      }
    },
    song: {
      measure: 4,
      bpm: 140,
      tracks: [{
        blocks: [{}, {}, {}]
      }, {
        blocks: [{}, {}, {}]
      }]
    },
    pattern: {
      measure: 4,
      measureCount: 1,
      bpm: 140,
      selectedTrack: 0,
      tracks: [{
        scroll: 1000,
        events: []
      }],
      scrollLeft: 0
    }
  };
  var hist = new WeakMap();

  var updateFile = function updateFile(id, contents, options) {
    return $q.when().then(function () {
      var localFile = createdFilesIndex.filter(function (x) {
        return x.id === id;
      })[0];
      if (localFile) return localFile;
      return storageIndex.getEntry(id);
    }).then(function (localFile) {
      if (localFile) {
        var serialized = MUSIC.Formats.MultiSerializer.serialize(localFile.type, contents);

        if (!options || !options.noHistory) {
          hist[id] = hist[id] || Historial();
          hist[id].registerVersion(JSON.stringify(contents));
        }

        return localforage.setItem(id, serialized);
      }
    }).then(function () {
      return recycleIndex.reload();
    }).then(function () {
      recycledEmmiter.emit("changed");
    });
  };

  var destroyFile = function destroyFile(id) {
    return localforage.removeItem(id).then(function () {
      return $q.all({
        r: recycleIndex.removeEntry(id),
        l: storageIndex.removeEntry(id)
      });
    });
  };

  var purgeFromRecycleBin = function purgeFromRecycleBin(id) {
    return recycleIndex.removeEntry(id);
  };

  var restoreFromRecycleBin = function restoreFromRecycleBin(id) {
    return _restoreFromRecycleBin(id).then(function () {
      genericStateEmmiter.emit("changed");
      recycledEmmiter.emit("changed");
    });
  };

  var _restoreFromRecycleBin = function _restoreFromRecycleBin(id) {
    return recycleIndex.getEntry(id).then(function (localFile) {
      if (localFile) {
        return recycleIndex.removeEntry(id).then(function () {
          return storageIndex.createEntry(localFile);
        }).then(function () {
          var refs = localFile.ref || [];
          if (localFile.project) refs.push(localFile.project);
          return $q.all(refs.map(_restoreFromRecycleBin));
        });
      }
    });
  };

  var moveToRecycleBin = function moveToRecycleBin(id) {
    return _moveToRecycleBin(id).then(function () {
      genericStateEmmiter.emit("changed");
      recycledEmmiter.emit("changed");
    });
  };

  var _moveToRecycleBin = function _moveToRecycleBin(id) {
    var getId = function getId(x) {
      return x.id;
    };

    var isProjectType = function isProjectType(file) {
      return file.type === 'project';
    };

    return storageIndex.willRemove(id).then(function () {
      return storageIndex.getEntry(id).then(function (localFile) {
        if (localFile) {
          return recycleIndex.getAll().then(function (idx) {
            if (idx && idx.length >= 100) {
              return recycleIndex.getFreeItems().then(function (idx) {
                if (!idx[0]) return;
                return recycleIndex.removeEntry(idx[0].id).then(function () {
                  return localforage.removeItem(id);
                });
              });
            }
          }).then(function () {
            return storageIndex.removeEntry(id);
          }).then(function () {
            return recycleIndex.createEntry(localFile);
          });
        }
      });
    }).then(function () {
      return storageIndex.getOrphan(createdFilesIndex.map(getId), createdFilesIndex.filter(isProjectType).map(getId));
    }).then(function (orphanFiles) {
      return $q.all(orphanFiles.map(getId).map(_moveToRecycleBin)).catch(function (e) {
        console.error(e);
      });
    });
  };

  var getPatternSongs = function getPatternSongs(options) {
    var byProject = function byProject(file) {
      return file.project === options.project;
    };

    var byType = function byType(file) {
      return file.type === 'pattern' || file.type === 'song';
    };

    var typeSong = function typeSong(file) {
      return file.type === 'song';
    };

    var loadFile = function loadFile(file) {
      return getFile(file.id);
    };

    return $q.all({
      storage: storageIndex.getAll(),
      builtin: createdFilesIndex
    }).then(function (result) {
      var files = result.storage.concat(result.builtin);
      var fileIndexes = files.filter(byProject).filter(byType);

      if (fileIndexes.some(typeSong)) {
        fileIndexes = fileIndexes.filter(typeSong);
      }

      return $q.all(fileIndexes.map(loadFile));
    });
  };

  var mode = function mode(files, fcn) {
    var obj = {};
    files.forEach(function (file) {
      var value = fcn(file);
      obj[value] = (obj[value] || 0) + 1;
    });
    var maxcount = 0;

    var _m;

    for (var k in obj) {
      var count = obj[k];

      if (count > maxcount) {
        _m = k;
        maxcount = count;
      }
    }

    ;
    return _m;
  };

  var getDefaultMeasure = function getDefaultMeasure(options) {
    return getPatternSongs(options).then(function (files) {
      if (!files.length) return 4;
      return mode(files, function (file) {
        return file.contents.measure;
      });
    });
  };

  var getDefaultBPM = function getDefaultBPM(options) {
    return getPatternSongs(options).then(function (files) {
      if (!files.length) return 140;
      return mode(files, function (file) {
        return file.contents.bpm;
      });
    });
  };

  var getFile = function getFile(id) {
    var builtIn = false;
    var changed = false;
    return builtInLoaded.then(function () {
      var localFile = createdFilesIndex.filter(function (x) {
        return x.id === id;
      })[0];

      if (localFile) {
        builtIn = true;
        return localFile;
      }

      return storageIndex.getEntry(id);
    }).then(function (localFile) {
      return localforage.getItem(id).then(function (serialized) {
        if (serialized) {
          var contents = MUSIC.Formats.MultiSerializer.deserialize(localFile.type, serialized);
          return {
            index: {
              name: localFile.name,
              id: localFile.id,
              builtIn: builtIn,
              type: localFile.type,
              ref: localFile.ref || getRefs(localFile.type, contents),
              updated: true,
              project: localFile.project
            },
            contents: contents
          };
        } else {
          if (localFile) {
            return {
              index: {
                name: localFile.name,
                id: localFile.id,
                builtIn: builtIn,
                type: localFile.type,
                ref: localFile.ref,
                project: localFile.project,
                noExportable: localFile.noExportable
              },
              contents: JSON.parse(JSON.stringify(createdFiles[id]))
            };
          }

          ;
        }
      });
    });
  };

  var createFile = function createFile(options) {
    var newid = options.id || createId();
    var contents = options.contents || defaultFile[options.type] || {};
    return $q.all({
      defaultMeasure: getDefaultMeasure(options),
      defaultBPM: getDefaultBPM(options)
    }).then(function (value) {
      contents.measure = parseInt(value.defaultMeasure);
      contents.bpm = parseInt(value.defaultBPM);
    }).then(function () {
      hist[newid] = hist[newid] || Historial();
      hist[newid].registerVersion(JSON.stringify(contents));
      var serialized = MUSIC.Formats.MultiSerializer.serialize(options.type, contents);
      return localforage.setItem(newid, serialized);
    }).then(function () {
      return storageIndex.createEntry({
        type: options.type,
        name: options.name,
        project: options.project,
        id: newid,
        ref: options.ref
      });
    }).then(function () {
      return recycleIndex.reload();
    }).then(function () {
      genericStateEmmiter.emit("changed");
      recycledEmmiter.emit("changed");
      return newid;
    }).catch(function (err) {
      debugger;
    });
  };

  var s0 = MUSIC.Formats.JSONSerializer;
  var s1 = MUSIC.Formats.CachedSerializer(MUSIC.Formats.PackedJSONSerializer);
  var s2 = MUSIC.Formats.HuffmanSerializerWrapper(s0);
  var s3 = MUSIC.Formats.HuffmanSerializerWrapper(s1);
  var s4 = MUSIC.Formats.CachedSerializer(MUSIC.Formats.PackedJSONSerializerB);
  var s5 = MUSIC.Formats.HuffmanSerializerWrapper(s4);
  MUSIC.Formats.MultiSerializer.setSerializers([{
    serializer: s0,
    base: '0'
  }, {
    serializer: s1,
    base: '1'
  }, {
    serializer: s2,
    base: '2'
  }, {
    serializer: s3,
    base: '3'
  }, {
    serializer: s4,
    base: '4'
  }, {
    serializer: s5,
    base: '5'
  }]);
  var storageIndex = Index("index");
  var recycleIndex = Index("recycle");
  recycleIndex.getAll().then(function () {
    recycledEmmiter.emit("changed");
  });

  var changed = function changed() {
    genericStateEmmiter.emit("changed");
    recycledEmmiter.emit("changed");
  };

  var getRefs = function getRefs(type, contents) {
    var ref = [];

    if (type === 'song') {
      contents.tracks.forEach(function (track) {
        for (var i = 0; i < track.blocks.length; i++) {
          var blockId = track.blocks[i].id;
          if (blockId && ref.indexOf(blockId) === -1) ref.push(blockId);
        }
      });
    } else if (type === 'pattern') {
      contents.tracks.forEach(function (track) {
        if (track.instrument && ref.indexOf(track.instrument) === -1) ref.push(track.instrument);
      });
    }

    return ref;
  };

  var getProjectFiles = function getProjectFiles(projectId) {
    return storageIndex.getAll().then(function (idx) {
      return idx.concat(createdFilesIndex).filter(function (file) {
        return file.project === projectId || file.id === projectId;
      });
    });
  };

  return {
    getRefs: getRefs,
    getProjectFiles: getProjectFiles,
    undo: function undo(id) {
      var oldVer = hist[id].undo();
      if (!oldVer) return;
      return updateFile(id, JSON.parse(oldVer), {
        noHistory: true
      });
    },
    redo: function redo(id) {
      var nextVer = hist[id].redo();
      if (!nextVer) return;
      return updateFile(id, JSON.parse(nextVer), {
        noHistory: true
      });
    },
    purgeFromRecycleBin: purgeFromRecycleBin,
    moveToRecycleBin: moveToRecycleBin,
    restoreFromRecycleBin: restoreFromRecycleBin,
    destroyFile: destroyFile,
    createFile: createFile,
    changed: changed,
    updateIndex: function updateIndex(id, attributes) {
      var localFile = createdFilesIndex.filter(function (x) {
        return x.id === id;
      })[0];

      if (localFile) {
        localFile.name = attributes.name;
        genericStateEmmiter.emit("changed");
        return $q.when(localFile);
      }

      return storageIndex.updateEntry(id, attributes).then(function () {
        genericStateEmmiter.emit("changed");
      });
    },
    getIndex: function getIndex(id) {
      var localFile = createdFilesIndex.filter(function (x) {
        return x.id === id;
      })[0];
      if (localFile) return $q.when(localFile);
      return storageIndex.getEntry(id);
    },
    updateFile: updateFile,
    getFile: getFile,
    observeRecycled: function observeRecycled(callback) {
      recycleIndex.reload().then(function () {
        recycledEmmiter.emit("changed");
      });
      recycledEmmiter.addListener("changed", callback);
      return {
        destroy: function destroy() {
          recycledEmmiter.removeListener("changed", callback);
        }
      };
    },
    searchRecycled: function searchRecycled(keyword, options) {
      options = options || {};
      var limit = typeof options.limit === 'undefined' ? 10 : options.limit;

      var hasKeyword = function hasKeyword() {
        return true;
      };

      if (keyword && keyword.length > 0) {
        keyword = keyword.toLowerCase();

        hasKeyword = function hasKeyword(x) {
          return x.name.toLowerCase().indexOf(keyword) !== -1;
        };
      }

      return recycleIndex.getAll().then(function (index) {
        var filtered = (index || []).filter(hasKeyword).reverse();
        return {
          results: limit ? filtered.slice(0, limit) : filtered,
          total: filtered.length
        };
      });
    },
    search: function search(keyword, options) {
      options = options || {};

      var hasKeyword = function hasKeyword() {
        return true;
      };

      if (keyword && keyword.length > 0) {
        keyword = keyword.toLowerCase();

        hasKeyword = function hasKeyword(x) {
          return x.name.toLowerCase().indexOf(keyword) !== -1;
        };
      }

      var byProject = function byProject() {
        return true;
      };

      if (options.project) {
        byProject = function byProject(x) {
          if (options.type) {
            if (options.type.indexOf(x.type) === -1) return false;
          }

          return x.type === 'tempo' || options.project.indexOf(x.project) !== -1;
        };
      } else {
        if (options.type) {
          byProject = function byProject(x) {
            if (options.type.indexOf(x.type) === -1) return false;
            return true;
          };
        }
      }

      var ee = new EventEmitter();

      var updateSearch = function updateSearch() {
        builtInLoaded.then(function () {
          $q.all([storageIndex.getAll(), createdFilesIndex, TypeService.getTypes(keyword)]).then(function (result) {
            var notInRes = function notInRes(item) {
              return true; //                return ids.indexOf(item.id) === -1;
            };

            var res = result[0] || [];
            var ids = res.map(function (x) {
              return x.id;
            });
            if (result[1]) res = res.concat(result[1].filter(notInRes));
            res = res.concat(result[2].map(convertType));
            res = res.filter(hasKeyword).filter(byProject);
            ee.emit("changed", {
              results: res.slice(0, 15),
              total: res.length
            });
          });
        });
      };

      return {
        observe: function observe(cb) {
          ee.addListener("changed", cb);
          genericStateEmmiter.addListener("changed", updateSearch);
          updateSearch();
          return {
            close: function close() {
              ee.removeListener("changed", cb);
              genericStateEmmiter.removeListener("changed", updateSearch);
            }
          };
        }
      };
    }
  };
}]);

var convertType = function convertType(type) {
  return {
    type: "fx",
    name: type.name,
    id: "type" + type.name,
    project: 'core'
  };
};

musicShowCaseApp.factory("pruneWrapper", function () {
  return function (fcn) {
    if (!fcn._wrapper) {
      fcn._wrapper = function (music, modWrapper) {
        var sfxBase = music.sfxBase();
        var obj = fcn(sfxBase, modWrapper);
        var originalDispose;

        if (obj.dispose) {
          originalDispose = obj.dispose.bind(obj);

          obj.dispose = function () {
            originalDispose();
            sfxBase.prune();
          };
        } else {
          obj.dispose = function () {
            sfxBase.prune();
          };
        }

        return obj;
      };
    }

    return fcn._wrapper;
  };
});
musicShowCaseApp.factory("sfxBaseOneEntryCacheWrapper", function () {
  return function (fcn) {
    var _lastmusic;

    var _lastinstance;

    var ret = function ret(music, options) {
      options = options || {};

      if (!options.nowrap) {
        if (_lastmusic && _lastmusic === music) {
          return _lastinstance;
        }
      }

      _lastmusic = music;
      _lastinstance = fcn(music, options);
      return _lastinstance;
    };

    ret.update = function () {
      fcn.update.bind(fcn).apply(null, arguments);
      return ret;
    };

    return ret;
  };
});
;

var musicShowCaseApp = angular.module("MusicShowCaseApp");
musicShowCaseApp.factory("ErrMessage", ['$uibModal', '$translate', function ($uibModal, $translate) {
  return function (_title, _text) {
    var modalIns = $uibModal.open({
      templateUrl: "site/templates/modal/error.html",
      controller: "errorModalCtrl",
      windowClass: 'error',
      resolve: {
        text: function text() {
          return $translate(_text);
        },
        title: function title() {
          return $translate(_title);
        }
      }
    });
    return modalIns;
  };
}]);
;

var musicShowCaseApp = angular.module("MusicShowCaseApp");
musicShowCaseApp.factory("Export", ['$q', 'FileRepository', function ($q, FileRepository) {
  var exportContents = function exportContents(name, contents) {
    var a = document.createElement("a");
    document.body.appendChild(a);
    a.style = "display: none";
    var blob = new Blob([JSON.stringify(contents)]);
    var url = window.URL.createObjectURL(blob);
    a.href = url;
    a.download = name + ".json";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  var getRelatedIds = function getRelatedIds(file) {
    if (file.index.type === 'project') {
      return file.index.ref || [];
    } else {
      var ret = FileRepository.getRefs(file.index.type, file.contents);
      if (file.index.project) ret.push(file.index.project);
      return ret;
    }
  };

  var concat = function concat(x, y) {
    return x.concat(y);
  };

  var getFileWithRelated = function getFileWithRelated(id) {
    var ret = [];
    return FileRepository.getFile(id).then(function (file) {
      if (!file) return [];

      if (file.index.noExportable) {
        return [];
      }

      ret.push({
        name: file.index.name,
        type: file.index.type,
        id: file.index.id,
        contents: file.contents,
        project: file.index.project,
        ref: file.index.ref
      });
      return $q.all(getRelatedIds(file).map(getFileWithRelated)).then(function (relarray) {
        relarray.forEach(function (rel) {
          ret = ret.concat(rel);
        });
        return ret;
      });
    });
  };

  var uniq = function uniq(array) {
    var files = {};
    array.forEach(function (file) {
      files[file.id] = file;
    });
    return Object.keys(files).map(function (id) {
      return files[id];
    });
  };

  var exportProject = function exportProject(name, id) {
    var getId = function getId(x) {
      return x.id;
    };

    FileRepository.getProjectFiles(id).then(function (files) {
      return $q.all(files.map(getId).map(getFileWithRelated));
    }).then(function (array) {
      array = array.reduce(concat, []);
      exportContents(name, uniq(array));
    });
  };

  var exportFile = function exportFile(name, id) {
    return getFileWithRelated(id).then(function (array) {
      exportContents(name, uniq(array));
    });
  };

  var importFile = function importFile(contents) {
    var importItem = function importItem(item) {
      return function () {
        return FileRepository.getIndex(item.id).then(function (index) {
          if (index) {
            return FileRepository.updateFile(item.id, item.contents).then(function () {
              return FileRepository.updateIndex(item.id, {
                name: item.name,
                project: item.project
              });
            });
          } else {
            return FileRepository.purgeFromRecycleBin(item.id).then(function () {
              return FileRepository.createFile({
                id: item.id,
                contents: item.contents,
                type: item.type,
                name: item.name,
                project: item.project,
                ref: item.ref
              });
            });
          }
        });
      };
    };

    return $q.when().then(function () {
      var p = null;
      var parsed = JSON.parse(contents);
      var firstItem = parsed[0];
      parsed.forEach(function (item) {
        if (p) {
          p = p.then(importItem(item));
        } else {
          p = importItem(item)();
        }
      });
      return p.then(function () {
        return {
          id: firstItem.id,
          type: firstItem.type,
          project: firstItem.project
        };
      });
    });
  };

  return {
    exportContents: exportContents,
    exportFile: exportFile,
    exportProject: exportProject,
    importFile: importFile
  };
}]);
;

var musicShowCaseApp = angular.module("MusicShowCaseApp");
musicShowCaseApp.factory("Index", ['$q', '$timeout', 'Sync', '_localforage', function ($q, $timeout, Sync, localforage) {
  function CantRemove(id, file) {
    this.id = id;
    this.file = file;
    this.stack = new Error().stack;
    this.type = "cantremove";
  }

  CantRemove.prototype = new Error();

  var IndexFactory = function IndexFactory(indexName) {
    var entryChange = new Sync();

    var reload = function reload() {
      // load stoargeIndex
      var storageIndex;
      storageIndex = localforage.getItem(indexName).then(function (array) {
        return array || [];
      });
      return storageIndex;
    };

    var clearItem = function clearItem(data) {
      var ret = {
        id: data.id,
        name: data.name,
        type: data.type,
        project: data.project,
        ref: data.ref
      };
      if (data.c) ret.c = data.c;
      return ret;
    };

    var removeEntry = entryChange.sync(function (id) {
      return reload().then(function (index) {
        if (!index) return;
        index = index.filter(function (x) {
          return x.id !== id;
        });
        return localforage.setItem(indexName, index.map(clearItem));
      }).then(reload);
    });

    var getEntry = function getEntry(id) {
      return reload().then(function (index) {
        if (!index) return null;
        return index.filter(function (x) {
          return x.id === id;
        })[0];
      });
    };

    var createEntry = entryChange.sync(function (data) {
      return reload().then(function (index) {
        index = index || [];

        if (IndexFactory.isolatedContext) {
          data.c = IndexFactory.isolatedContext;
        }

        index.push(data);
        return localforage.setItem(indexName, index.map(clearItem));
      }).then(reload);
    });
    var updateEntry = entryChange.sync(function (id, attributes) {
      return reload().then(function (index) {
        var localFile = index.filter(function (x) {
          return x.id === id;
        })[0];
        localFile.name = attributes.name;
        localFile.ref = attributes.ref;

        if (IndexFactory.isolatedContext) {
          localFile.c = IndexFactory.isolatedContext;
        }

        return localforage.setItem(indexName, index.map(clearItem));
      }).then(reload);
    });

    var getAll = function getAll() {
      return reload().then(function (index) {
        var ic = IndexFactory.isolatedContext;

        if (ic) {
          return index.filter(function (entry) {
            return entry.c === ic;
          });
        }

        return index;
      });
    };

    var refs = function refs(index, id) {
      return index.filter(function (file) {
        return (file.ref || []).indexOf(id) !== -1;
      });
    };

    var isProjectType = function isProjectType(file) {
      return file.type === 'project';
    };

    var getId = function getId(file) {
      return file.id;
    };

    var willRemove = function willRemove(id) {
      return reload().then(function (index) {
        var localFile = index.filter(function (x) {
          return x.id === id;
        })[0];
        if (!localFile) return;
        var r = refs(index, id); // if the item has no references, it can be removed!

        if (r.length === 0) return;

        if (localFile.type === 'project') {
          if (r.some(isProjectType)) {
            throw new CantRemove(id, localFile);
          }
        } else {
          throw new CantRemove(id, localFile);
        }

        return $q.all(r.map(getId).map(willRemove));
      });
    };

    var getOrphan = function getOrphan(extraIds, extraProjectIds) {
      return reload().then(function (index) {
        var projectIds = index.filter(isProjectType).map(getId).concat(extraProjectIds);
        var ids = index.map(getId).concat(extraIds || []);

        var isOrphan = function isOrphan(file) {
          if (file.project) {
            if (projectIds.indexOf(file.project) === -1) {
              return true;
            }
          }

          return (file.ref || []).some(function (id) {
            return ids.indexOf(id) === -1;
          });
        };

        return index.filter(isOrphan);
      });
    };

    var getFreeItems = function getFreeItems() {
      return reload().then(function (index) {
        var referenced = {};
        index.forEach(function (file) {
          (file.ref || []).forEach(function (r) {
            referenced[r] = true;
          });
        });
        return index.filter(function (file) {
          return !referenced[file.id];
        });
      });
    };

    reload();
    return {
      willRemove: willRemove,
      reload: reload,
      removeEntry: removeEntry,
      getOrphan: getOrphan,
      getEntry: getEntry,
      getFreeItems: getFreeItems,
      createEntry: createEntry,
      updateEntry: updateEntry,
      getAll: getAll
    };
  };

  return IndexFactory;
}]);
;

var musicJs = angular.module("MusicShowCaseApp");
musicJs.factory("Midi", ['$q', 'Sync', '_localforage', function ($q, Sync, localforage) {
  var setupStore = new Sync();
  var midiSetupRequested;
  var midiLoaded;
  var storeInputEnabled = setupStore.sync(function (inputId, enabled) {
    return localforage.getItem("midiSetup").then(function (midiSetup) {
      midiSetup = midiSetup || {};
      midiSetup.inputs = midiSetup.inputs || {};
      midiSetup.inputs[inputId] = enabled;
      return localforage.setItem("midiSetup", midiSetup);
    });
  });
  var midiAccessRequested;

  if (navigator.requestMIDIAccess) {
    midiAccessRequested = navigator.requestMIDIAccess({
      sysex: false
    });
  }

  var wrapInput = function wrapInput(input) {
    var enable = function enable() {
      input.onmidimessage = onMIDIMessage;
      input.enabled = true;
      storeInputEnabled(input.id, true);
    };

    var disable = function disable() {
      input.onmidimessage = null;
      input.enabled = false;
      storeInputEnabled(input.id, false);
    };

    var update = function update() {
      if (this.enabled) {
        enable();
      } else {
        disable();
      }
    };

    var ret = {
      enabled: !!input.onmidimessage,
      enable: enable,
      disable: disable,
      update: update,
      name: input.name,
      id: input.id
    };
    return ret;
  };

  var getStatus = function getStatus() {
    return midiLoaded.then(function () {
      return midiAccessRequested;
    }).then(function (midiAccess) {
      var data = {
        connected: false
      };
      var inputs = midiAccess.inputs.values();

      for (var input = inputs.next(); input && !input.done; input = inputs.next()) {
        if (input.value.onmidimessage) {
          data.connected = true;
        }
      }

      return data;
    });
  };

  var getInputs = function getInputs() {
    return midiAccessRequested.then(function (midiAccess) {
      var retInputs = [];
      var inputs = midiAccess.inputs.values();

      for (var input = inputs.next(); input && !input.done; input = inputs.next()) {
        retInputs.push(wrapInput(input.value));
      }

      return retInputs;
    });
  };

  var eventListeners = [];

  var registerEventListener = function registerEventListener(callback) {
    var destroy = function destroy() {
      eventListeners = eventListeners.filter(function (c) {
        return c !== callback;
      });
    };

    eventListeners.push(callback);
    return {
      destroy: destroy
    };
  };

  var onMIDIMessage = function onMIDIMessage(event) {
    midiSetupRequested.then(function (cfg) {
      event.data[1] = event.data[1] - cfg.octave * 12 + cfg.transpose;
      eventListeners.forEach(function (callback) {
        callback(event);
      });
    });
  };

  var reloadConfig = function reloadConfig() {
    midiSetupRequested = localforage.getItem("midiSetup").then(function (midiSetup) {
      if (!midiSetup) midiSetup = {};
      if (typeof midiSetup.octave === 'undefined') midiSetup.octave = 3;
      if (typeof midiSetup.transpose === 'undefined') midiSetup.transpose = 0;
      return midiSetup;
    });
  };

  reloadConfig();
  midiLoaded = $q.all({
    inputs: getInputs(),
    midiSetup: midiSetupRequested
  }).then(function (result) {
    var midiSetup = result.midiSetup;

    if (midiSetup && midiSetup.inputs) {
      result.inputs.forEach(function (input) {
        if (midiSetup.inputs[input.id]) {
          input.enable();
        }
      });
    }
  });

  var getConfig = function getConfig() {
    return midiSetupRequested;
  };

  var setConfig = setupStore.sync(function (cfg) {
    return localforage.getItem("midiSetup").then(function (midiSetup) {
      midiSetup = midiSetup || {};
      midiSetup.inputs = midiSetup.inputs || {};
      midiSetup.octave = cfg.octave;
      midiSetup.transpose = cfg.transpose;
      return localforage.setItem("midiSetup", midiSetup);
    }).then(reloadConfig);
  });
  return {
    getInputs: getInputs,
    registerEventListener: registerEventListener,
    getStatus: getStatus,
    getConfig: getConfig,
    setConfig: setConfig
  };
}]);
;

var musicShowCaseApp = angular.module("MusicShowCaseApp");
musicShowCaseApp.factory("Recipe", ['$q', '$timeout', '$rootScope', '$http', 'Index', 'FileRepository', function ($q, $timeout, $rootScope, $http, Index, FileRepository) {
  var recipeList = ['intro', 'create_a_song', 'create_an_instrument'];
  var blinks = [];
  var currentRecipe = {
    steps: [],
    currentStep: 0
  };

  var handleEvent = function handleEvent(event, args) {
    var step = currentRecipe.steps[currentRecipe.currentStep];
    if (!step) return;
    if (step.eventHandler) step.eventHandler(event, args);
  };

  var runRecipeStep = function runRecipeStep(currentStep) {
    currentStep = currentStep || currentRecipe.currentStep;
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

    (step.blink || []).forEach(function (blink_id) {
      blinks.push(blink_id);
      $rootScope.$broadcast("_blink_enable_" + blink_id);
    });

    for (var tooltip_id in step.tooltip || {}) {
      $rootScope.$broadcast("_tooltip_display_" + tooltip_id, {
        text: step.tooltip[tooltip_id]
      });
    }

    if (step.duration) {
      $timeout(function () {
        if (currentRecipe.currentStep <= currentStep) {
          currentRecipe.currentStep = currentStep + 1;
          runRecipeStep();
        }
      }, step.duration * 1000);
    }
  };

  var next_step_on = function next_step_on(eventName) {
    return function (event, args) {
      if (event === eventName) {
        currentRecipe.currentStep++;
        runRecipeStep();
      }
    };
  };

  var delay = function delay(fcn, ms) {
    return function (event, args) {
      $timeout(function () {
        fcn(event, args);
      }, ms);
    };
  };

  var getLocaleName = function getLocaleName(stepIndex, tooltipName) {
    return "s" + stepIndex + "_tooltip_" + tooltipName;
  };

  var start = function start(name) {
    var loadEventHandler = function loadEventHandler(eventHandlerData) {
      if (eventHandlerData.next_step_on) {
        return next_step_on(eventHandlerData.next_step_on);
      } else if (eventHandlerData.delay) {
        return delay(loadEventHandler(eventHandlerData.inner), eventHandlerData.delay);
      }
    };

    var loadStep = function loadStep(stepData, stepIndex) {
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

    var createFile = function createFile(file) {
      return FileRepository.destroyFile(file.index.id).then(function () {
        return FileRepository.createFile({
          id: file.index.id,
          type: file.index.type,
          project: file.index.project,
          name: file.index.name,
          contents: file.contents
        });
      });
    };

    var createFiles = function createFiles(result) {
      return $q.all((result.data.files || []).map(createFile)).then(function () {
        return result;
      });
    };

    var switchProject = function switchProject(result) {
      if (result.data.project) {
        document.location = "#/editor/" + result.data.project;
      }

      return result;
    };

    return $http.get("recipes/" + name + ".json").then(createFiles).then(switchProject).then(function (result) {
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

  start.raise = function (name) {
    handleEvent(name);
  };

  var loadTranslations = function loadTranslations(options) {
    var key = options.key;

    var loadRecipeTranslation = function loadRecipeTranslation(name) {
      return $http.get("recipes/" + name + ".json").then(function (result) {
        var recipeData = result.data;
        if (!recipeData.lang) return {};
        var langIndex = recipeData.lang.indexOf(key);
        if (langIndex === -1) return {};
        var data = {};
        recipeData.steps.forEach(function (step, stepIndex) {
          if (step.tooltip) {
            for (var k in step.tooltip) {
              var tp = step.tooltip[k];
              var localeName = getLocaleName(stepIndex, k);

              if (Array.isArray(tp)) {
                data[localeName] = tp[langIndex];
              } else {
                if (langIndex === 0) {
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
    recipeList.forEach(function (recipeId) {
      actions[recipeId] = loadRecipeTranslation(recipeId);
    });
    return $q.all(actions).then(function (recipeTranslationData) {
      return {
        recipe: recipeTranslationData
      };
    });
  };

  var getBlinks = function getBlinks() {
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
;

var musicJs = angular.module("MusicShowCaseApp");
musicJs.factory("Sync", ['$q', function ($q) {
  return function () {
    var promise = $q.when();

    this.sync = function (f) {
      return function () {
        var _args = arguments;

        var _self = this;

        var defer = $q.defer();
        promise = promise.then(function () {
          return f.apply(_self, _args).then(function (value) {
            defer.resolve(value);
          }).catch(function (err) {
            defer.reject(err);
          });
        });
        return defer.promise;
      };
    };
  };
}]);
;

var musicShowCaseApp = angular.module("MusicShowCaseApp");
musicShowCaseApp.factory("translationsLoader", ['$q', 'TypeService', 'esTranslations', 'enTranslations', 'Recipe', function ($q, TypeService, esTranslations, enTranslations, Recipe) {
  return function (options) {
    var baseTranslation = {};

    if (options.key === 'es') {
      baseTranslation = esTranslations;
    }

    if (options.key === 'en') {
      baseTranslation = enTranslations;
    }

    var addTranslations = function addTranslations(tr) {
      for (var k in tr) {
        baseTranslation[k] = tr[k];
      }
    };

    return $q.all({
      typeTranslations: TypeService.loadTranslations(options),
      recipeTranslations: Recipe.loadTranslations(options)
    }).then(function (result) {
      addTranslations(result.typeTranslations);
      addTranslations(result.recipeTranslations);
      return baseTranslation;
    });
  };
}]);
;

var musicShowCaseApp = angular.module("MusicShowCaseApp");

var ObjectCache = function ObjectCache() {
  var wm = new WeakMap();

  this.get = function (music, object) {
    var array = wm.get(music);
    var strobj = JSON.stringify(object);
    if (!array) return undefined;
    var elem = array.filter(function (x) {
      return x.obj === strobj;
    })[0];
    return elem && elem.value;
  };

  this.set = function (music, object, value) {
    var array = wm.get(music);
    var strobj = JSON.stringify(object);

    if (!array) {
      array = [];
    }

    var elem = array.filter(function (x) {
      return x.obj === strobj;
    })[0];

    if (elem) {
      elem.value = value;
    } else {
      array.push({
        obj: strobj,
        value: value
      });
    }

    if (array.length > 8) array = array.slice(1);
    wm.set(music, array);
  };
};

musicShowCaseApp.service("TypeService", ["$http", "$q", function ($http, $q) {
  var make_mutable = function make_mutable(fcn, options) {
    var cacheData = new ObjectCache();

    var cacheWrap = function cacheWrap(object, baseMusic) {
      var originalPrune = baseMusic.prune;

      baseMusic.prune = function () {
        cacheData = new ObjectCache();

        if (originalPrune) {
          return originalPrune.apply(this, arguments);
        }
      };

      return function (constructor) {
        return function (music, params) {
          var key = baseMusic;
          if (key.getOriginal) key = key.getOriginal();
          cacheData.set(key, object, music);
          return constructor(music, params);
        };
      };
    };

    return function (object, subobjects, components) {
      var current;
      var instances = [];

      if (options && options.reusableNode) {
        current = function current(music, params) {
          var wrapped = subobjects[0];
          var constructor = fcn(object, subobjects.map(cacheWrap(object, music)), components);
          var key = music;
          if (key.getOriginal) key = key.getOriginal();
          var newBase = cacheData.get(key, object);

          if (newBase) {
            return wrapped(newBase);
          } else {
            return constructor(music, params);
          }
        };
      } else {
        current = fcn(object, subobjects, components);
      }

      if (current.update) {
        return current;
      }

      var ret = function ret(music, options) {
        var r;
        var wrapped = {};
        var lastCurrent = current;

        var proxy = function proxy(name) {
          wrapped[name] = function () {
            if (lastCurrent != current) update();
            return r[name].apply(r, arguments);
          };
        };

        var update = function update() {
          var newr = current(music, options);
          if (newr !== r && r && r.dispose) r.dispose();
          r = newr;
          instances.push(newr);
          lastCurrent = current;

          for (var k in r) {
            proxy(k);
          }
        };

        update();
        return wrapped;
      };

      var lastObjData;

      ret.update = function (newobject, _components) {
        components = _components;
        if (JSON.stringify(newobject) === lastObjData) return ret;
        lastObjData = JSON.stringify(newobject);
        instances.forEach(function (instance) {
          if (instance.dispose) instance.dispose();
        });
        instances = [];
        current = fcn(newobject, subobjects, components);
        return ret;
      };

      return ret;
    };
  };

  var plugins = ["core"];
  var types = [];
  var translation = {};

  var m = function m(pluginName) {
    return {
      lang: function lang(key, translateData) {
        translation[key] = translation[key] || {};
        translation[key][pluginName] = translateData;
      },
      type: function type(typeName, options, constructor) {
        types.push({
          templateUrl: "site/plugin/" + pluginName + "/" + options.template + ".html",
          parameters: options.parameters,
          constructor: make_mutable(constructor, {
            reusableNode: options.reusableNode
          }),
          name: typeName,
          composition: options.composition,
          components: options.components,
          description: options.description,
          _default: options._default,
          subobjects: options.subobjects,
          stackAppend: options.stackAppend,
          monitor: options.monitor
        });
      }
    };
  };

  var loadPlugin = function loadPlugin(pluginName) {
    return $http.get("site/plugin/" + pluginName + "/index.js").then(function (result) {
      var runnerCode = result.data;
      var module = {
        export: function _export() {}
      };
      eval(runnerCode);
      module.export(m(pluginName));
    });
  };

  var pluginsLoaded = $q.all(plugins.map(loadPlugin));

  var getTypes = function getTypes(keyword) {
    var hasKeyword = function hasKeyword() {
      return true;
    };

    if (keyword) {
      keyword = keyword.toLowerCase();

      hasKeyword = function hasKeyword(x) {
        return x.name.toLowerCase().indexOf(keyword) !== -1;
      };
    }

    return pluginsLoaded.then(function () {
      return types.filter(hasKeyword);
    });
  };

  var getType = function getType(typeName, callback) {
    return pluginsLoaded.then(function () {
      var ret = types.filter(function (type) {
        return type.name === typeName;
      })[0];
      if (callback) callback(ret);
      return ret;
    });
  };

  var loadTranslations = function loadTranslations(options) {
    return pluginsLoaded.then(function () {
      return translation[options.key] || {};
    });
  };

  return {
    getTypes: getTypes,
    getType: getType,
    loadTranslations: loadTranslations
  };
}]);
;

var musicShowCaseApp = angular.module("MusicShowCaseApp");
musicShowCaseApp.factory("WelcomeMessage", ['localforage', function (localforage) {
  var skip = function skip() {
    return localforage.getItem("welcome_skip").then(function (result) {
      return !!result;
    });
  };

  var setSkip = function setSkip(value) {
    if (value) {
      return localforage.setItem("welcome_skip", value);
    } else {
      return localforage.removeItem("welcome_skip");
    }
  };

  return {
    setSkip: setSkip,
    skip: skip
  };
}]);
;

var musicShowCaseApp = angular.module("MusicShowCaseApp");
musicShowCaseApp.factory("_localforage", ['$q', 'localforage', function ($q, localforage) {
  var getItem = localforage.getItem.bind(localforage);

  var releaseWithIndex = function releaseWithIndex(index, bytes) {
    if (index.length === 0) return $q.when(index);
    if (bytes <= 0) return $q.when(index);
    var nextEntry = index.shift();
    return localforage.getItem(nextEntry.id).then(function (value) {
      return localforage.removeItem(nextEntry.id).then(function () {
        return releaseWithIndex(index, bytes - (value ? value.length : 0));
      });
    });
  };

  var clearItem = function clearItem(data) {
    return {
      id: data.id,
      name: data.name,
      type: data.type
    };
  };

  var release = function release(bytes) {
    return localforage.getItem("recycle").then(function (index) {
      return releaseWithIndex(index, bytes);
    }).then(function (newIndex) {
      return localforage.setItem("recycle", newIndex.map(clearItem));
    });
  };

  var setItem = function setItem(key, object, isretry) {
    return localforage.setItem(key, object).catch(function (err) {
      if (!isretry) {
        return release(object.length).then(function () {
          return setItem(key, object, true);
        });
      }

      throw err;
    });
  };

  var removeItem = localforage.removeItem.bind(localforage);
  return {
    getItem: getItem,
    setItem: setItem,
    removeItem: removeItem
  };
}]);
;

var musicShowCaseApp = angular.module("MusicShowCaseApp");
musicShowCaseApp.filter("instrument_name", function () {
  return function (instrumentId, instrumentMap) {
    return instrumentMap[instrumentId] && instrumentMap[instrumentId] ? instrumentMap[instrumentId].name : instrumentId;
  };
});
musicShowCaseApp.filter("instrument_type", function () {
  return function (instrumentId, instrumentMap) {
    return instrumentMap[instrumentId] && instrumentMap[instrumentId] ? instrumentMap[instrumentId].type : 'instrument';
  };
});
musicShowCaseApp.filter("block_name", function () {
  return function (block, indexMap) {
    return indexMap[block.id] && indexMap[block.id].index ? indexMap[block.id].index.name : block.id;
  };
});
musicShowCaseApp.filter("block_length", ["Pattern", function (Pattern) {
  return function (block, indexMap, measure) {
    if (!block.id) return 1;
    if (!indexMap[block.id]) return 1;
    if (!indexMap[block.id].contents) return 1;
    return Pattern.computeMeasureCount(indexMap[block.id].contents, measure);
  };
}]);
musicShowCaseApp.controller("recordOptionsCtrl", ["$scope", "$uibModalInstance", "Recipe", function ($scope, $uibModalInstance, Recipe) {
  $scope.numChannels = 2;
  $scope.encoding = "wav";
  $scope.recipe = Recipe.start;

  $scope.cancel = function () {
    $uibModalInstance.dismiss();
  };

  $scope.start = function () {
    $scope.recipe.raise("song_rec_confirm");
    $uibModalInstance.close({
      encoding: $scope.encoding,
      numChannels: $scope.numChannels
    });
  };
}]);
musicShowCaseApp.controller("DashboardController", ["$scope", function ($scope) {
  $scope.$emit('switchProject', "default");
}]);
musicShowCaseApp.controller("ProjectDashboardController", ["$scope", "$routeParams", function ($scope, $routeParams) {
  $scope.$emit('switchProject', $routeParams.project);
}]);
musicShowCaseApp.controller("SongEditorController", ["$scope", "$uibModal", "$q", "$timeout", "$routeParams", "$http", "MusicContext", "FileRepository", "InstrumentSet", "Pattern", "Export", "TICKS_PER_BEAT", "SONG_MAX_TRACKS", function ($scope, $uibModal, $q, $timeout, $routeParams, $http, MusicContext, FileRepository, InstrumentSet, Pattern, Export, TICKS_PER_BEAT, SONG_MAX_TRACKS) {
  $scope.indexMap = {};
  var id = $routeParams.id;
  var instSet = InstrumentSet();
  var playingStartOffset = 0;
  $scope.$emit('switchProject', $routeParams.project);

  var pxToTicks = function pxToTicks(px) {
    var beatWidth = 154 / $scope.file.measure;
    var zoomLevel = 1;
    return TICKS_PER_BEAT * px / zoomLevel / beatWidth;
  };

  $scope.seek = function (event) {
    if ($scope.currentRec) return;
    playingStartOffset = pxToTicks(event.offsetX);
    $scope.$broadcast("resetClock", playingStartOffset);

    if ($scope.playing) {
      $scope.playing.stop();
      $scope.playing = null;
      $scope.replay();
    }
  };

  $scope.patternEdit = function (block) {
    document.location = "#/editor/" + $routeParams.project + "/pattern/" + block.id;
  };

  $scope.exportItem = function () {
    Export.exportFile($scope.fileIndex.name, $scope.fileIndex.id);
  };

  $scope.removeItem = function () {
    if ($scope.fileIndex.builtIn) {
      $scope.file = null;
      $scope.fileIndex = null;
      FileRepository.destroyFile(id).then(function () {
        reloadFromRepo();
      });
      return;
    }

    FileRepository.moveToRecycleBin(id).then(function () {
      document.location = "#/editor/" + $routeParams.project;
    });
  };

  $scope.remove = function (block) {
    delete block.id;
    checkPayload();
    $scope.fileChanged();
  };

  $scope.currentRec = null;

  $scope.record = function () {
    if ($scope.playing) {
      $scope.playing.stop();
      $scope.playing = null;
      $scope.$broadcast("pauseClock");
    }

    var modalIns = $uibModal.open({
      templateUrl: "site/templates/modal/recordOptions.html",
      controller: "recordOptionsCtrl"
    });
    modalIns.result.then(function (encodingOptions) {
      $scope.currentRec = MusicContext.record({
        encoding: encodingOptions.encoding,
        numChannels: encodingOptions.numChannels
      }, function (blob) {
        var a = document.createElement("a");
        document.body.appendChild(a);
        a.style = "display: none";
        var url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = $scope.fileIndex.name + "." + encodingOptions.encoding;
        a.click();
        window.URL.revokeObjectURL(url);
        $scope.recipe.raise('song_rec_stop');
      });
      $scope.play();
    });
  };

  $scope.stop = function () {
    playingStartOffset = 0;
    $scope.$broadcast("stopClock");
    $scope.$broadcast("resetClock", playingStartOffset);
    if ($scope.playing) $scope.playing.stop();
    $scope.recipe.raise("song_play_stopped");
    $scope.playing = null;
  };

  $scope.playing = null;
  $scope.$on('pausedClock', function (evt, ticks) {
    playingStartOffset = ticks;
  });

  $scope.play = function () {
    if ($scope.playing) {
      $scope.playing.stop();
      $scope.playing = null;
      $scope.$broadcast("pauseClock");
      return;
    }

    $scope.replay();
  };

  $scope.replay = function () {
    MusicContext.resumeAudio();
    $q.all(instSet.all).then(function (instruments) {
      var patterns = {};

      var createPattern = function createPattern(id, songTrackIdx) {
        if (!id) return null;
        if (patterns[id]) return patterns[id];
        var pattern = $scope.indexMap[id].contents;
        var changedBpm = Object.create(pattern);
        changedBpm.bpm = $scope.file.bpm;
        patterns[id] = Pattern.patternCompose(changedBpm, instruments, songTrackIdx * SONG_MAX_TRACKS, function () {});
        return patterns[id];
      };

      var song = new MUSIC.Song($scope.file.tracks.map(function (track, songTrackIdx) {
        return track.blocks.map(function (block) {
          return createPattern(block.id, songTrackIdx);
        });
      }), {
        measure: $scope.file.measure,
        bpm: $scope.file.bpm,
        ticks_per_beat: TICKS_PER_BEAT,
        start: playingStartOffset
      });
      $scope.$broadcast("startClock", song.timeToTicks());
      $scope.playing = song.play({
        onStop: function onStop() {
          $scope.$broadcast("stopClock");
          $scope.$broadcast("resetClock", playingStartOffset);
          $scope.recipe.raise("song_play_stopped");
          $scope.playing = null;
          if ($scope.currentRec) $scope.currentRec.stop();
          $scope.currentRec = null;
          $timeout(function () {});
        }
      });
    });
  };

  $scope.indexChanged = function () {
    $scope.fileIndex.ref = FileRepository.getRefs("song", $scope.file);
    FileRepository.updateIndex(id, $scope.fileIndex);
  };

  $scope.fileChanged = fn.debounce(function () {
    FileRepository.updateFile(id, $scope.file).then(function () {
      $scope.indexChanged();
    });
  }, 100);

  var checkPayload = function checkPayload() {
    var maxblocks = 0;
    var maxTrackIndex = 0;
    if (!$scope.file) return;
    if (!$scope.file.tracks) return;
    $scope.file.tracks.forEach(function (track, trackIndex) {
      for (var i = 0; i < track.blocks.length; i++) {
        if (track.blocks[i].id) {
          var mCount = Pattern.computeMeasureCount($scope.indexMap[track.blocks[i].id].contents, $scope.file.measure);
          if (i + mCount > maxblocks) maxblocks = i + mCount;
          if (trackIndex > maxTrackIndex) maxTrackIndex = trackIndex;
        }
      }
    });

    if ($scope.file.tracks.length < maxTrackIndex + 2 && $scope.file.tracks.length < SONG_MAX_TRACKS) {
      $scope.file.tracks.push({
        blocks: $scope.file.tracks[0].blocks.map(function () {
          return {};
        })
      });
    } else {
      $scope.file.tracks = $scope.file.tracks.slice(0, maxTrackIndex + 2);
    }

    var target = maxblocks + 1;
    $scope.file.tracks.forEach(function (track) {
      if (target > track.blocks.length) {
        var payload = target - track.blocks.length;

        for (var i = 0; i < payload; i++) {
          track.blocks.push({});
        }
      } else {
        track.blocks = track.blocks.slice(0, target);
      }
    });
    $scope.fileChanged();
  };

  $scope.$watch("file.measure", checkPayload);

  $scope.onDropComplete = function ($data, $event, block, songTrackIdx) {
    if ($data.fromBlock) {
      var swapId = block.id;
      block.id = $data.fromBlock.id;
      $data.fromBlock.id = swapId;
      checkPayload();
      return;
    }

    if ($data.type !== 'pattern') return;
    block.id = $data.id;
    FileRepository.getFile($data.id).then(function (f) {
      f.contents.tracks.forEach(function (track, idx) {
        if (track.instrument) instSet.load(track.instrument, songTrackIdx * SONG_MAX_TRACKS + idx);
      });
      $scope.indexMap[$data.id] = f;
      checkPayload();
      $scope.fileChanged();
      $scope.recipe.raise('song_pattern_dropped');
    });
  };

  var reloadFromRepo = function reloadFromRepo() {
    var block_ids = {};
    FileRepository.getFile(id).then(function (file) {
      if (file) {
        file.contents.tracks.forEach(function (track, idx) {
          track.blocks.forEach(function (block) {
            if (block && block.id) {
              if (!block_ids[block.id]) {
                block_ids[block.id] = FileRepository.getFile(block.id).then(function (file) {
                  return {
                    file: file,
                    idx: idx
                  };
                });
              }
            }
          });
        });
      }

      ;
      return $q.all(block_ids).then(function (indexMap) {
        $scope.indexMap = {};

        for (var blockId in indexMap) {
          var pattern = indexMap[blockId].file.contents;
          var songTrackIdx = indexMap[blockId].idx;
          $scope.indexMap[blockId] = indexMap[blockId].file;
          pattern.tracks.forEach(function (track, idx) {
            if (track.instrument) instSet.load(track.instrument, songTrackIdx * SONG_MAX_TRACKS + idx);
          });
        }
      }).then(function () {
        $timeout(function () {
          var outputFile = {};
          $scope.fileIndex = file.index;
          $scope.file = file.contents;
        });
      });
    });
  };

  reloadFromRepo();

  var keyDownHandler = function keyDownHandler(evt) {
    if (document.activeElement.tagName.toLowerCase() === "input") return;

    if (evt.keyCode === 90 && evt.ctrlKey) {
      FileRepository.undo(id).then(reloadFromRepo);
    }

    if (evt.keyCode === 89 && evt.ctrlKey) {
      FileRepository.redo(id).then(reloadFromRepo);
    }
  };

  $(document).bind("keydown", keyDownHandler);
  $scope.$on("$destroy", function () {
    $(document).unbind("keydown", keyDownHandler);
    instSet.dispose();
  });
}]);
musicShowCaseApp.controller("PatternEditorController", ["$q", "$translate", "$scope", "$timeout", "$routeParams", "$http", "TICKS_PER_BEAT", "MusicContext", "FileRepository", "Pattern", "InstrumentSet", 'Export', 'ErrMessage', function ($q, $translate, $scope, $timeout, $routeParams, $http, TICKS_PER_BEAT, MusicContext, FileRepository, Pattern, InstrumentSet, Export, ErrMessage) {
  var id = $routeParams.id;
  var playingStartOffset = 0;

  $scope.exportItem = function () {
    Export.exportFile($scope.fileIndex.name, $scope.fileIndex.id);
  };

  $scope.$emit('switchProject', $routeParams.project);

  $scope.instrumentEdit = function (track) {
    document.location = "#/editor/" + $routeParams.project + "/instrument/" + track.instrument;
  };

  $scope.instrumentMap = {};
  $scope.beatWidth = 10;
  $scope.zoomLevel = 8;
  $scope.selectedTrack = 0;
  $scope.mutedState = [];
  var instSet = InstrumentSet();

  var pxToTicks = function pxToTicks(px) {
    var beatWidth = 10;
    return TICKS_PER_BEAT * px / $scope.zoomLevel / beatWidth;
  };

  $scope.seek = function (event) {
    playingStartOffset = pxToTicks(event.offsetX + $scope.file.scrollLeft);
    $scope.$broadcast("resetClock", playingStartOffset);

    if ($scope.playing) {
      $scope.playing.stop();
      $scope.playing = null;
      $scope.replay();
    }
  };

  $scope.updateMuted = function () {
    $scope.mutedState = Pattern.getMutedState($scope.file);
    $scope.fileChanged();
    $scope.file.tracks.forEach(function (track, idx) {
      instSet.mute(idx, $scope.mutedState[idx]);
    });
  };

  $scope.removeItem = function () {
    if ($scope.fileIndex.builtIn) {
      $scope.file = null;
      $scope.fileIndex = null;
      FileRepository.destroyFile(id).then(function () {
        reloadFromRepo();
      });
      return;
    }

    FileRepository.moveToRecycleBin(id).then(function () {
      document.location = "#/editor/" + $routeParams.project;
    }).catch(function (err) {
      if (err.type && err.type === 'cantremove') {
        ErrMessage('common.error_title', 'common.cantremove_error');
      } else {
        throw err;
      }
    });
  };

  $scope.removeTrack = function (trackIdx) {
    $scope.file.tracks = $scope.file.tracks.slice(0, trackIdx).concat($scope.file.tracks.slice(trackIdx + 1));
    $scope.file.selectedTrack = $scope.file.selectedTrack % $scope.file.tracks.length;
    $scope.updateMuted();
    $scope.fileChanged();
  };

  $scope.addTrack = function () {
    $scope.file.tracks.push({
      events: [],
      scroll: 1000
    });
    $scope.file.selectedTrack = $scope.file.tracks.length - 1;
    $scope.updateMuted();
    $scope.fileChanged();
  };

  $scope.stop = function () {
    playingStartOffset = 0;
    $scope.$broadcast("stopClock");
    $scope.$broadcast("resetClock", playingStartOffset);
    if ($scope.playing) $scope.playing.stop();
    $scope.recipe.raise("song_play_stopped");
    $scope.playing = null;
  };

  $scope.$on('pausedClock', function (evt, ticks) {
    playingStartOffset = ticks;
  });

  $scope.play = function () {
    if ($scope.playing) {
      $scope.playing.stop();
      $scope.playing = null;
      $scope.$broadcast("pauseClock");
      return;
    }

    $scope.replay();
  };

  $scope.replay = function () {
    MusicContext.resumeAudio();
    var playingLine = $(".playing-line");
    $q.all(instSet.all).then(function (instruments) {
      if ($scope.playing) $scope.playing.stop();

      var onStop = function onStop() {
        $scope.$broadcast("stopClock");
        $scope.$broadcast("resetClock");
        $scope.recipe.raise("pattern_play_stopped");
        $timeout(function () {
          $scope.playing = null;
        });
        playingStartOffset = 0;
      };

      var pattern = Pattern.patternCompose($scope.file, instruments, 0, onStop, {
        start: playingStartOffset
      });
      $scope.playing = pattern.play();
      var timeToTicks = pattern.timeToTicks();
      $scope.$broadcast("startClock", timeToTicks);
    });
  };

  $scope.zoomIn = function () {
    $scope.zoomLevel = $scope.zoomLevel * 2;
    if ($scope.zoomLevel > 32) $scope.zoomLevel = 32;
  };

  $scope.zoomOut = function () {
    $scope.zoomLevel = $scope.zoomLevel / 2;
    if ($scope.zoomLevel < 1) $scope.zoomLevel = 1;
  };

  $scope.indexChanged = function () {
    $scope.fileIndex.ref = FileRepository.getRefs("pattern", $scope.file);
    FileRepository.updateIndex(id, $scope.fileIndex);
  };

  $scope.fileChanged = fn.debounce(function () {
    FileRepository.updateFile(id, $scope.file).then($scope.indexChanged);
  }, 100);
  $scope.$on("trackChanged", function (track) {
    computeMeasureCount();
    $scope.fileChanged();
  });

  var beep = function beep(instrument, n) {
    if (!instrument) return;
    if (!instrument.note) return;
    if (lastPlaying) lastPlaying.stop();
    lastPlaying = instrument.note(n).play();
    setTimeout(function () {
      if (lastPlaying) lastPlaying.stop();
      lastPlaying = null;
    }, 50);
  };

  var computeMeasureCount = function computeMeasureCount() {
    if (!$scope.file) return;
    if (!$scope.file.tracks[0]) return;
    $scope.file.measureCount = Pattern.computeMeasureCount($scope.file, $scope.file.measure);
  };

  var lastPlaying;

  var trackMuted = function trackMuted(track) {
    return $scope.mutedState[$scope.file.tracks.indexOf(track)];
  };

  $scope.$on("eventChanged", function (evt, data) {
    computeMeasureCount();
    if (data.oldevt.n !== data.evt.n && !trackMuted(data.track)) beep(instrument.get(data.track), data.evt.n);
    $scope.fileChanged();
  });
  $scope.$on("eventSelected", function (evt, data) {
    if (!trackMuted(data.track)) beep(instrument.get(data.track), data.evt.n);
  });
  $scope.$watch("file.measure", computeMeasureCount);
  var instrument = new WeakMap();

  $scope.updateInstrument = function (trackNo) {
    if (!$scope.file.tracks[trackNo]) return;
    if (!$scope.file.tracks[trackNo].instrument) return;
    return $q.all({
      musicObject: instSet.load($scope.file.tracks[trackNo].instrument, trackNo),
      index: FileRepository.getIndex($scope.file.tracks[trackNo].instrument)
    }).then(function (result) {
      $scope.instrumentMap[$scope.file.tracks[trackNo].instrument] = result.index;
      if (result.musicObject) instrument.set($scope.file.tracks[trackNo], result.musicObject);
      return result.musicObject;
    });
  };

  $scope.onDropComplete = function (instrument, event) {
    MusicContext.resumeAudio();
    if (instrument.type !== 'instrument' && instrument.type !== 'tempo') return;
    var trackNo = $scope.file.selectedTrack;
    $scope.file.tracks = $scope.file.tracks || [];
    $scope.file.tracks[trackNo] = $scope.file.tracks[trackNo] || {};
    $scope.file.tracks[trackNo].instrument = instrument.id;
    FileRepository.updateFile(id, $scope.file);
    $scope.updateInstrument(trackNo).then(function (musicObject) {
      $scope.updateMuted();
      if (!$scope.mutedState[trackNo]) beep(musicObject, 36);
    });
  };

  var reloadFromRepo = function reloadFromRepo() {
    FileRepository.getFile(id).then(function (file) {
      $timeout(function () {
        var outputFile = {};
        $scope.fileIndex = file.index;
        $scope.file = file.contents;
        $scope.mutedState = Pattern.getMutedState($scope.file);
        $scope.updateMuted();
        if (!$scope.file.tracks) $scope.file.tracks = [{}];
        $scope.file.tracks.forEach(function (track, idx) {
          track.events = track.events || [];
          $scope.updateInstrument(idx);
        });
      });
    });
  };

  reloadFromRepo(); // undo & redo

  var keyDownHandler = function keyDownHandler(evt) {
    if (document.activeElement.tagName.toLowerCase() === "input") return;

    if (evt.keyCode === 90 && evt.ctrlKey) {
      FileRepository.undo(id).then(reloadFromRepo);
    }

    if (evt.keyCode === 89 && evt.ctrlKey) {
      FileRepository.redo(id).then(reloadFromRepo);
    }
  };

  var playButton = $("button.play-button");
  playButton.bind("click", MusicContext.resumeAudio);
  $(document).bind("keydown", keyDownHandler);
  $scope.$on("$destroy", function () {
    playButton.unbind("click", MusicContext.resumeAudio);
    $(document).unbind("keydown", keyDownHandler);
    instSet.dispose();
  });
  $scope.$on("enableTrack", function (evt, track) {
    $scope.file.selectedTrack = $scope.file.tracks.indexOf(track);
  });
  $scope.$on("patternSelectEvent", function (evt, event) {
    $timeout(function () {
      $scope.$broadcast("trackSelectEvent", event);
    });
  });
}]);
musicShowCaseApp.controller("EditorController", ["$scope", "$q", "$timeout", "$routeParams", "$http", "MusicContext", "FileRepository", "MusicObjectFactory", "Export", function ($scope, $q, $timeout, $routeParams, $http, MusicContext, FileRepository, MusicObjectFactory, Export) {
  var id = $routeParams.id;
  $scope.$emit('switchProject', $routeParams.project);

  $scope.exportItem = function () {
    Export.exportFile($scope.fileIndex.name, $scope.fileIndex.id);
  };

  $scope.removeItem = function () {
    destroyAll();

    if ($scope.fileIndex.builtIn) {
      $scope.file = null;
      $scope.fileIndex = null;
      FileRepository.destroyFile(id).then(function () {
        reloadFromRepo();
      });
      return;
    } else {
      FileRepository.moveToRecycleBin(id).then(function () {
        document.location = "#/editor/" + $routeParams.project;
      }).catch(function (err) {
        if (err.type && err.type === 'cantremove') {
          ErrMessage('common.error_title', 'common.cantremove_error');
        } else {
          throw err;
        }
      });
    }
  };

  var lastObj;
  var musicObjectFactory = MusicObjectFactory({
    monitor: true
  });

  var destroyAll = function destroyAll() {
    ($scope.instruments || []).forEach(function (instrument) {
      if (instrument.dispose) instrument.dispose();
    });
    ($scope.playables || []).forEach(function (playable) {
      $scope.stopPlay(playable);
    });
    return musicObjectFactory.destroyAll();
  };

  var lazyLoadInstrument = function lazyLoadInstrument(f) {
    var callStop = function callStop(p) {
      return p.stop();
    };

    var callPlay = function callPlay(p) {
      return p.play();
    };

    var instrumentPromise;
    var innerInstrument;

    var note = function note(n) {
      if (innerInstrument) return innerInstrument.note(n);
      var innerNote;

      if (!instrumentPromise) {
        instrumentPromise = f();
      }

      innerNote = instrumentPromise.then(function (inst) {
        innerInstrument = inst;
        return inst.note(n);
      });

      var play = function play() {
        var playing = innerNote.then(callPlay);

        var stop = function stop() {
          return playing.then(callStop);
        };

        return {
          stop: stop
        };
      };

      return {
        play: play
      };
    };

    return MUSIC.instrumentExtend({
      note: note
    }).stopDelay(10);
  };

  var createInstrumentFromFile = function createInstrumentFromFile() {
    return musicObjectFactory.create($scope.file);
  };

  var fileChanged = fn.debounce(function (newFile, oldFile) {
    if (!$scope.file) return;
    $q.when(null).then(function () {
      return destroyAll();
    }).then(function () {
      return lazyLoadInstrument(createInstrumentFromFile);
    }).then(function (obj) {
      if (!obj) {
        $scope.instruments = [];
        $scope.playables = [];
        return;
      }

      if (obj !== lastObj) {
        $scope.instruments = [];
        $scope.playables = [];

        if (obj.note) {
          // instrument
          $scope.instruments.push(obj);
        } else if (obj.play) {
          $scope.playables.push(obj);
        }
      }

      if (oldFile) {
        FileRepository.updateFile(id, $scope.file);
        $scope.fileIndex.updated = true;
      }

      lastObj = obj;
    });
  }, 250);
  $scope.$watch('file', fileChanged, true);

  $scope.indexChanged = function () {
    FileRepository.updateIndex(id, $scope.fileIndex);
  };

  var reloadFromRepo = function reloadFromRepo() {
    FileRepository.getFile(id).then(function (file) {
      $timeout(function () {
        var outputFile = {};
        $scope.outputFile = outputFile;
        $scope.file = file.contents;
        $scope.fileIndex = file.index;
        $scope.observer = {};

        $scope.observer.notify = function () {
          $timeout(function () {
            $scope.instruments = [];
            $scope.playables = [];
          });
        };
      });
    });
  };

  reloadFromRepo();
  $scope.$on("stackChanged", function () {
    $scope.resetStack = true;
    fileChanged();
  });
  $scope.$on("$destroy", destroyAll);

  $scope.startPlay = function (playable) {
    playable.playing = playable.play();
  };

  $scope.stopPlay = function (playable) {
    if (!playable.playing) return;
    playable.playing.stop();
    playable.playing = undefined;
  };
}]);
musicShowCaseApp.controller("MainController", ["$q", "$scope", "$timeout", "$uibModal", "$translate", "MusicContext", "FileRepository", "Recipe", "WelcomeMessage", "localforage", "Export", "ErrMessage", function ($q, $scope, $timeout, $uibModal, $translate, MusicContext, FileRepository, Recipe, WelcomeMessage, localforage, Export, ErrMessage) {
  var music;
  $scope.$on("switchProject", function (evt, id) {
    switchProject(id);
  });

  var concat = function concat(a, b) {
    return a.concat(b);
  };

  var switchProject = function switchProject(projectId) {
    var pFilter = [projectId];
    return FileRepository.getFile(projectId).then(function (file) {
      $scope.project = file;
      return (file.index.ref || []).concat([projectId]);
    }).then(function (filter) {
      $scope.projectFilter = filter.concat(['core']);
      if (filter.indexOf('default') !== -1) $scope.projectFilter.push(undefined);
    }).then(updateSearch).catch(function () {
      document.location = "#";
    });
  };

  var updateSearch = fn.debounce(function () {
    if (currentObserver) currentObserver.close();
    currentObserver = FileRepository.search(null, {
      project: $scope.projectFilter,
      type: ['instrument', 'pattern', 'song', 'fx']
    }).observe(function (files) {
      $timeout(function () {
        $scope.filesTotal = files.total;
        $scope.files = files.results;
      });
    });
  }, 100);
  var currentObserver;

  $scope.fileInputClick = function () {
    $timeout(function () {
      $(".choose-file-import-container input[type=file]").click();
    });
  };

  $scope.fileImport = function (files) {
    var readTextFile = function readTextFile(file) {
      return $q(function (resolve, reject) {
        var fileReader = new FileReader();

        fileReader.onload = function (e) {
          resolve(e.target.result);
        };

        fileReader.onerror = function (err) {
          reject(err);
        };

        fileReader.readAsText(file);
      });
    };

    var nextLocation;

    var importFile = function importFile(file) {
      return function (options) {
        return readTextFile(file).then(function (json) {
          return Export.importFile(json).then(function (file) {
            if (options && options.first) {
              if (file.type === 'project') {
                nextLocation = "#/editor/" + file.id;
              } else {
                nextLocation = "#/editor/" + file.project + "/" + file.type + "/" + file.id;
              }
            }
          });
        });
      };
    };

    var p = null;

    for (var i = 0; i < files.length; i++) {
      if (p) {
        p = p.then(importFile(files[i]));
      } else {
        p = importFile(files[i])({
          first: true
        });
      }
    }

    if (p) {
      p.then(function (index) {
        if (nextLocation) document.location = nextLocation;
      }).catch(function (err) {
        var modalIns = $uibModal.open({
          templateUrl: "site/templates/modal/error.html",
          controller: "errorModalCtrl",
          windowClass: 'error',
          resolve: {
            text: function text() {
              return $translate('common.loader_error');
            },
            title: function title() {
              return $translate('common.error_title');
            }
          }
        });
      });
    }
  };

  $scope.changeLanguage = function (langKey) {
    localforage.setItem('lang', langKey);
    $translate.use(langKey);
  };

  localforage.getItem("lang").then(function (currentLanguage) {
    if (currentLanguage) $scope.changeLanguage(currentLanguage);
    $timeout(function () {
      $scope.langLoaded = true;
    });
  });

  $scope.welcome = function () {
    // show welcome modal
    var modalIns = $uibModal.open({
      templateUrl: "site/templates/modal/welcome.html",
      controller: "welcomeModalCtrl",
      resolve: {
        dontshowagain: ["WelcomeMessage", function (WelcomeMessage) {
          return WelcomeMessage.skip();
        }]
      }
    });
  };

  $scope.openRecycleBin = function () {
    // show recycle bin modal
    var modalIns = $uibModal.open({
      templateUrl: "site/templates/modal/recycleBin.html",
      controller: "recycleBinModalCtrl"
    });
  };

  WelcomeMessage.skip().then(function (skip) {
    if (!skip) $scope.welcome();
  });
  $scope.recipe = Recipe.start;

  $scope.activate = function (example) {
    if (example.type === "instrument" || example.type === "song" || example.type === "pattern") {
      document.location = "#/editor/" + $scope.project.index.id + "/" + example.type + "/" + example.id;
    }

    if (example.type === "project") {
      document.location = "#/editor/" + example.id;
    }
  };

  $scope.keywordUpdated = fn.debounce(function () {
    if (currentObserver) currentObserver.close();
    currentObserver = FileRepository.search($scope.searchKeyword, {
      project: $scope.projectFilter,
      type: ['instrument', 'pattern', 'song', 'fx', 'tempo']
    }).observe(function (files) {
      $scope.filesTotal = files.total;
      $scope.files = files.results;
    });
  }, 200);

  $scope.removeProject = function () {
    FileRepository.moveToRecycleBin($scope.project.index.id).then(function () {
      document.location = "#";
    }).catch(function (err) {
      if (err.type && err.type === 'cantremove') {
        ErrMessage('common.error_title', 'common.cantremove_project_error');
      } else {
        throw err;
      }
    });
  };

  $scope.exportProject = function () {
    Export.exportProject($scope.project.index.name, $scope.project.index.id);
  };

  $scope.projectSettings = function () {
    $uibModal.open({
      templateUrl: "site/templates/modal/projectSettings.html",
      controller: "projectSettingsModalCtrl",
      resolve: {
        project: {
          name: $scope.project.index.name,
          ref: $scope.project.index.ref
        },
        buttonText: function buttonText() {
          return 'common.ok';
        }
      }
    }).result.then(function (project) {
      $scope.project.index.name = project.name;
      FileRepository.updateIndex($scope.project.index.id, {
        type: 'project',
        name: project.name,
        ref: project.ref
      }).then(function () {
        switchProject($scope.project.index.id);
      });
    });
  };

  $scope.newProject = function () {
    // open "project settings" modal
    $translate('project.new').then(function (projectName) {
      $uibModal.open({
        templateUrl: "site/templates/modal/projectSettings.html",
        controller: "projectSettingsModalCtrl",
        resolve: {
          project: {
            name: projectName
          },
          buttonText: function buttonText() {
            return 'common.create';
          }
        }
      }).result.then(function (project) {
        FileRepository.createFile({
          type: 'project',
          name: project.name,
          ref: project.ref
        }).then(function (id) {
          document.location = "#/editor/" + id;
        });
      });
    });
  };

  $scope.openProject = function () {
    $uibModal.open({
      templateUrl: "site/templates/modal/openProject.html",
      controller: "openProjectModalCtrl"
    }).result.then(function (id) {
      var moreImportant = function moreImportant(file1, file2) {
        if (file1.type !== file2.type) {
          if (file1.type === 'song') return file1;
          if (file2.type === 'song') return file2;
          if (file1.type === 'pattern') return file1;
          if (file2.type === 'pattern') return file2;
        } else {
          return (file1.ref || []).length > (file2.ref || []).length ? file1 : file2;
        }

        return file2;
      }; // switch to main object


      return FileRepository.getProjectFiles(id).then(function (files) {
        if (files.length > 0) {
          var better = files.reduce(moreImportant, files[0]);

          if (better && better.type !== 'project') {
            document.location = "#/editor/" + id + "/" + better.type + "/" + better.id;
          } else {
            document.location = "#/editor/" + id;
          }
        } else {
          document.location = "#/editor/" + id;
        }
      });
    });
  };

  $scope.newInstrument = function () {
    $translate("common.new_instrument").then(function (name) {
      return FileRepository.createFile({
        type: "instrument",
        name: name,
        project: $scope.project.index.id
      });
    }).then(function (id) {
      document.location = "#/editor/" + $scope.project.index.id + "/instrument/" + id;
    }).catch(function (err) {
      debugger;
    });
  };

  $scope.newSong = function () {
    $translate("common.new_song").then(function (name) {
      return FileRepository.createFile({
        type: "song",
        name: name,
        project: $scope.project.index.id
      });
    }).then(function (id) {
      document.location = "#/editor/" + $scope.project.index.id + "/song/" + id;
    });
  };

  $scope.newPattern = function () {
    $translate("common.new_pattern").then(function (name) {
      return FileRepository.createFile({
        type: "pattern",
        name: name,
        project: $scope.project.index.id
      });
    }).then(function (id) {
      document.location = "#/editor/" + $scope.project.index.id + "/pattern/" + id;
    });
  };

  $scope.about = function () {
    $uibModal.open({
      templateUrl: "site/templates/modal/about.html",
      controller: "infoModalCtrl"
    });
  };

  $scope.help = function () {
    $uibModal.open({
      templateUrl: "site/templates/modal/help.html",
      controller: "infoModalCtrl"
    });
  };

  $scope.todo = function () {
    $uibModal.open({
      templateUrl: "todoModal.html",
      controller: "todoModalCtrl"
    });
  };
}]);
musicShowCaseApp.controller("todoModalCtrl", ["$scope", "$uibModalInstance", function ($scope, $uibModalInstance) {
  $scope.dismiss = function () {
    $uibModalInstance.dismiss();
  };
}]);
;

var musicShowCaseApp = angular.module("MusicShowCaseApp");
musicShowCaseApp.controller("errorModalCtrl", ["$scope", "$uibModalInstance", "text", "title", function ($scope, $uibModalInstance, text, title) {
  $scope.text = text;
  $scope.title = title;

  $scope.dismiss = function () {
    $uibModalInstance.dismiss();
  };
}]);
;

var musicShowCaseApp = angular.module("MusicShowCaseApp");
musicShowCaseApp.controller("infoModalCtrl", ["$scope", "$uibModalInstance", function ($scope, $uibModalInstance) {
  $scope.dismiss = function () {
    $uibModalInstance.dismiss();
  };
}]);
;

var musicShowCaseApp = angular.module("MusicShowCaseApp");
musicShowCaseApp.controller("midiSettingsModalCtrl", ["$scope", "$q", "$timeout", "$uibModalInstance", "Midi", function ($scope, $q, $timeout, $uibModalInstance, Midi) {
  Midi.getInputs().then(function (inputs) {
    $scope.inputs = inputs;
  });
  Midi.getConfig().then(function (config) {
    $scope.config = config;
  });

  $scope.updateConfig = function () {
    Midi.setConfig($scope.config);
  };

  $scope.done = function () {
    $uibModalInstance.close();
  };
}]);
;

var musicShowCaseApp = angular.module("MusicShowCaseApp");
musicShowCaseApp.controller("openProjectModalCtrl", ["$q", "$scope", "$uibModalInstance", 'FileRepository', function ($q, $scope, $uibModalInstance, FileRepository) {
  var currentObserver;

  var immediateUpdateSearch = function immediateUpdateSearch() {
    if (currentObserver) currentObserver.close();
    currentObserver = FileRepository.search($scope.searchKeyword, {
      type: ['project']
    }).observe(function (files) {
      $scope.filesTotal = files.total;
      $scope.files = files.results;
    });
  };

  $scope.updateSearch = fn.debounce(immediateUpdateSearch, 250);

  $scope.cancel = function () {
    $uibModalInstance.dismiss();
  };

  $scope.select = function (projectId) {
    $scope.selected = projectId;
  };

  $scope.open = function (projectId) {
    $uibModalInstance.close(projectId);
  };

  immediateUpdateSearch();
}]);
;

var musicShowCaseApp = angular.module("MusicShowCaseApp");
musicShowCaseApp.controller("projectSettingsModalCtrl", ["$q", "$scope", "$uibModalInstance", "FileRepository", "project", "buttonText", function ($q, $scope, $uibModalInstance, FileRepository, project, buttonText) {
  var currentObserver;

  var immediateUpdateSearch = function immediateUpdateSearch() {
    if (currentObserver) currentObserver.close();
    currentObserver = FileRepository.search($scope.searchKeyword, {
      type: ['project']
    }).observe(function (files) {
      $scope.filesTotal = files.total;
      $scope.files = files.results;
    });
  };

  $scope.project = project;
  $scope.buttonText = buttonText;

  var getIndex = function getIndex(id) {
    return FileRepository.getFile(id).then(function (file) {
      return file.index;
    });
  };

  $scope.refs = [];
  $q.all(($scope.project.ref || []).map(getIndex)).then(function (refs) {
    $scope.refs = refs;
  });
  $scope.updateSearch = fn.debounce(immediateUpdateSearch, 250);

  $scope.cancel = function () {
    $uibModalInstance.dismiss();
  };

  $scope.done = function () {
    $scope.project.ref = $scope.refs.map(getId);
    $uibModalInstance.close($scope.project);
  };

  var getId = function getId(x) {
    return x.id;
  };

  $scope.remove = function (file) {
    $scope.refs = $scope.refs.filter(function (f) {
      return f.id !== file.id;
    });
  };

  $scope.add = function (file) {
    if ($scope.refs.map(getId).indexOf(file.id) === -1) {
      $scope.refs.push(file);
    }
  };

  immediateUpdateSearch();
}]);
;

var musicShowCaseApp = angular.module("MusicShowCaseApp");
musicShowCaseApp.controller("recycleBinModalCtrl", ["$scope", "$timeout", "$uibModalInstance", "FileRepository", function ($scope, $timeout, $uibModalInstance, FileRepository) {
  $scope.dismiss = function () {
    $uibModalInstance.dismiss();
  };

  var immediateUpdateSearch = function immediateUpdateSearch() {
    FileRepository.searchRecycled($scope.searchKeyword, {
      limit: 10
    }).then(function (results) {
      $timeout(function () {
        $scope.files = results.results;
        $scope.filesTotal = results.total;
      });
    });
  };

  $scope.updateSearch = fn.debounce(immediateUpdateSearch, 250);

  $scope.restoreFromRecycleBin = function (file) {
    FileRepository.restoreFromRecycleBin(file.id).then(immediateUpdateSearch);
  };

  immediateUpdateSearch();
}]);
;

var musicShowCaseApp = angular.module("MusicShowCaseApp");
musicShowCaseApp.controller("welcomeModalCtrl", ["$q", "$scope", "$uibModalInstance", "Recipe", "WelcomeMessage", "dontshowagain", function ($q, $scope, $uibModalInstance, Recipe, WelcomeMessage, dontshowagain) {
  $scope.dontshowagain = dontshowagain;
  var skipUpdated = $q.when(null);

  $scope.updateSkip = function () {
    skipUpdated = WelcomeMessage.setSkip($scope.dontshowagain);
  };

  $scope.dismiss = function () {
    skipUpdated.then(function () {
      $uibModalInstance.dismiss();
    });
  };

  $scope.tutorial = function () {
    skipUpdated.then(function () {
      $uibModalInstance.dismiss();
      Recipe.start('intro');
    });
  };
}]);
//# sourceMappingURL=site.js.map
