module.export = function(m) {

  m.lang("en", {
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
    notesplit: {
      stop_delay: 'Stop delay',
      tooltip: {
        stop_delay: 'Stop delay in seconds, this can be useful to avoid cutting envelope effects'
      }
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
    scale: {
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
    notesplit: {
      stop_delay: 'Demora al detenerse',
      tooltip: {
        stop_delay: 'Demora al detenerse en segundos, puede ser util para evitar cortar efectos de envolventes'
      }
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
    scale: {
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

      var music = (new MUSIC.AudioDestinationWrapper({audio: context_or_music}, destination)).sfxBase();
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

        return {
          note: function(n) {
            var wrappedContext = new DisposableAudioContextWrapper(context);
            var playable = instr.note(n, wrappedContext, destination);

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

  var defaultModWrapper = function(x){return x;};
  m.type("oscillator", {template: "oscillator", description: "Oscillator", 
    components: ["detune"]}, function(data, subobjects, components) {
    if (!data) return;
      return function(music, options){
          var props = {
            type: data.oscillatorType ||"square",
            fixed_frequency: data.fixed_frequency && data.frequency,
            terms: data.terms,
            time_constant: data.time_constant
          };

          if (components && components.detune) {
            props.detune = MUSIC.modulator(function(pl) {
              return (options.modWrapper||defaultModWrapper)(components.detune)(pl, {nowrap: true}).note(0);
            });
          };
          var generator = music.oscillator(props);
          return new MUSIC.MonoNoteInstrument(new MUSIC.Instrument(generator));
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
    };
    ret.update(data);

    return ret;
  });

  m.type("notesplit", {template: "notesplit", description: "Split effect stack by note", _default: {
    delay: 0.0
  }}, function(data, subobjects) {
    if (!subobjects) return;
    var wrapped = subobjects[0];
    if (!wrapped) return;

    var delay;

    var ret = function(music){
        var note = function(n) {
            var baseNode = music.sfxBase();
            var stopped = Promise.defer();
            var modWrapper = function(modulator) {
              return function(music, options) {
                return modulator(music, {nowrap: options.nowrap, stopped: stopped.promise});
              };
            };

            var instance = wrapped(baseNode, {modWrapper: modWrapper});

            if (delay > 0) {
              return instance.note(n)
                        .onStop(function() {
                          baseNode.prune();
                        })
                        .stopDelay(delay*1000)
                        .onStop(function() {
                          stopped.resolve();
                        });
            } else {
              return instance.note(n)
                        .onStop(function() {
                          stopped.resolve();
                          if (instance.dispose) instance.dispose();
                        });
            }
        };
        return MUSIC.instrumentExtend({
          note: note
        });
    };

    ret.update = function(data) {
      delay = data.delay||0;
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
    var ret = function(music) {
      return {
        note: function() {
          var formulaNode = music
                    .formulaGenerator(function(t) {
                      if (t < fallTime) {
                        return t*target/fallTime;
                      } else {
                        return target;
                      }
                    });
          return formulaNode;
        }
      };
    };

    ret.update = function(data) {
      fallTime = parseFloat(data.time);
      target = parseFloat(data.target);
    };
    ret.update(data);
    return ret;
  });

  m.type("adsr", {template: "adsr", description: "core.adsr.description", _default: {
    attackTime: 0.4,
    decayTime: 0.4,
    sustainLevel: 0.8,
    releaseTime: 0.4
  }},  function(data, subobjects) {
    var attackTime, decayTime, sustainLevel, m, b;

    var ret = function(music, options){
      options = options ||{};

      return {
        note: function() {
          var itsover = false;
          var itsover2 = false;
          if (options.stopped) {
            options.stopped.then(function() {
              itsover = true;
            });
          }

          var tf;
          var lastValue = sustainLevel;
          var formulaNode = music
                    .formulaGenerator(function(t) {
                      if (itsover) {
                        if (!itsover2) {
                          itsover2 = true;
                          tf = t;
                        }

                        t-=tf;

                        if(t>releaseTime) {
                          return 0;
                        } else {
                          return lastValue * (releaseTime-t) / releaseTime;
                        }
                      }

                      if (t>attackTime) {
                        if (t>attackTime+decayTime){
                          lastValue = sustainLevel;
                        } else {
                          lastValue = m*t+b;
                        }
                      } else {
                        if (attackTime == 0) {
                          lastValue = 1;
                        } else {
                          lastValue = t/attackTime;
                        }
                      }
                      return lastValue;

                    });

          return formulaNode;

        }
      };
    };

    ret.update = function(data) {
      attackTime = parseFloat(data.attackTime || 0.4);
      decayTime = parseFloat(data.decayTime || 0.4);
      sustainLevel = parseFloat(data.sustainLevel || 0.8);
      releaseTime = parseFloat(data.releaseTime || 0.4);

      // (attackTime, 1) -> (attackTime + decayTime, sustainLevel)
      m = (sustainLevel - 1)/decayTime;
      b = -m * attackTime + 1
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

  m.type("sample_rate_reduction", {template: "sample_rate_reduction", description: "Sample Rate Reduction", _default: {
    factor: 0.5
  }}, function(data, subobjects){
    if (!subobjects) return;
    var wrapped = subobjects[0];
    if (!wrapped) return;

    var factor = 0.5;
    var ret = function(music) {
      var phaser = 0;
      var t0 = 0;
      var f = function(t) {
        phaser += factor;
        if (phaser >= 1.0) {
          phaser -= 1.0;
          t0 = t;
        }
        return t0;
      };

      return wrapped(addFormula(music, f));
    };

    ret.update = function(data) {
      factor = data.factor;
      if (factor < 1/64) factor=1/64;
    };

    ret.update(data);

    return ret;
  });

  m.type("bit_crushing", {template: "bit_crushing", description: "Bit crushing", _default: {
    bits: 4
  }}, function(data, subobjects){
    if (!subobjects) return;
    var wrapped = subobjects[0];
    if (!wrapped) return;

    var factor;

    var f = function(t) {
      return Math.round(t * factor) / factor;
    };

    var ret = function(music) {
      return wrapped(addFormula(music,f));
    };

    ret.update = function(data) {
      factor = Math.pow(2, data.bits-1);
    };

    ret.update(data);

    return ret;
  });

  m.type("envelope", {template: "envelope", description: "ADSR", _default: {
    attackTime: 0.4,
    decayTime: 0.4,
    sustainLevel: 0.8,
    releaseTime: 0.4
  }},  function(data, subobjects) {
    if (!subobjects) return;
    var wrapped = subobjects[0];
    if (!wrapped) return;

    var samples, attackTime, decayTime, sustainLevel, releaseTime;
    var attackCurve, decayCurve, releaseCurve;
    var resetOnCut = false;


    var ret = function(music) {
      var baseNode = music.sfxBase();
      var gainNode = baseNode.gain(0);
      var inst = wrapped(gainNode);

      var noteCount = 0;
      var note = function(n) {
        var innerNote;
        var noteInst = inst.note(n);

        var play = function(){
          var playing = noteInst.play();
          var currentLevel = gainNode._destination.gain.value;

          if (noteCount === 0 || resetOnCut) {
            attackCurve = new MUSIC.Curve.Ramp(currentLevel, 1.0, samples).during(attackTime);
            startCurve = MUSIC.Curve.concat(attackCurve, attackTime, decayCurve, decayTime);
            gainNode.setParam('gain', startCurve);
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
            .stopDelay(releaseTime*1000)
            .onStop(function() {
                noteCount--;
                // don't release if noteCount > 0
                if (noteCount > 0) return;

                var currentLevel = gainNode._destination.gain.value;
                var releaseCurve = new MUSIC.Curve.Ramp(currentLevel, 0.0, samples).during(releaseTime)
                gainNode.setParam('gain', releaseCurve);
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
      samples = data.samples || 100;  
      attackTime = parseFloat(_def(data.attackTime, 0.4));
      decayTime = parseFloat(_def(data.decayTime,0.4));
      sustainLevel = parseFloat(_def(data.sustainLevel,0.8));
      releaseTime = parseFloat(_def(data.releaseTime,0.4));
      resetOnCut = data.reset_on_cut;

      decayCurve = new MUSIC.Curve.Ramp(1.0, sustainLevel, samples).during(decayTime);
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
          //return wrapped(music).mapNote(transposeFcn);
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

            var node = music[fcn].apply(music, [getOpt(options.modWrapper)]);
            nodes.push(node)
            return wrapped(node, options);
          };


          ret.update = function(data, components) {
            if(options.singleParameter) {
              getOpt = function(modWrapper) {
                modWrapper = modWrapper || defaultModWrapper;
                var opt;
                var parameter = options.parameters[0];

                var modulator = components[parameter.name];
                if (modulator) {
                  opt = MUSIC.modulator(function(pl) {
                    return modWrapper(modulator)(pl, {nowrap: true}).note(0);
                  });
                } else {
                  opt = data[parameter.name] ? parseFloat(data[parameter.name]) : (parameter.default || 0.0);
                }

                return opt;
              };

            } else {
              getOpt = function(modWrapper) {
                modWrapper = modWrapper || defaultModWrapper;
                var opt = {};
                options.parameters.forEach(function(parameter) {
                  var modulator = components[parameter.name];
                  if (modulator) {
                    opt[parameter.name] = MUSIC.modulator(function(pl) {
                      return modWrapper(modulator)(pl, true).note(0);
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

  genericType("scale",
  {
    parameters: [
      {name: 'base', value: -1, tooltip: 'core.scale.tooltip.base'},
      {name: 'top', value: 1, tooltip: 'core.scale.tooltip.top'},
    ],
    description: "core.scale.description"
  });

  genericType("gain", 
      {
        parameters: [
          {name: "gain", value: 0.8, tooltip: 'core.gain.tooltip.gain'}
        ], 
        components: ["gain"],
        singleParameter: true,
        description: "core.gain.description"
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
            return wrapped(music.T("reverb", opt));
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

      ret.update = function(data){};
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
      };

      ret.update(data);

      return ret;

  });

};
