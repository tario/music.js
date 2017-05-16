module.export = function(m) {

  m.lang("en", {
    wave_shaper: {
      samples: 'Samples',
      tooltip: {
        formula: 'Formula for wave shaping'
      }
    },
    note_frequency_generator: {
      time_constant: "Time Constant"
    },
    note_condition: {
      note_on: "Note ON",
      note_off: "Note OFF",
      leave_time_constant: "Leave Time Constant",
      enter_time_constant: "Enter Time Constant",
    },
    signal_constant: {
      tooltip: {
        constant: 'Produce a constant output signal of a given value'
      },
      description: 'Produce a constant output signal of a given value'
    },
    signal_monitor: {
      tooltip: {
        signal_value: "Current value of the signal",
        upper_bound: "Upper bound of the signal during the measurement cycle",
        lower_bound: "Lower bound of the signal during the measurement cycle"
      },
      signal_value: 'Signal value',
      upper_bound: 'Upper bound',
      lower_bound: 'Lower bound'
    },
    sample_rate_reduction: {
      tooltip: {
        factor: 'Rate reduction factor'
      }
    },
    bit_crushing: {
      tooltip: {
        bits: 'Number of bits to represent each sample'
      }
    },
    note_delay: {
      description: 'Delay of note events (start and end)',
      delay: 'Delay',
      tooltip: {
        delay: 'Delay of note events (start and end) expressed in seconds'
      }
    },
    delay: {
      description: 'Delay of audio signal',
      delay: 'Delay',
      tooltip: {
        delay: 'Delay of audio signal in seconds'
      }
    },
    adsr: {
      description: 'ADSR Envelope signal',
      reset_on_cut: 'Reset on cut',
      tooltip: {
        attack: 'The time in seconds for the first phase (attack) where the gain rise from 0 to 1',
        decay: 'The time in seconds for the second phase (decay) where the gain drops from 1 to sustain level',
        release: 'The time in seconds for the final phase where the gain drops from the sustain level to zero when you release the note',
        sustain: 'The sustain level, should be a value between 0 and 1',
        reset_on_cut: 'Resets to the ADS phase when a note cuts another'
      }
    },
    polyphoner: {
      channels: 'Channels',
      tooltip: {
        channels: 'Maximum number of channels'
      }
    },
    monophoner: {
      force_note_cut: 'Force note cut',
      tooltip: {
        force_note_cut: 'If activated, uses note cut even if the notes produced by the generator supports changing values'
      }
    },
    oscillator: {
      time_constant: 'Time constant (freq change)',
      osc_type: 'Osc. type',
      preset: 'Preset',
      waveform: 'Waveform',
      serie: 'Serie',
      terms: 'Terms',
      fixed_frequency: 'Fixed frequency',
      modl: {
        detune: 'Detune modulation'
      },
      type: {
        sine: 'sine',
        cosine: 'cosine',
        sawtooth: 'sawtooth',
        triangle: 'triangle',
        square: 'square',
        square20: 'square 20%',
        custom: 'custom...',
        triangle_square: 'triangle square',
        triangle_sine: 'triangle sine'
      },
      tooltip: {
        osc_type: 'Oscillator type (waveform), if you choose \'custom\', you will be able to config a lot of extra options to customize the waveform',
        preset: 'Preset config, you can use it as starting point to build your custom configs',
        formula: 'Waveform mathematic formula, it should take as input a time value t between 0 and 1, and return the signal level, a number between -1 and 1',
        samples: 'Number of samples taken to build the fourier terms. Small values implies lower resolutions',
        serie_a: 'a(n) series expression, function of n. These are the coefficients for Cos(n*t). If you change this, it would reset the waveform parameters, you can only choose one of both',
        serie_b: 'b(n) series expression, function of n. These are the coefficients for Sin(n*t). If you change this, it would reset the waveform parameters, you can only choose one of both',
        coefficient: 'Cos and sin coefficient values for each TERM given n. You can modify these values by hand, but these would be recalculated if you change the options above',
        graph: 'This box shows a graph for the final waveform result',
        fixed_frequency: 'Enable this, if you want to fix the frequency of the oscillator to a given value',
        modl: {
          detune: 'You can setup the effects for detune modulation here. If you leave it empty, there will be no modulation at all'
        },
        time_constant: 'Exponential time constant for frequency change, the lower the value, the faster will be the change (zero is not admitted)'
      }
    },
    script: {
      tooltip: 'This is the source code window, you can write your script here'
    },
    noise: {
      description: 'White noise generator'
    },
    pink_noise: {
      description: 'pink noise generator'
    },
    red_noise: {
      description: 'Red noise generator'
    },
    note_time_shift: {
      description: 'delays or move forward all events on track',
      tooltip: {
        time: 'Time to shift both start and end time of the event. Can be negative or positive'
      }
    },
    note_padding: {
      description: 'Note Padding',
      tooltip: {
        time: 'Silence padding duration after note stops'
      }
    },
    arpeggiator: {
      description: 'Note Arpeggiator',
      notes: 'Notes',
      arpeggio: 'Arpeggio',
      scale: 'scale',
      semitone: 'semitone',
      interval: 'interval',
      total: 'total',
      loop: 'loop',
      duration: 'duration',
      gap: 'gap',
      tooltip: {
        semitone: 'Enable this to use a tone scale instead of the default tone scale',
        scale: 'Define the scale, by choosing the initial semitone. You can see the result on the right',
        interval: 'The increment between notes (applies for both, tone and semitone arpeggiators)',
        total: 'Total ammout of notes for the arpeggiator',
        loop: 'Enable this option, if you want the arpeggiator to loop after the sequence is completed, otherwise, the note will keep playing the sound of the last note after the sequence is completed',
        duration: 'Duration of this note of the sequence, in milliseconds',
        gap: 'Duration of silence gap between notes, in milliseconds'
      }
    },
    reverb: {
      tooltip: {
        room: 'room size',
        damp: 'reverb HF damp',
        mix: 'dry/wet balance'
      },
      description: 'Reverb powered by timbre.js'
    },
    gain: {
      tooltip: {
        gain: 'volume gain value, 0.0 = silence, 1.0 = keep the signal, >1.0 = amplify'
      },
      description: 'Increase or decrease the amp. of signal'
    },
    filter: {
      tooltip: {
        cut: 'cut frequency for the filter',
        detune: 'detune (cents) to alter the frequency',
        quality: 'quality factor for the filter'
      }
    },
    echo: {
      description: 'Single echo effect',
      tooltip: {
        gain: 'amplification level between repetitions',
        delay: 'time separation (in seconds) between repetitions'
      }
    },
    signal_scale: {
      tooltip: {
        base: 'base signal target level',
        top: 'top signal target level'
      },
      description: 'Scale signal'
    },
    transpose: {
      description: 'Transpose by N semitones',
      tooltip: {
        amount: 'amount of *semitones* to add to note number (e.g. 12 semitones = 1 octave)'
      }
    },
    rise: {
      description: 'Rise signal to target',
      tooltip: {
        time: 'time in seconds to get from zero to the target',
        target: 'target signal level to reach'
      }
    }
  });

  m.lang("es", {
    wave_shaper: {
      samples: 'Muestras',
      tooltip: {
        formula: 'Formula para cambio de onda'
      }
    },
    note_frequency_generator: {
      time_constant: "Constante de tiempo"
    },
    note_condition: {
      note_on: "Nota Activa",
      note_off: "Nota Inactiva",
      leave_time_constant: "c. de tiempo al entrar",
      enter_time_constant: "c. de tiempo al salir",
    },
    signal_constant: {
      tooltip: {
        constant: 'Produce una señal constante con un valor determinado'
      },
      description: 'Produce una señal constante con un valor determinado'
    },
    signal_monitor: {
      tooltip: {
        signal_value: "Valor actual de la señal",
        upper_bound: "Cota superior de la señal durante el ciclo de medida",
        lower_bound: "Cota superior de la señal durante el ciclo de medida"
      },
      signal_value: 'Valor de la señal',
      upper_bound: 'Cota superior',
      lower_bound: 'Cota inferior'
    },
    sample_rate_reduction: {
      tooltip: {
        factor: 'Factor de reduccion de frecuencia de muestreo'
      }
    },
    bit_crushing: {
      tooltip: {
        bits: 'Cantidad de bits para representar cada muestra'
      }
    },
    note_delay: {
      description: 'Demora de los eventos de nota (inicio y final)',
      delay: 'Demora',
      tooltip: {
        delay: 'Demora de los eventos de nota (inicio y final) expresado en segundos'
      }
    },
    delay: {
      description: 'Demora de la señal de audio',
      delay: 'Demora',
      tooltip: {
        delay: 'Demora de la señal de audio en segundos'
      }
    },
    adsr: {
      description: 'Señal de envoltura ADSR',
      reset_on_cut: 'Reiniciar en corte',
      tooltip: {
        attack: 'Tiempo en segundos para la primera fase (ataque) donde la ganancia de volumen aumenta de 0 a 1',
        decay: 'Tiempo en segundos para la segunda fase (decaimiento) done la ganancia de volumen cae de 1 hasta el nivel de *sustain*',
        release: 'Tiempo en segundos para la fase final donde la ganancia de volumen cae desde el nivel de sustain hasta cero',
        sustain: 'Nivel de sustain, debe ser un valor entre 0 y 1',
        reset_on_cut: "Reinicia a la fase ADS cuando una nota corta a otra"
      }
    },
    polyphoner: {
      channels: 'Canales',
      tooltip: {
        channels: 'Numero maximo de canales'
      }
    },
    monophoner: {
      force_note_cut: 'Forzar corte de nota',
      tooltip: {
        force_note_cut: 'Si se activa, corta las notas incluso si estas soportan cambio de valor'
      }
    },
    oscillator: {
      time_constant: 'Const. de tiempo (freq)',
      osc_type: 'Tipo de Osc.',
      preset: 'Preset',
      waveform: 'Forma de onda',
      serie: 'Serie',
      terms: 'Terminos',
      fixed_frequency: 'Fijar frecuencia',
      modl: {
        detune: 'Modulacion del detune'
      },      
      type: {
        sine: 'senoidal',
        cosine: 'cosenoidal',
        sawtooth: 'diente de sierra',
        triangle: 'triangular',
        square: 'cuadrada',
        square20: 'cuadrada al 20%',
        custom: 'personalizada...',
        triangle_square: 'triangular y cuadrada',
        triangle_sine: 'triangular y senoidal'
      },
      tooltip: {
        osc_type: 'Tipo de oscilador (forma de onda), si seleccionas \'custom\', podras configurar muchas opciones extra para personalizar la forma de onda',
        preset: 'Configuracion preestablecida, puedes usarla como punto de partida para personalizar tus propias opciones',
        formula: 'Formula matematica para la forma de onda, debe tomar como entrada un valor de tiempo entre 0 y 1 y devolver un nivel de señal entre -1 y 1',
        samples: 'Cantidad de muestras a usar para calcular los terminos de fourier. Valores mas pequeños implican menores resoluciones',
        serie_a: 'Expresion de a(n), en funcion de n. Estos son los coeficientes para Cos(n*t). Si los cambias, se reiniciaran los parametros de la forma de onda, solo puedes optar por definir uno de ambos',
        serie_b: 'Expresion de b(n), en funcion de n. Estos son los coeficientes para Sin(n*t). Si los cambias, se reiniciaran los parametros de la forma de onda, solo puedes optar por definir uno de ambos',
        coefficient: 'Valores de los coeficientes para cos y sin de cada termino dado un n. Puedes modificar estos valores a mano, pero ten en cuenta que seran recalculados si modificas las opciones de arriba',
        graph: 'Esta caja contiene un grafico de la forma de onda que se obtiene con las configuraciones',
        fixed_frequency: 'Activa esto, si quieres que la frecuencia del oscilador sea fija a un determinado valor',
        modl: {
          detune: 'Puedes determinar los efectos para modular el *detune* aqui. Si dejas esto vacio, no habra ninguna modulacion'
        },
        time_constant: 'Determina la constante de tiempo exponencial para el cambio de frecuencias, cuanto mas bajo sea el valor el cambio sera mas rapido (no se admite cero)'
      }
    },
    script: {
      tooltip: 'Esta es la ventana de codigo fuente, puedes escribir to script aqui'
    },
    noise: {
      description: 'Generador de ruido blanco'
    },
    pink_noise: {
      description: 'Generador de ruido rosa'
    },
    red_noise: {
      description: 'Generador de ruido rojo'
    },
    note_time_shift: {
      description: 'Demora o adelanta todos los eventos en la pista',
      tooltip: {
        time: 'Tiempo a desplazar tanto el inicio como el final del evento. Puede ser positivo o negativo'
      }
    },
    note_padding: {
      description: 'Relleno de nota',
      tooltip: {
        time: 'Relleno con silencio despues de que la nota se detiene'
      }
    },
    arpeggiator: {
      description: 'Arpegiador de Notas',
      notes: 'Notas',
      arpeggio: 'Arpegio',
      scale: 'escala',
      semitone: 'semitono',
      interval: 'intervalo',
      total: 'total',
      loop: 'bucle',
      duration: 'duracion',
      gap: 'brecha',
      tooltip: {
        semitone: 'Activa esta opcion para usar una escala por semitonos en lugar de la escala por tonos por defecto',
        scale: 'Define la escala segun su semitono inicial. Puedes ver el resultado a la derecha',
        interval: 'Incremento de valor entre notas (aplica tanto a escalas por tono como por semitono)',
        total: 'Cantidad total de notas en la secuencia',
        loop: 'Activa esta opcion, si quieres que el arpegiador vuelva a comenzar la secuencia cuando termine, de otra forma, la ultima nota se mantendra reproduciendose cuando la secuencia se complete',
        duration: 'Duration de los notas, en milisegundos',
        gap: 'Duracion de la brecha de silencio entre notas, en milisegundos'
      }      
    },
    reverb: {
      tooltip: {
        room: 'Tamaño de la habitacion',
        damp: 'Disminucion en la reverberacion',
        mix: 'Balance entre seco y humedo'
      },
      description: 'Reverberacion, provista por timbre.js'
    },    
    gain: {
      tooltip: {
        gain: 'Valor de ganancia, 0.0 = silencio, 1.0 = mantener la señal, >1.0 = amplificar'
      },
      description: 'Aumenta o reduce la amplitud de la señal'
    },
    filter: {
      tooltip: {
        cut: 'Frecuencia de corte para el filtro',
        detune: 'Desplazamiento (centimos) para alterar la frecuencia',
        quality: 'Factor de calidad para el filtro'
      }
    },
    echo: {
      description: 'Efecto de eco simple',
      tooltip: {
        gain: 'Nivel de amplificacion entre las repeticiones',
        delay: 'Separacion en el tiempo (en segundos) entre las repeticiones'
      }
    },
    signal_scale: {
      tooltip: {
        base: 'nivel base objetivo de la señal',
        top: 'nivel superior objetivo de la señal'
      },
      description: 'Escala la señal'
    },
    transpose: {
      description: 'Transpone N semitonos',
      tooltip: {
        amount: 'Cantidad de *semitonos* a agregar al valor de la nota (12 semitonos = 1 octava)'
      }
    },
    rise: {
      description: 'Eleva gradualmente una señal hasta un objetivo',
      tooltip: {
        time: 'tiempo en segundos para llegar desde cero hasta el objetivo',
        target: 'nivel de señal objetivo al que llegar'
      }
    }
  });

  var DisposableAudioContextWrapper = function(context) {
    this.context = context;
    this.disposeList = [];
  };

  var wrapNodeConnections = function(node, disposeList) {
      var originalConnect = node.connect.bind(node);
      var originalDisconnect = node.disconnect.bind(node);
      var connected = new WeakMap();
      node.disconnect = function(dest) {
        if (!connected.has(dest)) return;
        connected.delete(dest);
        originalDisconnect(dest);
      };
      node.connect = function(dest) {
        disposeList.push(function() {
          node.disconnect(dest);
        });
        connected.set(dest, 1);
        return originalConnect(dest);
      };

      return node;
  };

  var methods = ["createBuffer", "createBufferSource", "createMediaElementSource", "createMediaStreamSource", "createMediaStreamDestination", "createGain", "createDelay", "createBiquadFilter", "createIIRFilter", "createWaveShaper", "createPanner", "createConvolver", "createDynamicsCompressor", "createAnalyser", "createScriptProcessor", "createStereoPanner", "createOscillator", "createPeriodicWave", "createChannelSplitter", "createChannelMerger"];
  methods.forEach(function(method) {
    DisposableAudioContextWrapper.prototype[method] = function() {
      return wrapNodeConnections(this.context[method].apply(this.context, arguments), this.disposeList);
    };
  });

  DisposableAudioContextWrapper.prototype.dispose = function() {
    for (var i=0; i<this.disposeList.length; i++) {
      this.disposeList[i]();
    }
  };

  var webaudioInstrument = function(instrument) {
    if (!instrument) {
      return function(context, destination) {
        var stop = function() {
        };
        var play = function() {
          return {stop: stop};
        };
        var note = function() {
          return MUSIC.playablePipeExtend({play: play});
        };
        return {note: note};
      };
    }

    return function(context_or_music, destination) {
      if (context_or_music._destination) {
        return instrument(context_or_music);
      }

      var context = new MUSIC.Context();
      var music = (new MUSIC.AudioDestinationWrapper(context, destination)).sfxBase();
      var ret = instrument(music);

      ret.dispose = function(){
        factory.prune();
      };

      return ret;
    };
  };

  var withScopedNote = function(instrument) {
    return function(music) {
      var context = music._audio.audio;
      var destination = music._audioDestination._destination;
      if (instrument.length === 1) {
        return instrument(music);
      } else if (instrument.length === 2) {
        var instr = instrument(context, destination);
        var nullPlay = function() { return {stop :function(){}} };

        return {
          note: function(n) {
            var wrappedContext = new DisposableAudioContextWrapper(context);
            var playable;

            if (instr) {
              playable = instr.note(n, wrappedContext, destination); 
            } else {
              playable = { play: nullPlay };
            }

            return MUSIC.playablePipeExtend(playable)
              .onError(function(err) {
                if (wrappedContext.dispose) wrappedContext.dispose();
              })
              .onStop(function() {
                if (wrappedContext.dispose) wrappedContext.dispose();
              });
          }
        };
      }
    };
  };

  m.type("script", {template: "script", description:"Script", _default: {
    code: ["",
    "function(instrument) {",
    "  return function(context, destination) {",
    "    var gain = context.createGain();",
    "    gain.connect(destination);",
    "    gain.gain.value = 0.6;",
    "    return instrument(context, gain);",
    "  };",
    "}"].join("\n")
  }}, function(object, subobjects) {
    if (!object) return;
    return function(music) {
      var frequency = MUSIC.Instrument.frequency;
      var note = function(f) {
        return MUSIC.instrumentExtend({note: f});
      };

      var play = function(f) {
        return {play: function() {
          return f() || {stop: function() {}};
        }};
      };

      var stop = function(f) {
        return {stop: f};
      };

      var inner = eval("("+object.code+")");

      var waInstr = webaudioInstrument(subobjects[0]);
      var scoped = withScopedNote(inner(waInstr));

      return scoped(music);
    };
  });

  m.type("null", {template: "null", description: "This is a placeholder, it does nothing"}, function(data, subobjects) {
    if (!subobjects) return;
    var ret = function(music) {
        if (!subobjects) return null;
        var instrument = subobjects[0];
        return instrument(music);
    };

    ret.update = function() {
      // do nothing;
      return this;
    };

    return ret;
  });

  m.type("multi_instrument", {subobjects: true, template: "multi_instrument", description: "Multi Instrument", composition: true}, function(data, subobjects) {
    if (!data) return;
    if (!subobjects) return;
    var ret = function(music){
        if (!subobjects) return null;
        var instrument = new MUSIC.MultiInstrument(subobjects.map(function(obj) {
          return obj(music);
        }));
        return instrument;
    };

    ret.update = function(data) {
      // do nothing
      return this;
    };

    return ret;
  });

  var oscillatorStackAppend = function(file, data) {
    var isEnvelopedGain = function(obj) {
      if (obj.type === 'gain') {
        if (obj.data && obj.data.modulation && obj.data.modulation.gain) {
          var gainModulation = obj.data.modulation.gain;
          if (gainModulation.type === "stack") {
            if (gainModulation.data &&
                gainModulation.data.array &&
                gainModulation.data.array[0] &&
                gainModulation.data.array[0].type === 'adsr') {
              return true;
            }
          }
        }
      }
      return false;
    };

    if (!file.array.some(isEnvelopedGain)) {
      var gainModulation = {
        type: "stack",
        data: {
          array: [{
            type: "adsr",
            data: {attackTime: 0.01, decayTime: 0.4, sustainLevel: 0.8, releaseTime: 0.1}
          }]
        }
      };

      file.array.push({type: 'gain', data: {modulation: {gain: gainModulation}, gain: 0.0}});
    }

    file.array.push({type: data.name, data: {}});
  };

  m.type("signal_monitor", {template: 'monitor', description: 'Signal Monitor', monitor: true}, function(data, subobjects, components) {
    if (!subobjects) return;
    var wrapped = subobjects[0];
    var currentObserver;

    if (!wrapped) return;

    var phase = 0;
    var upperBound = -Infinity;
    var lowerBound = Infinity;
    var s, s2, s3;
    var monitorFcn = function(t) {
      if (currentObserver) {
        phase += 0.00005;

        if (t > upperBound) upperBound = t;
        if (t < lowerBound) lowerBound = t;

        if (phase > 1) {
          phase--;
          s = t < 0 ? -1 : 1;
          s2 = upperBound < 0 ? -1 : 1;
          s3 = lowerBound < 0 ? -1 : 1;
          currentObserver({
            sign: s,
            signalValue: t*s,
            upperBoundSign: s2,
            upperBoundValue: upperBound*s2,
            lowerBoundSign: s3,
            lowerBoundValue: lowerBound*s3
          });

          upperBound = -Infinity;
          lowerBound = Infinity;
        }
      }
      return t;
    };

    var lastObject = null;
    var ret = function(music) {
      if (lastObject) {
        lastObject.dispose();
        lastObject = null;
      }

      lastObject = music.formula(monitorFcn);
      return wrapped(lastObject);
    };

    ret.update = function() {
      return this;
    };

    ret.dataLink = function(obs) {
      currentObserver = obs;
    };

    return ret;
  });

  m.type("signal_constant", {template: "constant", description: "Constant signal"}, 
    function(data, subobjects, components) {
    if (!data) return;
      return function(music){
        var generator = music.constant({offset: data.offset});
        return new MUSIC.MonoNoteInstrument(new MUSIC.Instrument(generator), {start: true});
      };
  });

  var defaultModWrapper = function(x){return x;};
  m.type("oscillator", {template: "oscillator", description: "Oscillator", stackAppend: oscillatorStackAppend,
    components: ["detune"]}, function(data, subobjects, components) {
    if (!data) return;
      return function(music, options){
          var props = {
            type: data.oscillatorType ||"square",
            fixed_frequency: data.fixed_frequency && data.frequency,
            terms: data.terms,
            time_constant: data.time_constant
          };

          var modulatorInstruments = {};
          if (components && components.detune) {
            props.detune = MUSIC.modulator(function(pl) {
              var inst = components.detune(pl, {nowrap: true});
              modulatorInstruments.detune = inst;
              return inst;
            });
          };

          var generator = music.oscillator(props);
          var inner = new MUSIC.MonoNoteInstrument(new MUSIC.Instrument(generator), {start: true});

          return new MUSIC.MultiInstrument(function() {
            var instrumentArray = [inner];
            for (var k in modulatorInstruments) {
              instrumentArray.push(modulatorInstruments[k]);
            }
            return instrumentArray;
          });
      };
  });

  Promise.defer = function() {
    var result = {};
    result.promise = new Promise(function(resolve, reject) {
        result.resolve = resolve;
        result.reject = reject;
    });
    return result;
  };


  m.type("polyphoner", {template: "polyphoner", description: "Turns monophonic instrument into polyphonic"},
    function(data, subobjects) {

    if (!subobjects) return;
    var wrapped = subobjects[0];
    if (!wrapped) return;

    var maxChannels = 4;
    var getMaxChannels = function() { return maxChannels; };

    var ret = function(music) {
      var factory = function() {
        return wrapped(music, {nowrap: true});
      };
      return new MUSIC.PolyphonyInstrument(factory, getMaxChannels);
    };

    ret.update = function(data) {
      maxChannels = data.maxChannels || 4;
      return this;
    };

    ret.update(data);

    return ret;

  });

  m.type("monophoner", {template: "monophoner", description: "Turns polyphonic instrument into monophonic"}, 
    function(data, subobjects) {
    if (!subobjects) return;
    var wrapped = subobjects[0];
    if (!wrapped) return;

    var ret = function(music) {
      var inst = wrapped(music);
      var lastPlaying = null;
      var lastNoteInst = null;
      var noteCount = 0;
      
      var note = function(n) {
        var innerNote;

        var createPlaying = function() {
          return {
            stop: function() {
              if (noteCount > 0) noteCount--;
              if (noteCount === 0) {
                if (lastPlaying) lastPlaying.stop();
                this.stop = function(){};
                lastNoteInst = null;
                lastPlaying = null;
              }
            }
          };
        };

        if (lastNoteInst && lastNoteInst.setValue && !forceNoteCut) {
          var play = function() {
            var playing = createPlaying();

            noteCount++;
            lastNoteInst.setValue(n);
            return playing;
          };

          return MUSIC.playablePipeExtend({play: play});
        } else {
          lastNoteInst = inst.note(n);
          innerNote = lastNoteInst;

          var play = function(){
            noteCount++;
            if (lastPlaying) {
              lastPlaying.stop();
              if (lastPlaying) lastPlaying.stop = function(){};
            }
            lastPlaying = innerNote.play();
            var playing = createPlaying();

            return playing;
          };

          var ret = {
            play: play
          };

          return MUSIC.playablePipeExtend(ret);
        }

      };

      return MUSIC.instrumentExtend({
        note: note
      });      
    };

    var forceNoteCut;
    ret.update = function(data) {
      forceNoteCut = data.force_note_cut;
      return this;
    };
    ret.update(data);

    return ret;
  });

  m.type("rise", {
        template: "generic_wrapper_editor", 
        parameters: [
          {name: "time", value: 1, tooltip: 'core.rise.tooltip.time'},
          {name: "target", value: 1, tooltip: 'core.rise.tooltip.target'}
        ], 
        description: "core.rise.description",
  }, function(data, subobjects) {
    var fallTime = 1;
    var target = 1;
    var nullPlay = {
      play: function() {
        return {
          stop: function() {}
        };
      }
    };

    var ret = function(music) {
      var baseNode = music;
      var audioParamModulation = music.audioParamModulation;
      if (!audioParamModulation) {
        baseNode = baseNode.constant(0);
        audioParamModulation = baseNode._destination.offset;
      }

      return {
        note: function() {
          var currentTime = music._audio.audio.currentTime;
          audioParamModulation.cancelScheduledValues(0.0);
          audioParamModulation.value = 0.0;
          audioParamModulation.setTargetAtTime(target, currentTime, fallTime/6);

          return nullPlay;
        }
      };
    };

    ret.update = function(data) {
      fallTime = parseFloat(data.time);
      target = parseFloat(data.target);

      return this;
    };
    ret.update(data);
    return ret;
  });

  m.type("note_frequency_generator", {
    template: "note_frequency_generator", 
    description: "core.note_frequency_generator.description",
    _default: {
      time_constant: 0.01
    }
  }, function(data, subobjects) {
    var frequency = function(notenum) {
        return 16.35 * Math.pow(2, notenum/12);
    };

    var time_constant = 0.01;

    var nullPlaying = { stop: function() {} };

    var ret = function(music) {
      var audioParamModulation = music.audioParamModulation;
      var baseNode = music;

      if (!audioParamModulation) {
        baseNode = baseNode.constant(0);
        audioParamModulation = baseNode._destination.offset;
      }

      var note = function(n) {
        return {
          play: function() {
            audioParamModulation.cancelScheduledValues(0.0);
            audioParamModulation.setTargetAtTime(frequency(n), music._audio.audio.currentTime, time_constant);

            return nullPlaying;
          }
        };
      };

      return MUSIC.instrumentExtend({
        note: note
      });      
    };

    ret.update = function(data) {
      time_constant = parseFloat(data.time_constant)||0.0001;
    };

    ret.update(data);

    return ret;
  });

  m.type("note_condition", {template: "note_condition", description: "core.note_condition.description", _default: {
    note_on: 1.0,
    note_off: 0.0,
    leave_time_constant: 0.01,
    enter_time_constant: 0.01
  }},  function(data, subobjects) {
    var note_on, note_off, leave_time_constant, enter_time_constant;

    var ret = function(music) {
      var audioParamModulation = music.audioParamModulation;
      var baseNode = music.sfxBase();

      if (!audioParamModulation) {
        baseNode = baseNode.constant(0);
        audioParamModulation = baseNode._destination.offset;
      }

      var noteCount = 0;
      var note = function(n) {
        var play = function(){
          var currentLevel = audioParamModulation.value;

          if (noteCount === 0) {
            audioParamModulation.cancelScheduledValues(0.0);
            audioParamModulation.setTargetAtTime(note_on, music._audio.audio.currentTime, enter_time_constant);
          }

          noteCount++;
          return {stop: function(){}};
        };

        return MUSIC.playablePipeExtend({play: play})
            .onStop(function() {
                noteCount--;
                // don't release if noteCount > 0
                if (noteCount > 0) return;
                audioParamModulation.cancelScheduledValues(0.0);
                audioParamModulation.setTargetAtTime(note_off, music._audio.audio.currentTime, leave_time_constant);
            });
      };

      return MUSIC.instrumentExtend({
        note: note
      });
    };

    var _def = function(val, d) {
      return typeof val === 'undefined' ? d : val;
    };

    ret.update = function(data) {
      note_on = parseFloat(_def(data.note_on, 1.0));
      note_off = parseFloat(_def(data.note_off, 0.0));
      leave_time_constant = parseFloat(_def(data.leave_time_constant,0.01));
      enter_time_constant = parseFloat(_def(data.enter_time_constant,0.01));
      return this;
    };

    ret.update(data);

    return ret;
  });

  var targetExponentialCurve = function(v0, v1, t, timeConstant) {
    return v1 + (v0 - v1) * Math.exp(-t/timeConstant);
  };

  m.type("envelope", {template: "envelope", description: "ADSR", _default: {
    attackTime: 0.01,
    decayTime: 0.4,
    sustainLevel: 0.8,
    releaseTime: 0.4,
    reset_on_cut: false
  }},  function(data, subobjects) {
    if (!subobjects) return;
    var wrapped = subobjects[0];
    if (!wrapped) return;

    var samples, attackTime, decayTime, sustainLevel, releaseTime;
    var resetOnCut = false;
    var infinitesimalAttackTime = 0.000001;
    var timeConstantToTimeFactor = 1/6;

    var eventPreprocessor = function(event) {
      var l = event[2];
      l = l - releaseTime * 1000;
      if (l <0 ) l = 0;

      return [event[0], event[1], l];
    };

    var ret = function(music) {
      var baseNode = music.sfxBase();
      var gainNode = baseNode.gain(0.0);
      var secondGainNode = gainNode.gain(1.0);

      var audioParam = gainNode._destination.gain;
      var secondAudioParam = secondGainNode._destination.gain;

      var inst = wrapped(secondGainNode);
      var lastAttackTime;
      var lastReleaseTime;
      var lastReleaseV0;

      var noteCount = 0;
      var note = function(n) {
        var innerNote;

        var noteInst = inst.note(n);

        var play = function(){
          var playing = noteInst.play();

          if (noteCount === 0 || resetOnCut) {
            var currentTime = gainNode.currentTime();

            lastAttackTime = currentTime;

            audioParam.cancelScheduledValues(0.0);

            if (lastReleaseTime) {
              var t = currentTime - lastReleaseTime;
              audioParam.value = targetExponentialCurve(lastReleaseV0, 0.0, t, releaseTime * timeConstantToTimeFactor);
            } else {
              audioParam.value = 0.0;
            }

            audioParam.setTargetAtTime(1.0, currentTime, attackTime * timeConstantToTimeFactor);

            secondAudioParam.cancelScheduledValues(0.0);
            secondAudioParam.value = 1.0;
            secondAudioParam.setTargetAtTime(sustainLevel, currentTime+attackTime, decayTime * timeConstantToTimeFactor);
          }

          noteCount++;

          var origStop = playing.stop.bind(playing);
          playing.stop = function() {
            playing.stop = function() {};
            origStop();
          };
          return playing;
        };

        return MUSIC.playablePipeExtend({play: play})
            .onStop(function() {
                noteCount--;

                var currentTime = gainNode.currentTime();
                // don't release if noteCount > 0
                if (noteCount > 0) return;

                var t = currentTime - lastAttackTime;

                lastReleaseTime = currentTime;
                lastReleaseV0 = targetExponentialCurve(0.0, 1.0, t, attackTime * timeConstantToTimeFactor);

                audioParam.cancelScheduledValues(0.0);
                audioParam.value = lastReleaseV0;
                audioParam.setTargetAtTime(0.0, currentTime, releaseTime * timeConstantToTimeFactor);
            });
      };

      return MUSIC.instrumentExtend({
        note: note,
        eventPreprocessor: eventPreprocessor
      });
    };

    var _def = function(val, d) {
      return typeof val === 'undefined' ? d : val;
    };

    ret.update = function(data) {
      samples = data.samples || 100;  
      attackTime = parseFloat(_def(data.attackTime, 0.4)) || infinitesimalAttackTime;
      decayTime = parseFloat(_def(data.decayTime,0.4));
      sustainLevel = parseFloat(_def(data.sustainLevel,0.8));
      releaseTime = parseFloat(_def(data.releaseTime,0.4));
      if (releaseTime <= 0.0) releaseTime = 0.00001;
      resetOnCut = data.reset_on_cut;

      return this;
    };

    ret.update(data);

    return ret;
  });

  m.type("adsr", {template: "adsr", description: "core.adsr.description", _default: {
    attackTime: 0.01,
    decayTime: 0.4,
    sustainLevel: 0.8,
    releaseTime: 0.4
  }},  function(data, subobjects) {
    var samples, attackTime, decayTime, sustainLevel, releaseTime;
    var resetOnCut = false;
    var infinitesimalAttackTime = 0.000001;
    var timeConstantToTimeFactor = 1/6;

    var eventPreprocessor = function(event) {
      var l = event[2];
      l = l - releaseTime * 1000;
      if (l <0 ) l = 0;

      return [event[0], event[1], l];
    };

    var ret = function(music) {
      var gainNode = music.gain(0.0);
      var secondGainNode = gainNode.gain(1.0);
      secondGainNode.constant({offset: 1});

      var audioParam = gainNode._destination.gain;
      var secondAudioParam = secondGainNode._destination.gain;

      var lastAttackTime;
      var lastReleaseTime;
      var lastReleaseV0;

      var noteCount = 0;
      var note = function(n) {
        var innerNote;
        var play = function(){
          if (noteCount === 0 || resetOnCut) {
            var currentTime = gainNode.currentTime();

            lastAttackTime = currentTime;

            audioParam.cancelScheduledValues(0.0);

            if (lastReleaseTime) {
              var t = currentTime - lastReleaseTime;
              audioParam.value = targetExponentialCurve(lastReleaseV0, 0.0, t, releaseTime * timeConstantToTimeFactor);
            } else {
              audioParam.value = 0.0;
            }

            audioParam.setTargetAtTime(1.0, currentTime, attackTime * timeConstantToTimeFactor);

            secondAudioParam.cancelScheduledValues(0.0);
            secondAudioParam.value = 1.0;
            secondAudioParam.setTargetAtTime(sustainLevel, currentTime+attackTime, decayTime * timeConstantToTimeFactor);
          }

          noteCount++;
          return {stop: function(){}};
        };

        return MUSIC.playablePipeExtend({play: play})
            .onStop(function() {
                noteCount--;

                var currentTime = gainNode.currentTime();
                // don't release if noteCount > 0
                if (noteCount > 0) return;

                var t = currentTime - lastAttackTime;

                lastReleaseTime = currentTime;
                lastReleaseV0 = targetExponentialCurve(0.0, 1.0, t, attackTime * timeConstantToTimeFactor);

                audioParam.cancelScheduledValues(0.0);
                audioParam.value = lastReleaseV0;
                audioParam.setTargetAtTime(0.0, currentTime, releaseTime * timeConstantToTimeFactor);
            });
      };

      return MUSIC.instrumentExtend({
        note: note,
        eventPreprocessor: eventPreprocessor
      });
    };

    var _def = function(val, d) {
      return typeof val === 'undefined' ? d : val;
    };

    ret.update = function(data) {
      samples = data.samples || 100;  
      attackTime = parseFloat(_def(data.attackTime, 0.4))||infinitesimalAttackTime;
      decayTime = parseFloat(_def(data.decayTime,0.4));
      sustainLevel = parseFloat(_def(data.sustainLevel,0.8));
      releaseTime = parseFloat(_def(data.releaseTime,0.4));
      if (releaseTime <= 0.0) releaseTime = 0.00001;
      resetOnCut = data.reset_on_cut;

      return this;
    };

    ret.update(data);

    return ret;
  });

  m.type("note_delay", {template: 'note_delay', description: 'Note Delay', _default: {delay: 0.1}},
      function(data, subobjects) {
        if (!subobjects) return;
        var wrapped = subobjects[0];
        if (!wrapped) return;

        var delay = 100; //ms
        var ret = function(music) {
          var inst = wrapped(music);

          var note = function(n) {
            var noteInst = inst.note(n);  
            var play = function() {
              var playing;
              var _delay = delay;

              setTimeout(function() {
                playing = noteInst.play();
              }, _delay);
              var stop = function() {
                setTimeout(function() {
                  if (playing) playing.stop();
                }, _delay);
              };
              return {stop: stop};
            };

            return MUSIC.playablePipeExtend({play: play});
          };

          return MUSIC.instrumentExtend({
            note: note
          });
        };

        ret.update = function(data) {
          delay = data.delay * 1000;

          return this;
        };

        ret.update(data);

        return ret;

      });


  var compose = function(f1, f2) {
    return function(s, t) {
      return f2(f1(s, t), t);
    };
  };

  var addFormula = function(music, f) {
    if (music.isFormula) {
      var functions = [];
      var _f = f;
      for (var node = music; node.isFormula; node = node.next()) {
        _f = compose(node.fcn, _f);
      }
      music.update(_f);
      return music;
    } else {
      return music.formula(f);
    }
  };

  m.type("sample_rate_reduction", {
    reusableNode: true,
    template: "sample_rate_reduction",
    description: "Sample Rate Reduction", _default: {
      factor: 0.5
  }}, function(data, subobjects){
    if (!subobjects) return;
    var wrapped = subobjects[0];
    if (!wrapped) return;

    var factor = 0.5;
    var ret = function(music) {
      var sampleRate = music._audio.audio.sampleRate;
      var sampleRateFactor = sampleRate*factor;
      var exp = Math.round(Math.log2(sampleRateFactor));
      sampleRateFactor = Math.pow(2, exp);

      var modl = MUSIC.modulator(function(pl) {
        var base = pl.sfxBase();
        var modlGenerator = base
          .signal_scale({base: 0, top: 1/sampleRateFactor})
          .oscillator({
            type: 'sawtooth',
            fixed_frequency: sampleRateFactor
          });

        var inst = new MUSIC.MonoNoteInstrument(new MUSIC.Instrument(modlGenerator), {start: true});
        inst.note(0).play();

        return inst;
      });

      return wrapped(music.delay(modl));
    };

    ret.update = function(data) {
      factor = data.factor;

      if (factor < 1/64) factor = 1/64;
      return this;
    };

    ret.update(data);

    return ret;
  });

  m.type("wave_shaper", {
    template: 'wave_shaper',
    description: 'Waveshaper',
    _default: {
      f: 't',
      samples: 32768
    }
  }, function(data, subobjects) {
    if (!subobjects) return;
    var wrapped = subobjects[0];
    if (!wrapped) return;

    var f = function(t) { return t; };
    var samples = 32767;

    var ret = function(music) {
      return wrapped(music.wave_shaper({f: f, samples: samples}));
    };

    ret.update = function(data) {
      f = eval("(function(t) { return " + data.f + "; })");
      samples = data.samples;
      return this;
    };

    ret.update(data);

    return ret;    
  });

  m.type("bit_crushing", {
    reusableNode: true,
    template: "bit_crushing",
    description: "Bit crushing",
    _default: {
      bits: 4
  }}, function(data, subobjects){
    if (!subobjects) return;
    var wrapped = subobjects[0];
    if (!wrapped) return;

    var factor;

    var f = function(t) {
      return Math.floor(t * factor + 0.5) / factor;
    };

    var ret = function(music) {
      return wrapped(music.wave_shaper({
        f: f,
        samples: 32768
      }));
    };

    ret.update = function(data) {
      factor = Math.pow(2, data.bits-1);

      return this;
    };

    ret.update(data);

    return ret;
  });


  m.type("note_padding",
      {
          template: "generic_wrapper_editor", 
          parameters: [
            {name: "time", value: 0, tooltip: 'core.note_padding.tooltip.time'}
          ], 
          description: "core.note_padding.description"
      },  function(data, subobjects) {
        if (!subobjects) return;
        var wrapped = subobjects[0];
        if (!wrapped) return;
        var time;

        var eventPreprocessor = function(event) {
          var l = event[2];
          l = l - time * 1000;
          if (l <0 ) l = 0;

          return [event[0], event[1], l];
        };

        var ret = function(music) {
          var ret = wrapped(music);
          ret.eventPreprocessor = eventPreprocessor;
          return ret;
        };

        ret.update = function(data) {
          time = parseFloat(data.time);
          return this;
        };

        ret.update(data);

        return ret;
      });


  m.type("note_time_shift",
      {
          template: "generic_wrapper_editor", 
          parameters: [
            {name: "time", value: 0, tooltip: 'core.note_time_shift.tooltip.time'}
          ], 
          description: "core.note_time_shift.description"
      },  function(data, subobjects) {
        if (!subobjects) return;
        var wrapped = subobjects[0];
        if (!wrapped) return;
        var time;

        var eventPreprocessor = function(event) {
          var s = event[1];
          s = s + time * 1000;
          if (s < 0 ) s = 0;

          return [event[0], s, event[2]];
        };

        var ret = function(music) {
          var ret = wrapped(music);
          ret.eventPreprocessor = eventPreprocessor;
          return ret;
        };

        ret.update = function(data) {
          time = parseFloat(data.time);
          return this;
        };

        ret.update(data);

        return ret;
      });



  m.type("transpose",
      {
          template: "generic_wrapper_editor", 
          parameters: [
            {name: "amount", value: 0, tooltip: 'core.transpose.tooltip.amount'}
          ], 
          description: "core.transpose.description"

      },  function(data, subobjects) {
        if (!subobjects) return;
        var wrapped = subobjects[0];
        if (!wrapped) return;
        var tr, transposeFcn;
        var transposeFcn = function(n) { return n+tr };

        var ret = function(music) {
          var wr = wrapped(music);
          var x = Object.create(wr);

          var originalNote = wr.note.bind(wr);
          x.note = function(n) {
            return originalNote(n+tr);
          };

          return x;

        };

        ret.update = function(data) {
          tr = parseInt(data.amount);

          return this;
        };

        ret.update(data);

        return ret;
      });

  var defaultModWrapper = function(x){return x;};
  var genericType = function(name, options, components){
    var fcn = options.fcn ||name;
    m.type(name, 
        {
          template: "generic_wrapper_editor", 
          parameters: options.parameters, 
          components: options.components||[],
          description: options.description
        },  function(data, subobjects, components) {

          if (!subobjects) return;
          var wrapped = subobjects[0];
          if (!wrapped) return;

          var nodes = [];
          var getOpt;

          var ret = function(music, options) {
            options = options ||{};

            var modulatorInstruments = {}

            var node = music[fcn].apply(music, [getOpt(modulatorInstruments)]);
            nodes.push(node)
            
            var inner = wrapped(node, options);
            return new MUSIC.MultiInstrument(function() {
              var instrumentArray = [inner];
              for (var k in modulatorInstruments) {
                instrumentArray.push(modulatorInstruments[k]);
              }

              return instrumentArray;
            });
          };


          ret.update = function(data, components) {
            if(options.singleParameter) {
              getOpt = function(modulatorInstruments) {
                var opt;
                var parameter = options.parameters[0];

                var modulator = components[parameter.name];
                if (modulator) {
                  opt = MUSIC.modulator(function(pl) {
                    var inst = modulator(pl, {nowrap: true});
                    if (modulatorInstruments) modulatorInstruments._main = inst;
                    return inst;
                  });
                } else {
                  opt = data[parameter.name] ? parseFloat(data[parameter.name]) : (parameter.default || 0.0);
                }

                return opt;
              };

            } else {
              getOpt = function(modulatorInstruments) {
                var opt = {};
                options.parameters.forEach(function(parameter) {
                  var modulator = components[parameter.name];
                  if (modulator) {
                    opt[parameter.name] = MUSIC.modulator(function(pl) {
                      var inst = modulator(pl, {nowrap: true});
                      if (modulatorInstruments) modulatorInstruments[parameter.name] = inst;
                      return inst;
                    });
                  } else {
                    opt[parameter.name] = data[parameter.name] ? parseFloat(data[parameter.name]) : (parameter.default || 0.0);
                  }
                });

                return opt;
              }
            }

            if (nodes.length > 0) {
              var opt = getOpt();
              nodes.forEach(function(node) {
                node.update(opt)
              });
            }

            return this;
          };

          ret.update(data, components);

          return ret;
    });
  };

  var scaleConfig = {
    parameters: [
      {name: 'base', value: -1, tooltip: 'core.signal_scale.tooltip.base'},
      {name: 'top', value: 1, tooltip: 'core.signal_scale.tooltip.top'},
    ],
    description: "core.signal_scale.description",
    fcn: 'signal_scale'
  };

  genericType("signal_scale", scaleConfig);
  genericType("scale", scaleConfig);

  genericType("signal_not",
  {
    parameters: [],
    description: "core.signal_not.description"
  });

  genericType("signal_or",
      {
        parameters: [
          {name: "second_signal", value: 1.0, hidden: true}
        ], 
        components: ["second_signal"],
        singleParameter: true,
        description: "core.signal_or.description"
      });  

  genericType("signal_nor",
      {
        parameters: [
          {name: "second_signal", value: 1.0, hidden: true}
        ], 
        components: ["second_signal"],
        singleParameter: true,
        description: "core.signal_nor.description"
      });  

  genericType("signal_and",
      {
        parameters: [
          {name: "second_signal", value: 1.0, hidden: true}
        ], 
        components: ["second_signal"],
        singleParameter: true,
        description: "core.signal_and.description"
      });

  genericType("signal_nand",
      {
        parameters: [
          {name: "second_signal", value: 1.0, hidden: true}
        ], 
        components: ["second_signal"],
        singleParameter: true,
        description: "core.signal_nand.description"
      });

  genericType("gain", 
      {
        parameters: [
          {name: "gain", value: 0.8, tooltip: 'core.gain.tooltip.gain'}
        ], 
        components: ["gain"],
        singleParameter: true,
        description: "core.signal_gain.description"
      });

  genericType("delay", 
      {
        parameters: [
          {name: "delay", value: 0.2, tooltip: 'core.delay.tooltip.delay'}
        ], 
        components: ["delay"],
        singleParameter: true,
        description: "core.delay.description"
      });  

  genericType("echo", 
      {
        parameters: [
          {name: "gain", value: 0.6, tooltip: 'core.echo.tooltip.gain'},
          {name: "delay", value: 0.1, tooltip: 'core.echo.tooltip.delay'}
        ], 
        description: "core.echo.description"
      });

  ["lowpass", "highpass", "bandpass", "lowshelf", "highshelf", "peaking", "notch", "allpass"].forEach(function(filterName) {
    genericType(filterName, 
        {
          parameters: [
            {name: "frequency", value: 350, tooltip: 'core.filter.tooltip.cut'},
            {name: "detune", value: 0, tooltip: 'core.filter.tooltip.detune'},
            {name: "Q", value: 1, tooltip: 'core.filter.tooltip.quality'}
          ],
          components: ["frequency", "detune", "Q"],
          description: filterName
        });

  });


  /*
    TIMBRE 
  */

  var genericTimbreType = function(name, options){
    m.type(name, 
        {
          template: "generic_timbre_editor", 
          parameters: options.parameters, 
          description: options.description
        },  function(data, subobjects) {
          if (!subobjects) return;
          var wrapped = subobjects[0];
          if (!wrapped) return;

          var opt = {};
          options.parameters.forEach(function(param) {
            opt[param.name] = parseFloat(data[param.name]);
          });

          var ret = function(music) {
            var tnode = music.T("reverb", opt);
            var i = wrapped(tnode);
            i.dispose = tnode.dispose.bind(tnode);
            return i;
          };

          return ret;
        });
  };

  genericTimbreType("reverb", {
    parameters: [
      {name: 'room', value: 0.35, tooltip: 'core.reverb.tooltip.room'},
      {name: 'damp', value: 0.1, tooltip: 'core.reverb.tooltip.damp'},
      {name: 'mix', value: 0.75, tooltip: 'core.reverb.tooltip.mix'}
    ],
    description: 'core.reverb.description'
  });




  /*

  NOISE

  */

  var playableType = function(name, method_name, options) {
    m.type(name, options, function(data, subobjects) {
      var ret = function(music) {
        var inst = {
          note: function() {
            return music[method_name].apply(music,[]);
          }
        };

        return new MUSIC.MonoNoteInstrument(inst);
      };

      ret.update = function(data){ return this; };
      return ret;
    });
  };

  playableType("noise", "noise", {
    template: "generic_wrapper_editor", 
    description: "core.noise.description"
  });

  playableType("pink noise", "pink_noise", {
    template: "generic_wrapper_editor", 
    description: "core.pink_noise.description"
  });

  playableType("red noise", "red_noise", {
    template: "generic_wrapper_editor", 
    description: "core.red_noise.description"
  });

  /*

  ARPEGGIATOR

  */

  m.type("arpeggiator", 
    {
      template: "arpeggiator", 
      description: "core.arpeggiator.description", _default: {
    scale: 0, interval: 2, duration: 100, gap: 0
  }}, function(data, subobjects) {
      if (!subobjects) return;
      var wrapped = subobjects[0];
      if (!wrapped) return;

      var scale;
      var duration, gap, interval, total, loop;
      var semitoneScale = {
        add: function(a, b) {
          return a + b;
        }
      };

      var ret = function(music) {
        var instrument = wrapped(music);

        var arpeggiator = {
          note: function(n) {
            var noteSeq = new MUSIC.NoteSequence();
            var box = duration + gap;

            if (total > 0) noteSeq.push([n, 0, duration]);
            if (total > 1) {
              for (var i=1;i<total-1;i++) {
                noteSeq.push([scale.add(n,i*interval), i*box, duration]);
              }

              noteSeq.push([scale.add(n,i*interval), i*box, loop ? duration : 60000]);
            }
            if (total > 0 && gap > 0 && loop) {
              noteSeq.padding(gap);
            }

            if (loop) {
              return noteSeq.makePlayable(instrument).loop();  
            } else {
              return noteSeq.makePlayable(instrument);
            }
            
          }
        };

        return arpeggiator;
      };

      ret.update = function(data){
        if (data.semitone) {
          scale = semitoneScale;
        } else {
          scale = MUSIC.Utils.Scale(data.scale);
        }
        duration = data.duration;
        gap = data.gap;
        interval = data.interval;
        total = data.total;
        loop = data.loop;

        return this;
      };

      ret.update(data);

      return ret;

  });

};
