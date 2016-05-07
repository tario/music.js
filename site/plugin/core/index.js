module.export = function(m) {
  m.type("script_wrapper", {template: "script", description:"Script Wrapper"}, function(object, subobjects) {
    if (!object) return;

    var ret, inner;
    ret = function(music) {
      return inner(subobjects[0])(music);
    };

    ret.update = function(options) {
      try {
        inner = eval("("+object.code+")");
        if (typeof inner !== 'function') throw "Not a function";
      } catch (e) {
        console.error(e);
        inner = function(obj) {
          return obj;
        };
      }

      return this;
    };

    ret.update(object);
    return ret;
  });


  m.type("script", {template: "script", description: "Custom script"}, function(object){
    if (!object) return;
    return function(music) {
      var results;
      try {
        results = {object: eval("(function() {\n" + object.code + "\n})")()};
      } catch(e) {
        results = {error: e.toString()};
      }

      if (results.error) {
          object.codeError = results.error;
      } else {
          object.codeError = null;
      }
      return results.object;
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

  m.type("oscillator", {template: "oscillator", description: "Oscillator", 
    components: ["detune"]}, function(data, subobjects, components) {
    if (!data) return;
      return function(music){
          var props = {type: data.oscillatorType ||"square"};
          if (components && components.detune) {
            props.detune = MUSIC.modulator(function(pl) {
              return components.detune(pl, true).note(0);
            });
          };
          var generator = music.oscillator(props);
          return new MUSIC.Instrument(generator);
      };
  });

  m.type("notesplit", {template: "notesplit", description: "Split effect stack by note"}, function(data, subobjects) {
    if (!subobjects) return;
    var wrapped = subobjects[0];
    if (!wrapped) return;

    var delay;

    var ret = function(music){
        var note = function(n) {
            var baseNode = music.sfxBase();
            var instance = wrapped(baseNode, true);

            if (delay > 0) {
              return instance.note(n)
                        .onStop(function() {
                          baseNode.prune();
                        })
                        .stopDelay(delay*1000)
                        .onStop(function() {
                          if (instance.preStop) instance.preStop();
                        });
            } else {
              return instance.note(n)
                        .onStop(function() {
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


  m.type("adsr", {template: "adsr", description: "ADSR Envelope signal"},  function(data, subobjects) {
    var attackTime, decayTime, sustainLevel, m, b;

    var ret = function(music, x, stopped){
      return {
        note: function() {
          var itsover = false;
          var itsover2 = false;
          if (stopped) {
            stopped.then(function() {
              itsover = true;
            });
          }

          var tf;
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
                          return sustainLevel * (releaseTime-t) / releaseTime;
                        }
                      }

                      if (t>attackTime) {
                        if (t>attackTime+decayTime){
                          return sustainLevel;
                        } else {
                          return m*t+b;
                        }
                      } else {
                        return t/attackTime;
                      }

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

  m.type("envelope", {template: "adsr", description: "ADSR"},  function(data, subobjects) {
    if (!subobjects) return;
    var wrapped = subobjects[0];
    if (!wrapped) return;

    var samples, attackTime, decayTime, sustainLevel, releaseTime;
    var attackCurve, decayCurve, releaseCurve;

    var ret = function(music){
        var note = function(n) {
            var baseNode = music.sfxBase();
            var gainNode = baseNode.gain(sustainLevel);
            var instance = wrapped(gainNode);
            gainNode.setParam('gain', startCurve);

            return instance.note(n)
                      .onStop(function() {
                        baseNode.prune();
                      })
                      .stopDelay(releaseTime * 1000)
                      .onStop(function(){ 
                        var currentLevel = gainNode._destination.gain.value;
                        var releaseCurve = new MUSIC.Curve.Ramp(currentLevel, 0.0, samples).during(releaseTime)
                        gainNode.setParam('gain', releaseCurve); 
                      });
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

          var ret = function(music) {
            var stopped = Promise.defer();
            var node = music[fcn].apply(music, [getOpt(stopped.promise)]);
            nodes.push(node)
            var r = wrapped(node);
            r.preStop = function() {
              stopped.resolve();
            };

            return r;
          };


          ret.update = function(data, components) {
            if(options.singleParameter) {
              getOpt = function(stopped) {
                var opt;
                var parameter = options.parameters[0];

                var modulator = components[parameter.name];
                if (modulator) {
                  opt = MUSIC.modulator(function(pl) {
                    return modulator(pl, true, stopped).note(0);
                  });
                } else {
                  opt = data[parameter.name] ? parseFloat(data[parameter.name]) : (parameter.default || 0.0);
                }

                return opt;
              };

            } else {
              getOpt = function(stopped) {
                var opt = {};
                options.parameters.forEach(function(parameter) {
                  var modulator = components[parameter.name];
                  if (modulator) {
                    opt[parameter.name] = MUSIC.modulator(function(pl) {
                      return modulator(pl, true, stopped).note(0);
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
      {name: 'base', _default: -1},
      {name: 'top', _default: 1},
    ],
    description: "Scale signal"
  });

  genericType("gain", 
      {
        parameters: [
          {name: "gain"}
        ], 
        components: ["gain"],
        singleParameter: true,
        description: "Increase or decrease the amp. of signal"
      });

  genericType("echo", 
      {
        parameters: [
          {name: "gain"},
          {name: "delay"}
        ], 
        description: "Single echo effect"
      });

  ["lowpass", "highpass", "bandpass", "lowshelf", "highshelf", "peaking", "notch", "allpass"].forEach(function(filterName) {
    genericType(filterName, 
        {
          parameters: [
            {name: "frequency"}
          ],
          components: ["frequency"],
          description: filterName
        });

  });

};
