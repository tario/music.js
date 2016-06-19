module.export = function(m) {
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

  m.type("multi_instrument", {template: "multi_instrument", description: "Multi Instrument", composition: true}, function(data, subobjects) {
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
  });

  var defaultModWrapper = function(x){return x;};
  m.type("oscillator", {template: "oscillator", description: "Oscillator", 
    components: ["detune"]}, function(data, subobjects, components) {
    if (!data) return;
      return function(music, options){
          var props = {
            type: data.oscillatorType ||"square",
            fixed_frequency: data.fixed_frequency && data.frequency,
            terms: data.terms
          };

          if (components && components.detune) {
            props.detune = MUSIC.modulator(function(pl) {
              return (options.modWrapper||defaultModWrapper)(components.detune)(pl, {nowrap: true}).note(0);
            });
          };
          var generator = music.oscillator(props);
          return new MUSIC.Instrument(generator);
      };
  });

  m.type("notesplit", {template: "notesplit", description: "Split effect stack by note", _default: {
    delay: 0.4
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
          {name: "time", value: 1},
          {name: "target", value: 1}
        ], 
        description: "Rise signal to target",
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
    return ret;
  });

  m.type("adsr", {template: "adsr", description: "ADSR Envelope signal", _default: {
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

  m.type("envelope", {template: "adsr", description: "ADSR", _default: {
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

    var ret = function(music){
        var note = function(n) {
            var baseNode = music.sfxBase();
            var gainNode = baseNode.gain(attackTime > 0 ? 0 : sustainLevel);
            var instance = wrapped(gainNode);
            gainNode.setParam('gain', startCurve);

            var ret = instance.note(n)
                      .onStop(function() {
                        baseNode.prune();
                      })
            if (releaseTime > 0) {
              ret = ret.stopDelay(releaseTime * 1000)
                      .onStop(function(){ 
                        var currentLevel = gainNode._destination.gain.value;
                        var releaseCurve = new MUSIC.Curve.Ramp(currentLevel, 0.0, samples).during(releaseTime)
                        gainNode.setParam('gain', releaseCurve); 
                      });
            }

            return ret;
        };
        return MUSIC.instrumentExtend({
          note: note
        });
    };

    ret.update = function(data) {
      samples = data.samples || 100;  
      attackTime = parseFloat(data.attackTime || 0.4);
      decayTime = parseFloat(data.decayTime || 0.4);
      sustainLevel = parseFloat(data.sustainLevel || 0.8);
      releaseTime = parseFloat(data.releaseTime || 0.4);

      attackCurve = new MUSIC.Curve.Ramp(0.0, 1.0, samples).during(attackTime);
      decayCurve = new MUSIC.Curve.Ramp(1.0, sustainLevel, samples).during(decayTime);
      startCurve = MUSIC.Curve.concat(attackCurve, attackTime, decayCurve, decayTime);

      return this;
    };

    ret.update(data);

    return ret;
  });


  m.type("transpose",
      {
          template: "generic_wrapper_editor", 
          parameters: [
            {name: "amount", value: 0}
          ], 
          description: "Transpose by N semitones"

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
      {name: 'base', value: -1},
      {name: 'top', value: 1},
    ],
    description: "Scale signal"
  });

  genericType("gain", 
      {
        parameters: [
          {name: "gain", value: 0.8}
        ], 
        components: ["gain"],
        singleParameter: true,
        description: "Increase or decrease the amp. of signal"
      });

  genericType("echo", 
      {
        parameters: [
          {name: "gain", value: 0.6},
          {name: "delay", value: 0.1}
        ], 
        description: "Single echo effect"
      });

  ["lowpass", "highpass", "bandpass", "lowshelf", "highshelf", "peaking", "notch", "allpass"].forEach(function(filterName) {
    genericType(filterName, 
        {
          parameters: [
            {name: "frequency", value: 350},
            {name: "detune", value: 0},
            {name: "Q", value: 1}
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
      {name: 'room', value: 0.35},
      {name: 'damp', value: 0.1},
      {name: 'mix', value: 0.75}
    ],
    description: "Reverb powered by timbre.js"
  });




  /*

  NOISE

  */
  m.type("noise", {
        template: "generic_wrapper_editor", 
        description: "White noise generator"
  }, function(data, subobjects) {
    var ret = function(music) {
      return {
        note: function() {
          return music.noise();
        }
      };
    };

    ret.update = function(data) {
    };
    return ret;
  });

};
