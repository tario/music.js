var musicShowCaseApp = angular.module("MusicShowCaseApp");
var esTranslations = {
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
    help_about: 'Acerca de Music.js',
    recycle_bin: 'Papelera de Reciclaje...',
    tooltip: {
      'new': 'Puedes crear nuevos items en blanco desde esta opcion',
      preferences: 'Puedes editar tus preferencias aqui',
      help: 'Menu para acceder a las opciones de ayuda y *Acerca De*'
    }
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
    dismiss: 'Cerrar',
    language: 'Idioma:',
    HELP: 'AYUDA',
    more: 'mas',
    remove: 'Elimi.',
    reset: 'Fabr.',
    play: 'Reprod.',
    stop: 'Detener',
    record: 'Rec.',
    bpm: 'Ppm',
    add: 'Agreg.',
    tooltip: {
      playing_speed: 'Velocidad de reproduccion, cantidad de pulsos por minuto',
      remove_item: 'Elimina el elemento, puedes restaurarlo desde la papelera de reciclaje'
    },
    new_instrument: 'Nuevo Instrumento',
    new_pattern: 'Nuevo Patron',
    new_song: 'Nueva Cancion'
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
      note_event_p3: 'Evento de nota. Clickea para seleccionarlo y editarlo'
    }
  },
  song: {
    drop_pattern: "Suelta el patron aqui",
    tooltip: {
      measure_beats: "Pulsos/Compas. Tiene que coincidir con el de los patrones que se usan",
      play: "Click para reproducir la cancion",
      stop: "Click para detener la reproduccion",
      download: "Click para grabar la cancion a un archivo de audio y descargarlo",
      drop_pattern: "Area para soltar los patrones, arrastra aqui patrones desde el panel izquierdo",
      remove_block: "Click aqui para eliminar el patron y dejar el bloque vacio",
      play_block: "Click aqui para reproducir este bloque aislado"
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
