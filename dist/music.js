;

(function () {
  var TypeConversor = function TypeConversor(typeName) {
    var conversorArray = [];

    this.add = function (conversor) {
      conversorArray.push(conversor);
    };

    this.cast = function (obj) {
      for (var i = 0; i < conversorArray.length; i++) {
        var conversor = conversorArray[i];
        var converted = conversor(obj);
        if (converted) return converted;
      }

      throw "Can't convert " + obj + " to " + typeName;
    };
  };

  var TypeCast = function TypeCast() {
    var typeConversors = {};

    this.register = function (typeName, conversor) {
      var typeConversor;

      if (!typeConversors[typeName]) {
        typeConversors[typeName] = new TypeConversor(typeName);
      }

      typeConversor = typeConversors[typeName];
      typeConversor.add(conversor);
    };

    this.cast = function (typeName, obj) {
      var typeConversor = typeConversors[typeName];
      if (!typeConversor) throw "unkown type " + typeName;
      return typeConversor.cast(obj);
    };
  };

  window.MUSIC = window.MUSIC || {};
  window.MUSIC.Types = new TypeCast();
})();
;

window.MUSIC = window.MUSIC || {};

(function () {
  MUSIC.SoundLib = MUSIC.SoundLib || {};
  MUSIC.Effects = MUSIC.Effects || {};

  MUSIC.playablePipeExtend = function (obj) {
    obj.during = function (_duration) {
      var original = this;
      return MUSIC.playablePipeExtend({
        play: function play() {
          var stopped = false;
          var playable = original.play();
          var wrapper = {
            stop: function stop() {
              if (!stopped) playable.stop();
              stopped = true;
            }
          };
          setTimeout(wrapper.stop, _duration);
          return wrapper;
        },
        duration: function duration() {
          return _duration;
        }
      });
    };

    obj.stopDelay = function (delay) {
      var original = this;
      return MUSIC.playablePipeExtend({
        play: function play(param) {
          var playing = original.play(param);
          return {
            stop: function stop() {
              setTimeout(playing.stop.bind(playing), delay);
            }
          };
        }
      });
    };

    obj.onError = function (fcn) {
      var original = this;
      return MUSIC.playablePipeExtend({
        play: function play(param) {
          try {
            var playing = original.play(param);
            return {
              stop: function stop() {
                try {
                  playing.stop();
                } catch (e) {
                  console.error(e);
                  fcn(e);
                }
              }
            };
          } catch (e) {
            console.error(e);
            fcn(e);
            throw e;
          }
        }
      });
    };

    obj.onStop = function (fcn) {
      var original = this;
      return MUSIC.playablePipeExtend({
        play: function play(param) {
          var playing = original.play(param);
          return {
            stop: function stop() {
              playing.stop();
              fcn(param);
            }
          };
        }
      });
    };

    return obj;
  };

  MUSIC.Types.register("playable", function (playable) {
    if (playable.play) {
      return playable;
    }
  });
  MUSIC.Types.register("playable", function (fcn) {
    if (typeof fcn === "function") {
      return {
        play: fcn
      };
    }
  });

  MUSIC.EffectsPipeline = function (audio, audioDestination) {
    this._audio = audio;
    this._audioDestination = audioDestination;
  };

  var defaultWrapFcn = function defaultWrapFcn(obj) {
    return obj;
  };

  var compose = function compose(f, g) {
    return function (obj) {
      return g(f(obj));
    };
  };

  MUSIC.EffectsPipeline.prototype = {
    _wrapFcn: defaultWrapFcn,
    wrap: function wrap(f) {
      var ret = new MUSIC.DummyNode(this);

      if (this._wrapFcn !== defaultWrapFcn) {
        f = compose(f, this._wrapFcn);
      }

      ret._wrapFcn = function (obj) {
        var ret2 = f(obj);
        ret2._wrapFcn = ret._wrapFcn;
        return ret2;
      };

      return ret;
    },
    sfxBase: function sfxBase() {
      var objects = [];

      var dispose = function dispose(obj) {
        obj.dispose();
      };

      var sfxBaseWrapper = function sfxBaseWrapper(elem) {
        if (!elem.dispose) return elem;

        var removeElem = function removeElem(x) {
          return x != elem;
        };

        var originalDispose = elem.dispose;
        objects.push(elem);

        elem.dispose = function () {
          objects = objects.filter(removeElem);
          originalDispose.call(elem);
        };

        return elem;
      };

      var sfxPrune = function sfxPrune() {
        objects.forEach(dispose);
      };

      var ret = this.wrap(sfxBaseWrapper);
      var original = this;

      ret.getOriginal = function () {
        if (original.getOriginal) return original.getOriginal();
        return original;
      };

      ret.prune = sfxPrune;
      return ret;
    },
    constant: function constant(options) {
      return this._wrapFcn(new MUSIC.SoundLib.Constant(this._audio, this._audioDestination, options));
    },
    oscillator: function oscillator(options) {
      return this._wrapFcn(new MUSIC.SoundLib.Oscillator(this._audio, this._audioDestination, options));
    },
    soundfont: function soundfont(param) {
      return this._wrapFcn(new MUSIC.SoundfontInstrument(param, this._audio, this._audioDestination));
    },
    sound: function sound(path) {
      var audio = this._audio;
      var audioDestination = this._audioDestination;
      var request = new XMLHttpRequest();
      request.open("GET", path, true);
      request.responseType = "arraybuffer";
      var audioBuffer;

      request.onerror = function (err) {
        console.error(err);
      };

      request.onload = function (e) {
        audio.audio.decodeAudioData(request.response, function (buffer) {
          audioBuffer = buffer;
        });
      };

      request.send();
      return MUSIC.playablePipeExtend({
        play: function play() {
          var bufferSource = audio.audio.createBufferSource();
          bufferSource.buffer = audioBuffer;
          bufferSource.connect(audioDestination._destination);
          bufferSource.start(audio.audio.currentTime);
          return {
            stop: function stop() {
              bufferSource.stop();
              bufferSource.disconnect(audioDestination._destination);
            }
          };
        }
      });
    },
    formulaGenerator: function formulaGenerator(fcn) {
      return this._wrapFcn(new MUSIC.SoundLib.FormulaGenerator(this._audio, this._audioDestination, fcn));
    },
    signal_and: function signal_and(value) {
      return this.gain(value || 1);
    },
    signal_nand: function signal_nand(value) {
      return this.signal_not().signal_and(value || 1);
    },
    signal_or: function signal_or(value) {
      return this.signal_not().signal_nor(value || 0);
    },
    signal_nor: function signal_nor(value) {
      var negateModl = function negateModl(modl) {
        if (!modl.apply) return modl;
        return {
          apply: function apply(currentTime, audioParam, music) {
            return modl.apply(currentTime, audioParam, music, function (modulatorFactory, f) {
              return f(modulatorFactory.signal_not());
            });
          }
        };
      };

      var andNode = this.signal_and(1);

      var update = function update(value) {
        andNode.update(negateModl(value));
      };

      update(value);
      var ret = andNode.signal_not();
      ret.update = update;
      return ret;
    },
    signal_not: function signal_not() {
      return this.signal_scale({
        top: 0,
        base: 2
      });
    },
    signal_scale: function signal_scale(options) {
      var gain = this.gain(1.0);
      var c1 = this.constant(0.0);
      var gainUpdate = gain.update.bind(gain);
      var gainDispose = gain.dispose.bind(gain);
      var constantUpdate = c1.update.bind(c1);
      var constantDispose = c1.dispose.bind(c1);

      var dispose = function dispose() {
        gainDispose();
        constantDispose();
      };

      var update = function update(options) {
        var a, b;
        a = (options.top - options.base) / 2;
        b = options.base + a;
        gainUpdate(a);
        constantUpdate(b);
      };

      update(options);
      gain.update = update;
      gain.dispose = dispose;
      return gain;
    },
    T: function T() {
      return this._wrapFcn(new MUSIC.T(arguments, this._audio, this._audioDestination));
    },
    noise: function noise() {
      return this._wrapFcn(new MUSIC.SoundLib.Noise(this._audio, this._audioDestination));
    },
    pink_noise: function pink_noise() {
      return this._wrapFcn(new MUSIC.SoundLib.PinkNoise(this._audio, this._audioDestination));
    },
    red_noise: function red_noise() {
      return this._wrapFcn(new MUSIC.SoundLib.RedNoise(this._audio, this._audioDestination));
    }
  };

  MUSIC.DummyNode = function (music) {
    MUSIC.EffectsPipeline.apply(this, [music._audio, music._audioDestination]);
  };

  MUSIC.DummyNode.prototype = Object.create(MUSIC.EffectsPipeline.prototype);

  MUSIC.T = function (args, music, audioDestination) {
    var api = T("WebAudioAPI:recv", music.audio
    /* audioContext */
    );
    var context = api.context;
    var gainNode = context.createGain(1.0);
    api.recv(gainNode);
    setTimeout(function () {
      // this hack prevents a bug in current version of chrome
      gainNode.connect(audioDestination._destination);
    });
    var Targuments = [];

    for (var i = 0; i < args.length; i++) {
      Targuments.push(args[i]);
    }

    ;
    Targuments.push(api);
    var synth = T.apply(null, Targuments); // ("reverb", {room:0.95, damp:0.1, mix:0.75}, api);

    var send = T("WebAudioAPI:send", synth, music.audio
    /* audioContext */
    ).send(audioDestination._destination);

    this.output = function () {
      return gainNode;
    };

    var disconnected = false;

    this.disconnect = function () {
      if (disconnected) return;
      disconnected = true;
      gainNode.disconnect(audioDestination._destination);
      send.removeAll();
      api.cancel();
      send.cancel();
      synth.unlisten();
    };

    this.dispose = this.disconnect;
    this._destination = gainNode;

    this.next = function () {
      return audioDestination;
    };

    MUSIC.EffectsPipeline.bind(this)(music, this);
  };

  MUSIC.T.prototype = Object.create(MUSIC.EffectsPipeline.prototype);

  MUSIC.Effects.register = function (effectName, fcn) {
    MUSIC.EffectsPipeline.prototype[effectName] = function (value) {
      return this._wrapFcn(fcn(this._audio, this._audioDestination, value));
    };
  };

  var audioContext = new (window.AudioContext || window.webkitAudioContext)();

  MUSIC.Context = function (options) {
    var audio = audioContext;
    var music = this;
    var gainNode = audio.createGain();
    options = options || {};
    gainNode.gain.value = 1.0;
    if (!options.nooutput) gainNode.connect(audio.destination);
    music.audio = audio;
    music._destination = gainNode;

    this.resume = function () {
      if (audioContext.state !== 'running') {
        audioContext.resume();
      }
    };

    this.record = function (options, callback) {
      var recorder = new WebAudioRecorder(gainNode, {
        workerDir: "src/lib/recorder/worker/",
        encoding: options.encoding,
        numChannels: options.numChannels
      });

      recorder.onComplete = function (recorder, blob) {
        callback(blob);
      };

      recorder.startRecording(); //recorder.record();

      return {
        stop: function stop() {
          recorder.finishRecording();
        }
      };
    };

    this.audio = audio;
    MUSIC.EffectsPipeline.bind(this)(music, this);
  };

  MUSIC.Context.prototype = new MUSIC.EffectsPipeline();

  MUSIC.SoundLib.FormulaGenerator = function (audio, nextProvider, fcn) {
    this.play = function (param) {
      var audioDestination;
      var formulaGenerator = new MUSIC.Effects.Formula(audio, nextProvider, function (input, t) {
        return fcn(t);
      });
      return {
        stop: function stop() {
          formulaGenerator.disconnect(nextProvider._destination);
        }
      };
    };

    MUSIC.playablePipeExtend(this);
  };

  MUSIC.SoundLib.PinkNoise = function (audio, nextProvider) {
    this.play = function (param) {
      var audioDestination;
      var b0, b1, b2, b3, b4, b5, b6;
      b0 = b1 = b2 = b3 = b4 = b5 = b6 = 0.0;
      var noiseGenerator = new MUSIC.Effects.Formula(audio, nextProvider, function () {
        var white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        var ret = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
        b6 = white * 0.115926;
        return ret * 0.11;
      });
      return {
        stop: function stop() {
          noiseGenerator.disconnect(nextProvider._destination);
        }
      };
    };

    this.setValue = function () {};

    MUSIC.playablePipeExtend(this);
  };

  MUSIC.SoundLib.RedNoise = function (audio, nextProvider) {
    this.play = function (param) {
      var audioDestination;
      var lastOut = 0.0;
      var noiseGenerator = new MUSIC.Effects.Formula(audio, nextProvider, function () {
        var white = Math.random() * 2 - 1;
        var ret = (lastOut + 0.02 * white) / 1.02;
        lastOut = ret;
        return ret * 3.5;
      });
      return {
        stop: function stop() {
          noiseGenerator.disconnect(nextProvider._destination);
        }
      };
    };

    this.setValue = function () {};

    MUSIC.playablePipeExtend(this);
  };

  MUSIC.SoundLib.Noise = function (audio, nextProvider) {
    var audioContext = audio.audio;
    var bufferSize = 2 * audioContext.sampleRate,
        noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate),
        output = noiseBuffer.getChannelData(0);

    for (var i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    this.play = function (param) {
      var whiteNoise = audioContext.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;
      whiteNoise.start(0);
      whiteNoise.connect(nextProvider._destination);
      return {
        stop: function stop() {
          whiteNoise.stop();
          whiteNoise.disconnect(nextProvider._destination);
        }
      };
    };

    this.setValue = function () {};

    MUSIC.playablePipeExtend(this);
  };

  MUSIC.SoundLib.Wave = function (path, period) {
    var music = new MUSIC.Context({
      nooutput: true
    });
    var sound = music.sound(path);
    var sampleCount = Math.floor(period * music.audio.sampleRate / 1000);
    var dataArray = []; // fix race condition using callbacks

    setTimeout(function () {
      var recording = music.record();
      sound.play();
      setTimeout(function () {
        recording.stop();
        recording.getBuffer(function (data) {
          var originalDataArray = data[0];

          for (var i = 0; i < sampleCount; i++) {
            dataArray.push(originalDataArray[i]);
          }
        });
      }, period + 100);
    }, 500);

    this.f = function (t) {
      if (t < 0) return 0;
      var value1 = dataArray[Math.floor(t * sampleCount)];
      return value1;
    };
  };

  MUSIC.AudioDestinationWrapper = function (music, audioDestination) {
    this._destination = audioDestination;
    MUSIC.EffectsPipeline.bind(this)(music, this);
  };

  MUSIC.AudioDestinationWrapper.prototype = Object.create(MUSIC.EffectsPipeline.prototype);

  MUSIC.modulator = function (f) {
    var _f = function _f(modulatorFactory, f) {
      return f(modulatorFactory);
    };

    return {
      apply: function apply(currentTime, audioParam, music, combineFunc) {
        var modulatorFactory, modulator;
        modulatorFactory = new MUSIC.AudioDestinationWrapper(music, audioParam).sfxBase();
        modulatorFactory.audioParamModulation = audioParam;
        modulator = (combineFunc || _f)(modulatorFactory, f);
        return {
          dispose: function dispose() {
            modulatorFactory.prune();
          }
        };
      }
    };
  };

  (function () {
    var len = 128;
    var constantArrayBuffer = new Float32Array(len);

    for (var i = 0; i < len; i++) {
      constantArrayBuffer[i] = 1;
    }

    ;
    var buffer1;

    MUSIC.SoundLib.Constant = function (music, destination, options) {
      var constantNode;
      var bufferSource;
      var buffer;
      var audioContext = music._audio.audio;

      if (audioContext.createConstantSource) {
        constantNode = audioContext.createConstantSource();
        this._destination = constantNode;
        constantNode.offset.value = options.offset || 0.0;
        constantNode.connect(destination._destination);
        constantNode.start();
      } else {
        constantNode = audioContext.createGain();
        bufferSource = audioContext.createBufferSource();
        constantNode.gain.value = options.offset || 0.0;

        if (!buffer1) {
          buffer1 = audioContext.createBuffer(1, constantArrayBuffer.length, music._audio.audio.sampleRate);
          buffer1.getChannelData(0).set(constantArrayBuffer);
        }

        bufferSource.loop = true;
        bufferSource.buffer = buffer1;
        bufferSource.connect(constantNode);
        constantNode.connect(destination._destination);
        bufferSource.start();
      }

      var noop = function noop() {};

      this.setParam = function (paramName, value) {
        if (paramName === 'offset' && !audioContext.createConstantSource) paramName = 'gain';
        value.apply(music.audio.currentTime, constantNode[paramName]);
      };

      this.setParamTarget = function (paramName, target, timeConstant) {
        if (paramName === 'offset' && !audioContext.createConstantSource) paramName = 'gain';
        var audioParam = constantNode[paramName];
        audioParam.cancelScheduledValues(0.0);
        audioParam.setTargetAtTime(target, music.audio.currentTime, timeConstant);
      };

      this.dispose = function () {
        if (audioContext.createConstantSource) {
          constantNode.stop();
        } else {
          bufferSource.stop();
          bufferSource.disconnect(constantNode);
        }

        constantNode.disconnect(destination._destination);

        this.dispose = function () {};
      };

      this.update = function (value) {
        if (audioContext.createConstantSource) {
          constantNode.offset.value = value;
        } else {
          constantNode.gain.value = value;
        }
      };

      this.freq = function (newFreq) {
        var playable = {};
        playable.setFreq = noop;
        playable.reset = noop;

        playable.play = function () {
          return {
            stop: noop
          };
        };

        MUSIC.playablePipeExtend(playable);
        return playable;
      };
    };
  })();

  MUSIC.SoundLib.Oscillator = function (music, destination, options) {
    options = options || {};
    var effects = options.effects;
    var detune = options.detune;
    var frequency = options.frequency;
    var time_constant = options.time_constant;
    var audioDestination;
    audioDestination = destination._destination;
    if (!isFinite(time_constant) || isNaN(time_constant) || time_constant <= 0) time_constant = 0.01;
    var osc;
    osc = music.audio.createOscillator();
    osc.connect(audioDestination);
    var appliedAudioParam;

    if (frequency) {
      osc.frequency.value = frequency;
    }

    if (detune) {
      if (detune.apply) {
        appliedAudioParam = detune.apply(music.audio.currentTime, osc.detune, music);
      } else {
        osc.detune.value = detune;
      }
    }

    if (options.type === "custom") {
      var real = new Float32Array(options.terms.sin || []);
      var imag = new Float32Array(options.terms.cos || []);
      var periodicWave = music.audio.createPeriodicWave(real, imag);
      osc.setPeriodicWave(periodicWave);
    } else {
      osc.type = options.type;
    }

    this.currentTime = function () {
      return music.audio.currentTime;
    };

    this.schedule_freq = function (newFreq, start) {
      var tc;
      tc = time_constant || 0.1;

      var stop = function stop() {};

      var play = function play() {
        osc.frequency.setTargetAtTime(newFreq, start, tc);
        return {
          stop: stop
        };
      };

      return {
        play: play
      };
    };

    this.freq = function (newFreq) {
      var frequency = options.fixed_frequency ? options.fixed_frequency : newFreq;

      if (frequency) {
        osc.frequency.value = frequency;
      }

      var playable = {};

      playable.setFreq = function (frequency, noteOptions) {
        playable.setFreqOnTime(frequency, noteOptions, music.audio.currentTime);
      };

      playable.cancelScheduledValues = function () {
        osc.frequency.cancelScheduledValues(0.0);
      };

      playable.setFreqOnTime = function (frequency, noteOptions, start) {
        if (options.fixed_frequency) return;
        var tc;

        if (noteOptions && noteOptions.tc) {
          tc = noteOptions.tc;
        } else {
          tc = time_constant || 0.1;
        }

        osc.frequency.setTargetAtTime(frequency, start, tc);
      };

      playable.reset = function () {};

      playable.play = function (param) {
        var nextNode;
        var disposeNode;

        disposeNode = function disposeNode() {
          if (osc) osc.disconnect(audioDestination);
          osc = null;
        };

        osc.start(0);
        return {
          stop: function stop() {
            if (appliedAudioParam && appliedAudioParam.dispose) {
              appliedAudioParam.dispose();
            }

            if (osc) osc.stop(0);
            disposeNode();
          }
        };
      };

      MUSIC.playablePipeExtend(playable);
      return playable;
    };

    if (options.f) {
      this.play = function (param) {
        var wtPosition = options.wtPosition || 0;
        var fcn = options.f;
        var ta = 0;
        var frequency;
        var optionsFrequency = options.frequency;

        if (optionsFrequency.at) {
          frequency = optionsFrequency.at.bind(optionsFrequency);
        } else {
          frequency = function frequency(t) {
            return optionsFrequency;
          };
        }

        var deltatime = 0;
        var lastTime = 0;
        var tb;

        if (wtPosition.at) {
          var formulaGenerator = new MUSIC.Effects.Formula(music, destination, function (input, t) {
            deltatime = t - lastTime;
            ta += deltatime * frequency(t);
            ta = ta % 1;
            tb = ta + wtPosition.at(t);
            tb = tb % 1;
            if (tb < 0) tb++;
            lastTime = t;
            return fcn(tb);
          });
        } else {
          var formulaGenerator = new MUSIC.Effects.Formula(music, destination, function (input, t) {
            deltatime = t - lastTime;
            ta += deltatime * frequency(t);
            ta = ta % 1;
            tb = ta + wtPosition;
            tb = tb % 1;
            if (tb < 0) tb++;
            lastTime = t;
            return fcn(tb);
          });
        }

        return {
          stop: function stop() {
            formulaGenerator.disconnect(destination._destination);
          }
        };
      };
    } else if (options.wave) {
      var newOptions = Object.create(options);
      newOptions.f = options.wave.f;
      MUSIC.SoundLib.Oscillator.bind(this)(music, destination, newOptions);
    } else {}
  };

  MUSIC.Loop = function (playable, times) {
    var original = playable;
    var duration = playable.duration();
    return {
      play: function play() {
        var lastPlay;
        var startTime = window.performance.now();
        var lastTime = startTime;
        var currentIteration = 0;
        lastPlay = playable.play();

        var nextIteration = function nextIteration() {
          var now = window.performance.now();

          if (now - startTime > currentIteration * duration) {
            // ms
            setTimeout(function () {
              lastPlay = playable.play();
            }, (currentIteration + 1) * duration - now);
            currentIteration++;

            if (currentIteration == times - 1) {
              clearInterval(inter);
            }
          }
        };

        var inter = setInterval(nextIteration, duration);
        return {
          stop: function stop() {
            clearInterval(inter);
            if (lastPlay) lastPlay.stop();
          }
        };
      }
    };
  };

  MUSIC.Silence = function (time) {
    return {
      play: function play() {
        return {
          stop: function stop() {}
        };
      },
      duration: function duration() {
        return time;
      }
    };
  };
})();
;

MUSIC.Effects = MUSIC.Effects || {};
var effectsObject = {};

MUSIC.Effects.forEach = function (cb) {
  for (var sfx in effectsObject) {
    cb(sfx, effectsObject[sfx]);
  }
};

MUSIC.Effects.WebAudioNodeWrapper = function (music, audioNode, next, onDispose) {
  this._destination = audioNode;
  setTimeout(function () {
    // this hack prevents a bug in current version of chrome
    audioNode.connect(next._destination);
  });

  this.next = function () {
    return next;
  };

  var disconnected = false;

  this.disconnect = function () {
    if (disconnected) return;
    if (onDispose) onDispose();
    disconnected = true;
    audioNode.disconnect(next._destination);
  };

  this.dispose = this.disconnect;

  this.output = function () {
    return audioNode;
  };

  this.currentTime = function () {
    return music.audio.currentTime;
  };

  this.setParam = function (paramName, value) {
    value.apply(music.audio.currentTime, audioNode[paramName]);
  };

  this.setParamTarget = function (paramName, target, timeConstant) {
    var audioParam = audioNode[paramName];
    audioParam.cancelScheduledValues(0.0);
    audioParam.setTargetAtTime(target, music.audio.currentTime, timeConstant);
  };

  this.record = function () {
    var rec = new Recorder(audioNode, {
      workerPath: "lib/recorder/recorderWorker.js"
    });
    rec.record();
    return rec;
  };

  MUSIC.EffectsPipeline.bind(this)(music, this);
};

MUSIC.Effects.WebAudioNodeWrapper.prototype = Object.create(MUSIC.EffectsPipeline.prototype);

MUSIC.Effects.Formula = function (music, next, fcn) {
  var scriptNode = music.audio.createScriptProcessor(1024, 1, 1);
  var iteration = 0;
  var sampleRate = music.audio.sampleRate;

  scriptNode.onaudioprocess = function (audioProcessingEvent) {
    // The input buffer is the song we loaded earlier
    var inputBuffer = audioProcessingEvent.inputBuffer; // The output buffer contains the samples that will be modified and played

    var outputBuffer = audioProcessingEvent.outputBuffer; // Loop through the output channels (in this case there is only one)

    for (var channel = 0; channel < outputBuffer.numberOfChannels; channel++) {
      var inputData = inputBuffer.getChannelData(channel);
      var outputData = outputBuffer.getChannelData(channel); // Loop through the 4096 samples

      for (var sample = 0; sample < inputBuffer.length; sample++) {
        // make output equal to the same as the input
        outputData[sample] = fcn(inputData[sample], (inputBuffer.length * iteration + sample) / sampleRate);
      }
    }

    iteration++;
  };

  setTimeout(function () {
    // this hack prevents a bug in current version of chrome
    scriptNode.connect(next._destination);
  });
  this._destination = scriptNode;
  MUSIC.EffectsPipeline.bind(this)(music, this);

  this.next = function () {
    return next;
  };

  var disconnected = false;

  this.disconnect = function () {
    if (disconnected) return;
    disconnected = true;
    setTimeout(function () {
      // this hack prevents a bug in current version of chrome
      scriptNode.disconnect(next._destination);
    });
  };

  this.dispose = this.disconnect;

  this.update = function (_f) {
    fcn = _f;
    this.fcn = fcn;
  };

  this.fcn = fcn;

  this.output = function () {
    return scriptNode;
  };

  this.isFormula = true;
};

MUSIC.Effects.Formula.prototype = Object.create(MUSIC.EffectsPipeline.prototype);
MUSIC.Effects.register("formula", function (music, next, fcn) {
  return new MUSIC.Effects.Formula(music, next, fcn);
});

MUSIC.Effects.BiQuad = function (music, next, options) {
  var biquadFilter = music.audio.createBiquadFilter();
  var gainModulation = nodispose;
  var qModulation = nodispose;
  var frequencyModulation = nodispose;
  var detuneModulation = nodispose;
  var biquadType = options.type;

  this.update = function (options) {
    biquadFilter.type = biquadType;

    var assignParam = function assignParam(orig, audioParam) {
      if (orig) {
        if (orig.apply) {
          return orig.apply(music.audio.currentTime, audioParam, music);
        } else {
          audioParam.value = orig;
        }
      }

      return nodispose;
    };

    gainModulation.dispose();
    qModulation.dispose();
    frequencyModulation.dispose();
    detuneModulation.dispose();
    gainModulation = assignParam(options.gain, biquadFilter.gain);
    qModulation = assignParam(options.Q, biquadFilter.Q);
    frequencyModulation = assignParam(options.frequency, biquadFilter.frequency);
    detuneModulation = assignParam(options.detune, biquadFilter.detune);
  };

  this.update(options);
  MUSIC.Effects.WebAudioNodeWrapper.bind(this)(music, biquadFilter, next, function () {
    gainModulation.dispose();
    qModulation.dispose();
    frequencyModulation.dispose();
    detuneModulation.dispose();
  });
};

MUSIC.Effects.BiQuad.prototype = Object.create(MUSIC.Effects.WebAudioNodeWrapper.prototype);
MUSIC.Effects.register("biquad", MUSIC.Effects.BiQuad);
["lowpass", "highpass", "bandpass", "lowshelf", "highshelf", "peaking", "notch", "allpass"].forEach(function (filterName) {
  MUSIC.Effects.register(filterName, function (music, next, options) {
    return new MUSIC.Effects.BiQuad(music, next, {
      type: filterName,
      frequency: options.frequency,
      Q: options.Q,
      detune: options.detune
    });
  });
});

var canMutate = function canMutate(obj, updateFcn) {
  obj.update = function (value) {
    updateFcn(value);
    return obj;
  };

  return obj;
};

var nodispose = {
  dispose: function dispose() {}
};
MUSIC.Effects.register("gain", function (music, next, value) {
  var gainNode = music.audio.createGain();
  var volumeModulation = nodispose;
  return canMutate(new MUSIC.Effects.WebAudioNodeWrapper(music, gainNode, next, function () {
    volumeModulation.dispose();
  }), function (value) {
    volumeModulation.dispose();

    if (value.apply) {
      gainNode.gain.value = 0.0;
      volumeModulation = value.apply(music.audio.currentTime, gainNode.gain, music);
    } else {
      volumeModulation = nodispose;
      gainNode.gain.value = value;
    }
  }).update(value);
});
MUSIC.Effects.register("delay", function (music, next, value) {
  var delayNode = music.audio.createDelay(60);
  var delayModulation = nodispose;
  return canMutate(new MUSIC.Effects.WebAudioNodeWrapper(music, delayNode, next, function () {
    delayModulation.dispose();
  }), function (value) {
    delayModulation.dispose();

    if (value.apply) {
      delayModulation = value.apply(music.audio.currentTime, delayNode.delayTime, music);
    } else {
      delayModulation = nodispose;
      delayNode.delayTime.value = value;
    }
  }).update(value);
});

var Echo = function Echo(music, next, options) {
  this.update = function (options) {
    delayNode.delayTime.value = options.delay || 0.02;
    att.gain.value = options.gain === 0 ? 0 : options.gain || 0.2;
    if (delayNode.delayTime.value < 0.01) delayNode.delayTime.value = 0.01;
    if (delayNode.delayTime.value > 1) delayNode.delayTime.value = 1;
    if (att.gain.value > 0.99) att.gain.value = 0.99;
    if (att.gain.value < 0) att.gain.value = 0;
  };

  var delayNode = music.audio.createDelay(60);
  var gainNode = music.audio.createGain();
  var gainNode2 = music.audio.createGain();
  gainNode.gain.value = 1.0;
  gainNode2.gain.value = 1.0;
  var att = music.audio.createGain();
  this.update(options);
  setTimeout(function () {
    gainNode.connect(gainNode2);
    gainNode.connect(delayNode);
    delayNode.connect(att);
    gainNode2.connect(next._destination);
    gainNode2.connect(delayNode);
    att.connect(gainNode2);
  });
  this._destination = gainNode;

  this.next = function () {
    return next;
  };

  var disconnected = false;

  this.disconnect = function () {
    if (disconnected) return;
    disconnected = true;
    gainNode.disconnect(gainNode2);
    gainNode.disconnect(delayNode);
    delayNode.disconnect(att);
    gainNode2.disconnect(next._destination);
    gainNode2.disconnect(delayNode);
    att.disconnect(gainNode2);
  };

  this.dispose = this.disconnect;

  this.output = function () {
    return audioNode;
  };

  this.setParam = function (paramName, value) {
    value.apply(music.audio.currentTime, audioNode[paramName]);
  };

  MUSIC.EffectsPipeline.bind(this)(music, this);
};

Echo.prototype = Object.create(MUSIC.EffectsPipeline.prototype);

var WaveShaper = function WaveShaper(music, next, options) {
  options = options || {};
  var samples = options.samples || 8192;

  var f = options.f || function (t) {
    return t;
  };

  var makeDistortionCurve = function makeDistortionCurve() {
    var array = new Float32Array(samples);

    for (var i = 0; i < samples; i++) {
      array[i] = f(i * 2 / samples - 1);
    }

    return array;
  };

  this.next = function () {
    return next;
  };

  var waveShaperNode = music.audio.createWaveShaper();
  waveShaperNode.curve = makeDistortionCurve();
  waveShaperNode.oversample = '4x';
  setTimeout(function () {
    waveShaperNode.connect(next._destination);
  });
  this._destination = waveShaperNode;
  var disconnected = false;

  this.disconnect = function () {
    if (disconnected) return;
    disconnected = true;
    waveShaperNode.disconnect(next._destination);
  };

  MUSIC.EffectsPipeline.bind(this)(music, this);
};

WaveShaper.prototype = Object.create(MUSIC.EffectsPipeline.prototype);
MUSIC.Effects.register("echo", function (music, next, options) {
  return new Echo(music, next, options);
});
MUSIC.Effects.register("wave_shaper", function (music, next, options) {
  return new WaveShaper(music, next, options);
});

MUSIC.Curve = function (array) {
  this.during = during(array);
};

MUSIC.Curve.concat = function (c1, time1, c2, time2, n) {
  var time = time1 + time2;

  if (!n) {
    n = Math.floor(time * 100) + 1;
  }

  var at = function at(t) {
    if (t < time1) {
      return c1.at(t);
    } else {
      return c2.at(t - time1);
    }
  };

  var array = new Float32Array(n + 1);

  for (var i = 0; i < n + 1; i++) {
    array[i] = at(time * (i / n));
  }

  ;
  return {
    apply: function apply(currentTime, audioParam) {
      audioParam.cancelScheduledValues(0.0);
      audioParam.setValueCurveAtTime(array, currentTime, time);
    },
    at: at
  };
};

var during = function during(fcn, n) {
  return function (time) {
    if (!n) {
      n = Math.floor(time * 100) + 1;
    }

    var array = new Float32Array(n + 1);

    for (var i = 0; i < n + 1; i++) {
      array[i] = fcn(i / n);
    }

    ;
    return {
      apply: function apply(currentTime, audioParam) {
        audioParam.cancelScheduledValues(0.0);
        audioParam.setValueCurveAtTime(array, currentTime, time);
      },
      at: function at(t) {
        return fcn(t / time);
      }
    };
  };
};

MUSIC.Curve.Formula = function (fcn, n) {
  this.during = during(fcn, n);
};

MUSIC.Curve.Ramp = function (initValue, endValue, n) {
  MUSIC.Curve.Formula.bind(this)(function (t) {
    return initValue + (endValue - initValue) * t;
  }, n);
};

MUSIC.Curve.Periodic = function (fcn, frequency) {
  var ta = 0;
  var delayTime;
  var lastTime = 0;
  var deltatime;
  var tb;
  var period = 1.0 / frequency;

  if (frequency.at) {
    this.at = function (t) {
      deltatime = t - lastTime;
      ta += deltatime * frequency.at(t);
      ta = ta % 1;
      lastTime = t;
      return fcn(ta);
    };
  } else {
    this.at = function (t) {
      ta = t % period / period;
      if (ta < 0) ta++;
      return fcn(ta);
    };
  }
};

MUSIC.Effects.register("ADSR", function (music, next, options) {
  options = options || {};
  var samples = options.samples || 100;
  var attackTime = options.attackTime;
  var decayTime = options.decayTime;
  var sustainLevel = options.sustainLevel;
  var releaseTime = options.releaseTime;
  if (attackTime === undefined) attackTime = 0.1;
  if (decayTime === undefined) decayTime = 0.1;
  if (sustainLevel === undefined) sustainLevel = 0.8;
  if (releaseTime === undefined) releaseTime = 0.1;
  var nextNodeFcn = options.node;
  var attackCurve = new MUSIC.Curve.Ramp(0.0, 1.0, samples).during(attackTime);
  var decayCurve = new MUSIC.Curve.Ramp(1.0, sustainLevel, samples).during(decayTime);
  var startCurve = MUSIC.Curve.concat(attackCurve, attackTime, decayCurve, decayTime);
  var gainNode = next.gain(sustainLevel);
  gainNode.setParam('gain', startCurve);
  return nextNodeFcn(gainNode).onStop(function () {
    gainNode.dispose();
  }) // dispose gain node
  .stopDelay(releaseTime * 1000).onStop(function () {
    var currentLevel = gainNode._destination.gain.value;
    var releaseCurve = new MUSIC.Curve.Ramp(currentLevel, 0.0, samples).during(releaseTime);
    gainNode.setParam('gain', releaseCurve);
  }); // set gain curve
});
MUSIC.Effects.register("stopCurve", function (music, next, options) {
  options = options || {};
  var samples = options.samples || 100;
  var duration = options.duration || 0.4;
  var nextNodeFcn = options.node;
  var stopCurve = new MUSIC.Curve.Ramp(1.0, 0.0, samples).during(duration);
  var gainNode = next.gain(1.0);
  return nextNodeFcn(gainNode).onStop(function () {
    gainNode.dispose();
  }) // dispose gain node
  .stopDelay(duration * 1000).onStop(function () {
    gainNode.setParam('gain', stopCurve);
  }); // set gain curve
});
;

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

(function () {
  var frequency = function frequency(notenum) {
    return 16.35 * Math.pow(2, notenum / 12);
  };

  var noteToNumMap = {
    'C': 0,
    'D': 2,
    'E': 4,
    'F': 5,
    'G': 7,
    'A': 9,
    'B': 11
  };

  var instrumentExtend = function instrumentExtend(obj) {
    var delayedPlaying = function delayedPlaying(originalPlaying, ms) {
      return {
        stop: function stop() {
          setTimeout(originalPlaying.stop.bind(originalPlaying), ms);
        }
      };
    };

    var delayedNote = function delayedNote(originalNote, ms) {
      return {
        play: function play(param) {
          var originalPlaying = originalNote.play(param);
          return delayedPlaying(originalPlaying, ms);
        }
      };
    };

    obj.stopDelay = function (ms) {
      return instrumentExtend({
        note: function note(noteNum, options) {
          return delayedNote(obj.note(noteNum, options), ms);
        }
      });
    };

    obj.perNoteWrap = function (wrapper) {
      return instrumentExtend({
        note: function note(noteNum, options) {
          return wrapper(obj.note(noteNum, options));
        }
      });
    };

    obj.mapNote = function (fcn) {
      return instrumentExtend({
        note: function note(noteNum, options) {
          return obj.note(fcn(noteNum), options);
        }
      });
    };

    if (!obj.eventPreprocessor) {
      obj.eventPreprocessor = function (evt) {
        return evt;
      };
    }

    if (!obj.note) {
      obj.note = function (n, options) {
        return this.schedule_note(n, options, 0.0);
      };
    }

    return obj;
  };

  MUSIC.noteToNoteNum = function (noteName) {
    var notenum;
    notenum = noteToNumMap[noteName.charAt(0)];
    if (notenum === undefined) return undefined;
    if (noteName.charAt(1) === '#') notenum++;
    if (noteName.charAt(1) === 'b') notenum--;
    if (noteName.charAt(2) !== "") notenum += 12 * parseInt(noteName.charAt(2));
    return notenum;
  };

  MUSIC.PolyphonyInstrument = function (innerFactory, maxChannels) {
    var instrumentArray = [];
    var onUse = [];
    var queue = [];

    var freeIdx = function freeIdx(maxChannels) {
      for (var i = 0; i < maxChannels; i++) {
        if (!onUse[i]) return i;
      }

      return queue[0] || 0;
    };

    this.note = function (notenum, options) {
      var c = maxChannels();
      var playingIdx = freeIdx(c);
      var instrument = instrumentArray[playingIdx];

      if (!instrument) {
        instrument = innerFactory();
        instrumentArray[playingIdx] = instrument;
      }

      queue.push(playingIdx);
      if (queue.length > c) queue.shift();
      onUse[playingIdx] = true;
      return instrument.note(notenum, options).onStop(function () {
        onUse[playingIdx] = false;
      });
    };

    instrumentExtend(this);

    this.eventPreprocessor = function (event, events) {
      var instrument = instrumentArray[0];

      if (!instrument) {
        instrument = innerFactory();
        instrumentArray[0] = instrument;
      }

      return (instrument.eventPreprocessor || function (x) {
        return x;
      })(event, events);
    };
  };

  MUSIC.MonoNoteInstrument = function (inner) {
    var noteInst;
    var playingInst;
    var count = 0;

    this.note = function (notenum, options) {
      if (!noteInst) {
        noteInst = inner.note(notenum, options);
      }

      return MUSIC.playablePipeExtend({
        play: function play(param) {
          if (!playingInst) {
            playingInst = noteInst.play(param);
          }

          noteInst.setValue(notenum, options);
          count++;
          return {
            stop: function stop() {
              count--;
              if (noteInst.reset && count === 0) noteInst.reset();
            }
          };
        }
      });
    };

    this.currentTime = function () {
      return inner.currentTime();
    };

    this.schedule_note = function (notenum, options, start) {
      if (!noteInst) {
        noteInst = inner.note(notenum, options);
      }

      return MUSIC.playablePipeExtend({
        play: function play(param) {
          if (!playingInst) {
            playingInst = noteInst.play(param);
          }

          noteInst.setValueOnTime(notenum, options, start);
          return {
            stop: function stop() {
              noteInst.cancelScheduledValues();
            }
          };
        }
      });
    };

    this.dispose = function () {
      if (playingInst) {
        playingInst.stop();
      }

      if (inner.dispose) inner.dispose();
    };

    instrumentExtend(this);
  };

  MUSIC.Instrument = function (soundFactory) {
    if (soundFactory.schedule_freq) {
      this.currentTime = function () {
        return soundFactory.currentTime();
      };

      this.schedule_note = function (notenum, options, startTime, duration) {
        if (notenum === undefined) return undefined;
        var freq = frequency(notenum);
        return MUSIC.playablePipeExtend({
          play: function play(param) {
            var fr = soundFactory.schedule_freq(freq, startTime);
            var soundInstance = fr.play(param);
            return {
              stop: function stop() {
                soundInstance.stop();
              }
            };
          }
        });
      };
    }

    this.note = function (notenum) {
      if (notenum === undefined) return undefined;
      var freq = frequency(notenum);
      return MUSIC.playablePipeExtend({
        play: function play(param) {
          var fr = soundFactory.freq(freq);
          var soundInstance = fr.play(param);

          if (fr.setFreq) {
            this.setValue = function (n, options) {
              fr.setFreq(frequency(n), options);
            };

            this.reset = fr.reset.bind(fr);
          }

          if (fr.cancelScheduledValues) {
            this.cancelScheduledValues = fr.cancelScheduledValues.bind(fr);
          }

          if (fr.setFreqOnTime) {
            this.setValueOnTime = function (n, options, start) {
              fr.setFreqOnTime(frequency(n), options, start);
            };

            this.reset = fr.reset.bind(fr);
          }

          return {
            stop: function stop() {
              soundInstance.stop();
            }
          };
        }
      });
    };

    instrumentExtend(this);
  };

  MUSIC.instrumentExtend = instrumentExtend;
  MUSIC.Instrument.frequency = frequency;

  MUSIC.MultiInstrument = function (instrumentArray) {
    if (Array.isArray(instrumentArray)) return MUSIC.MultiInstrument.bind(this)(function () {
      return instrumentArray;
    });

    var notePlay = function notePlay(note) {
      return note.play();
    };

    var noteStop = function noteStop(note) {
      return note.stop();
    };

    var MultiNote = function MultiNote(noteArray) {
      this.play = function () {
        var notes = noteArray.map(notePlay);
        return {
          stop: function stop() {
            notes.forEach(noteStop);
          }
        };
      };
    };

    this.note = function (noteNum, options) {
      return MUSIC.playablePipeExtend(new MultiNote(instrumentArray().map(function (instrument) {
        return instrument.note(noteNum, options);
      })));
    };

    this.dispose = function () {
      instrumentArray().forEach(function (i) {
        if (i.dispose) i.dispose();
      });
    };

    if (instrumentArray().every(function (i) {
      return i.schedule_note;
    })) {
      this.currentTime = function () {
        var instrument = instrumentArray().filter(function (i) {
          return i.currentTime;
        })[0];
        if (!instrument) return 0;
        return instrument.currentTime();
      };

      this.schedule_note = function (noteNum, options, startTime, duration) {
        return MUSIC.playablePipeExtend(new MultiNote(instrumentArray().map(function (instrument) {
          return instrument.schedule_note(noteNum, options, startTime, duration);
        })));
      };
    }

    instrumentExtend(this);

    this.eventPreprocessor = function (event, events) {
      var array = instrumentArray();
      if (!array.length) return event;
      var processedEvents = array.map(function (instrument) {
        if (instrument.eventPreprocessor) {
          return instrument.eventPreprocessor(event, events);
        } else {
          return event;
        }
      });

      if (processedEvents.length === 1) {
        return processedEvents[0];
      } else {
        var n = 0,
            s = 0,
            l = 0;
        var options = {};

        for (var i = 0; i < processedEvents.length; i++) {
          var evt = processedEvents[i];
          n = n + evt[0];
          s = s + evt[1];
          l = l + evt[2];

          if (evt[3]) {
            for (var k in evt[3]) {
              options[k] = evt[3][k];
            }
          }
        }

        return [Math.floor(n / processedEvents.length), s / processedEvents.length, l / processedEvents.length, options];
      }
    };
  };

  var NOTES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

  var noteNumToNoteName = function noteNumToNoteName(noteNum) {
    var noteName = NOTES[noteNum % 12];
    var octaveNum = Math.floor(noteNum / 12 + 1);
    return noteName + octaveNum;
  };

  MUSIC.PatchInstrument = function (notes) {
    var noteNum;
    var sounds = [];

    for (var noteName in notes) {
      var playable = MUSIC.Types.cast("playable", notes[noteName]);
      noteNum = MUSIC.noteToNoteNum(noteName);
      sounds[noteNum] = playable;
    }

    ;

    this.note = function (noteNum) {
      var s = sounds[noteNum];
      if (!s) return s;
      return MUSIC.playablePipeExtend({
        play: s.play
      });
    };

    instrumentExtend(this);
  };

  MUSIC.SoundfontInstrument = function (sounds, audio, audioDestination) {
    var noteAudio = [];

    function _base64ToArrayBuffer(base64) {
      var binary_string = window.atob(base64);
      var len = binary_string.length;
      var bytes = new Uint8Array(len);

      for (var i = 0; i < len; i++) {
        var ascii = binary_string.charCodeAt(i);
        bytes[i] = ascii;
      }

      return bytes.buffer;
    }

    ;
    audio = audio.audio;

    for (var i = 0; i < 72; i++) {
      (function () {
        var index = i;
        var xmlhttp = new XMLHttpRequest();
        var noteName = noteNumToNoteName(i);
        var data = sounds[noteName];
        var encoded = data.split(",")[1];
        audio.decodeAudioData(_base64ToArrayBuffer(encoded), function (buffer) {
          noteAudio[index] = buffer;
        }, function (err) {
          console.error("error " + err + " loading " + index);
        });
      })();
    }

    ;

    this.note = function (notenum) {
      var source = audio.createBufferSource();
      return MUSIC.playablePipeExtend({
        play: function play() {
          var source = audio.createBufferSource();
          source.buffer = noteAudio[notenum];
          source.connect(audioDestination._destination);
          source.start(0);
          return {
            stop: function stop() {
              source.stop(0);
              source.disconnect(audioDestination._destination);
            }
          };
        }
      });
    };

    instrumentExtend(this);
  };

  MUSIC.Types.register("instrument", function (instrument) {
    if (instrument.note) return instrument;
  });
  MUSIC.Types.register("instrument", function (soundGenerator) {
    if (soundGenerator.freq) {
      return new MUSIC.Instrument(soundGenerator);
    }
  });
  MUSIC.Types.register("instrument", function (playable) {
    if (playable.play) {
      return {
        note: function note() {
          return playable;
        }
      };
    }
  });
  var nullPlay = {
    play: function play() {
      return {
        stop: function stop() {}
      };
    }
  };
  MUSIC.Types.register("instrument", function (fcn) {
    if (typeof fcn === "function") {
      return {
        note: function note(n) {
          return fcn(n) || nullPlay;
        }
      };
    }
  });
  MUSIC.Types.register("instrument", function (array) {
    if (array instanceof Array) {
      return new MUSIC.MultiInstrument(array);
    }
  });
  MUSIC.Types.register("instrument", function (plainObject) {
    if (_typeof(plainObject) === "object" && plainObject.constructor === Object) {
      return new MUSIC.PatchInstrument(plainObject);
    }
  });

  MUSIC.StopEvent = function () {
    return function (note) {
      return MUSIC.playablePipeExtend({
        play: function play() {
          var paramObject = {
            onplay: function onplay() {},
            onstop: function onstop() {}
          };
          var originalNote = note.play(paramObject);
          paramObject.onplay();
          return {
            stop: function stop() {
              paramObject.onstop();
              originalNote.stop();
            }
          };
        }
      });
    };
  };
})();
;

MUSIC.Effects = MUSIC.Effects || {};

var LemonadePlayable = function LemonadePlayable(music, destination, outputFcn, ops) {
  this._destination = destination;
  this._music = music;
  this._ops = ops;
  this._output = outputFcn;
};

LemonadePlayable.prototype.play = function () {
  var destination = this._destination;
  var ops = this._ops;
  var opsLength = ops.length;
  var signalArray = [];
  var phaseArray = [];

  for (var i = 0; i < opsLength; i++) {
    signalArray[i] = 0;
    phaseArray[i] = 0;
    ops[i].wave = MUSIC.Types.cast("function", ops[i].wave);
  }

  var lastT = 0;
  var outputFcn = this._output;
  var formulaGenerator = new MUSIC.Effects.Formula(this._music, destination, function (input, t) {
    var deltay = t - lastT;

    for (var i = 0; i < opsLength; i++) {
      lastT = t; // EULER

      phaseArray[i] = phaseArray[i] + deltay * ops[i].frequency.apply(null, signalArray);
      var phase = phaseArray[i] % 1;
      if (phase < 0) phase++;
      signalArray[i] = ops[i].wave(phase);
    }

    ;
    return outputFcn.apply(null, signalArray);
  });
  return {
    stop: function stop() {
      formulaGenerator.disconnect(destination._destination);
    }
  };
};

MUSIC.playablePipeExtend(LemonadePlayable.prototype);
MUSIC.Effects.register("lemonade", function (music, next, options) {
  return new LemonadePlayable(music, next._audioDestination, options.output, options.ops);
});
;

(function () {
  MUSIC.Math = MUSIC.Math || {};

  MUSIC.Math.bpmToSecondTick = function (options, bpm) {
    return 60000 / bpm / options.ticks_per_beat;
  };

  var makeEvaluableInverseFunctionFromParts = function makeEvaluableInverseFunctionFromParts(array) {
    array = array.map(function (part) {
      var f = makeEvaluableFunction(part.f);
      var inverse_f = makeEvaluableInverseFunction(part.f);
      return {
        init: f(part.init),
        end: f(part.end),
        f: inverse_f
      };
    });
    return function (y) {
      var part = array.find(function (p) {
        return y >= p.init && (!p.end || y <= p.end);
      });
      if (!part) return 0;
      return part.f(y);
    };
  };

  var makeEvaluableFunctionFromParts = function makeEvaluableFunctionFromParts(array) {
    array = array.map(function (part) {
      return {
        init: part.init,
        end: part.end,
        f: makeEvaluableFunction(part.f)
      };
    });
    return function (x) {
      var part = array.find(function (p) {
        return x >= p.init && (!p.end || x <= p.end);
      });
      if (!part) return 0;
      return part.f(x);
    };
  };

  var makeEvaluableInverseFunction = function makeEvaluableInverseFunction(array) {
    if (array.length == 2) {
      var b = array[1];
      var a = array[0];
      return function (y) {
        return (y - a) / b; // y = b*x + a  ;   y - a = b*x; (y - a) / b = x;
      };
    } else if (array.length == 3) {
      var a = array[2];
      var b = array[1];
      var c = array[0];

      if (a === 0) {
        return makeEvaluableInverseFunction([c, b]);
      } else {
        return function (y) {
          return 2 * (c - y) / (-b - Math.sqrt(b * b - 4 * a * (c - y)));
        };
      }
    }
  };

  var makeEvaluableFunction = function makeEvaluableFunction(array) {
    if (array.length == 2) {
      var b = array[1];
      var a = array[0];
      return function (x) {
        return b * x + a;
      };
    } else if (array.length == 3) {
      var a = array[2];
      var b = array[1];
      var c = array[0];
      return function (x) {
        return a * x * x + b * x + c;
      };
    }
  };

  var integrate = function integrate(array, lastPointValue) {
    var x = lastPointValue[0];
    var y = lastPointValue[1];

    if (array.length == 1) {
      var c = -array[0] * x + y;
      return [c, array[0]];
    } else if (array.length == 2) {
      var c = y - x * array[0] - x * x * array[1] / 2;
      return [c, array[0], array[1] / 2];
    }
  };

  MUSIC.Math.integrateBpmEvents = function (options) {
    var cutBpmEvent = function cutBpmEvent(bpmEvent1) {
      var l = bpmEvent1.l;
      options.bpm_events.forEach(function (bpmEvent2) {
        if (bpmEvent2 !== bpmEvent1 && bpmEvent2.s >= bpmEvent1.s) {
          if (bpmEvent2.s < bpmEvent1.s + l) {
            var cutL = bpmEvent2.s - bpmEvent1.s;
            if (cutL < l) l = cutL;
          }
        }
      });
      return {
        s: bpmEvent1.s,
        l: l,
        n: Math.max(bpmEvent1.n, 1)
      };
    };

    options.bpm_events = options.bpm_events.map(cutBpmEvent);
    var firstEventStart = options.bpm_events[0].s;
    var parts = [{
      init: 0,
      end: firstEventStart,
      f: [MUSIC.Math.bpmToSecondTick(options, options.bpm)]
    }];

    for (var i = 0; i < options.bpm_events.length; i++) {
      var bpm_event = options.bpm_events[i];
      var next_bpm_event = options.bpm_events[i + 1];
      var init_second_tick = MUSIC.Math.bpmToSecondTick(options, i == 0 ? options.bpm : options.bpm_events[i - 1].n);
      var end_second_tick = MUSIC.Math.bpmToSecondTick(options, bpm_event.n);
      var b = (end_second_tick - init_second_tick) / bpm_event.l;
      var a = init_second_tick - b * bpm_event.s; // f(bpm_event.s) =  init_second_tick
      // f(bpm_event.s + bpm_event.l) =  init_second_tick - b * bpm_event.s + b * (bpm_event.s + bpm_event.l)
      // f(bpm_event.s + bpm_event.l) =  init_second_tick + b * bpm_event.l
      // f(bpm_event.s + bpm_event.l) =  end_second_tick

      if (bpm_event.l === 0) {
        parts.push({
          init: bpm_event.s,
          end: next_bpm_event && next_bpm_event.s,
          f: [end_second_tick]
        });
      } else {
        parts.push({
          init: bpm_event.s,
          end: bpm_event.s + bpm_event.l,
          f: [a, b]
        });
        parts.push({
          init: bpm_event.s + bpm_event.l,
          end: next_bpm_event && next_bpm_event.s,
          f: [end_second_tick]
        });
      }
    }

    ;
    var integratedParts = [];
    var lastPointValue = [0, 0];

    for (var i = 0; i < parts.length; i++) {
      var part = parts[i];
      var integral = integrate(part.f, lastPointValue);
      integratedParts.push({
        init: part.init,
        end: part.end,
        f: integrate(part.f, lastPointValue)
      });
      lastPointValue = [part.end, makeEvaluableFunction(integral)(part.end)];
    }

    ;
    return integratedParts;
  };

  MUSIC.Math.ticksToTime = function (options) {
    if (options.start) {
      var time = MUSIC.Math.ticksToTime({
        bpm: options.bpm,
        ticks_per_beat: options.ticks_per_beat,
        bpm_events: options.bpm_events
      });
      var startTime = time(options.start);
      return function (ticks) {
        return time(ticks) - startTime;
      };
    }

    var bpm = options.bpm;
    var ticks_per_beat = options.ticks_per_beat;

    if (options.bpm_events && options.bpm_events.length) {
      var integral = MUSIC.Math.integrateBpmEvents(options);
      return makeEvaluableFunctionFromParts(integral);
    } else {
      var scale = 60000 / bpm / ticks_per_beat;
      return function (ticks) {
        return ticks * scale;
      };
    }
  };

  MUSIC.Math.timeToTicks = function (options) {
    if (options.start) {
      var ret = MUSIC.Math.timeToTicks({
        bpm: options.bpm,
        ticks_per_beat: options.ticks_per_beat,
        bpm_events: options.bpm_events
      });
      var time = MUSIC.Math.ticksToTime({
        bpm: options.bpm,
        ticks_per_beat: options.ticks_per_beat,
        bpm_events: options.bpm_events
      });
      var startTime = time(options.start);
      return function (time) {
        return ret(time + startTime);
      };
    }

    var bpm = options.bpm;
    var ticks_per_beat = options.ticks_per_beat;

    if (options.bpm_events && options.bpm_events.length) {
      var integral = MUSIC.Math.integrateBpmEvents(options);
      return makeEvaluableInverseFunctionFromParts(integral);
    } else {
      var inverseScale = ticks_per_beat * bpm / 60000;
      return function (time) {
        return time * inverseScale;
      };
    }
  };
})();
;

(function () {
  MUSIC.NoteSequence = function (funseq, options) {
    var clock;
    var songCtx = options && options.songCtx;

    if (!funseq) {
      clock = MUSIC.Utils.Clock(window.performance.now.bind(window.performance), setInterval, clearInterval, 500);
      funseq = MUSIC.Utils.FunctionSeq(clock, setTimeout, clearTimeout);
      funseq.push({
        t: 0,
        f: function f() {
          if (songCtx.referenceInstrument) {
            songCtx.sequenceStartTime = songCtx.referenceInstrument.currentTime();
          }
        },
        externalSchedule: true
      });
    }

    this._time = options && options.time;
    this._funseq = funseq;
    this._totalduration = 0;
    this._noteid = 0;
    this._contextList = [];
  };

  MUSIC.NoteSequence.Playable = function (noteseq, instrument, duration, contextList) {
    this._noteseq = noteseq;
    this._instrument = instrument;
    this._duration = duration;
    this._contextList = contextList || [];
  };

  MUSIC.NoteSequence.Playable.prototype.loop = function (times) {
    return MUSIC.Loop(this, times);
  };

  MUSIC.NoteSequence.Playable.prototype.duration = function () {
    return this._duration;
  };

  MUSIC.NoteSequence.Playable.prototype.play = function (options) {
    var context = MUSIC.NoteSequence.context(this._instrument, this._contextList);
    this._runningFunSeq = this._noteseq._funseq.start(context);
    return new MUSIC.NoteSequence.Playing(this._runningFunSeq, context);
  };

  MUSIC.NoteSequence.Playing = function (runningFunSeq, ctx) {
    this._runningFunSeq = runningFunSeq;
    this._context = ctx;
  };

  MUSIC.NoteSequence.Playing.prototype.stop = function () {
    if (this._context.playing) this._context.playing.stop();

    this._context.stop();

    this._runningFunSeq.stop();
  };

  MUSIC.NoteSequence.prototype.paddingTo = function (ticks) {
    this._totalduration = this._time(ticks);
  };

  MUSIC.NoteSequence.prototype.padding = function (time) {
    this._totalduration = this._totalduration + time;
  };

  MUSIC.NoteSequence.prototype.pushCallback = function (array) {
    var startTime = this._time(array[0]);

    if (startTime < 0) return;
    var f = array[1];

    this._funseq.push({
      t: startTime,
      f: f
    });
  };

  MUSIC.NoteSequence.prototype.push = function (array, baseCtx) {
    var noteNum = array[0];

    var startTime = this._time(array[1]);

    var duration = this._time(array[1] + array[2]) - startTime;

    if (startTime < 0) {
      if (startTime + duration < 0) {
        return;
      } else {
        duration = duration + startTime;
        startTime = 0;
      }
    }

    var options = array[3];
    this._noteid++;
    var mynoteid = this._noteid;

    if (baseCtx) {
      if (this._contextList.indexOf(baseCtx) === -1) {
        this._contextList.push(baseCtx);
      }
    }

    if (baseCtx && baseCtx.instrument && baseCtx.instrument.schedule_note) {
      if (baseCtx.instrument.currentTime) {
        baseCtx.songCtx.referenceInstrument = baseCtx.instrument;
      }

      this._funseq.push({
        t: startTime,
        f: function f(param) {
          var playing = baseCtx.instrument.schedule_note(noteNum, options, baseCtx.sequenceStartTime() + startTime / 1000, duration / 1000);
          baseCtx.setPlaying(mynoteid, playing);
        },
        externalSchedule: true
      });
    } else {
      console.warn("UNSUPPORTED WEBAUDIO SCHEDULE FOR note n=" + noteNum + " at " + startTime + " (fallback to setTimeout)");

      this._funseq.push({
        t: startTime,
        f: function f(param) {
          var ctx = baseCtx || param;
          if (!ctx.instrument.note) return;
          var playing = ctx.instrument.note(noteNum, options);
          ctx.setPlaying(mynoteid, playing);
        }
      });

      this._funseq.push({
        t: startTime + duration,
        f: function f(param) {
          var ctx = baseCtx || param;
          ctx.unsetPlaying(mynoteid);
        }
      });
    }

    if (startTime + duration > this._totalduration) this._totalduration = startTime + duration;
  };

  MUSIC.NoteSequence.prototype.makePlayable = function (instrument) {
    return new MUSIC.NoteSequence.Playable(this, instrument, this._totalduration, this._contextList);
  };

  MUSIC.NoteSequence.context = function (instrument, subctx, songCtx) {
    var playingNotes = {};

    var setPlaying = function setPlaying(noteid, p) {
      playingNotes[noteid] = p.play();
    };

    var unsetPlaying = function unsetPlaying(noteid) {
      var playing = playingNotes[noteid];

      if (playing) {
        playing.stop();
        delete playingNotes[noteid];
      }
    };

    var stop = function stop() {
      if (subctx) {
        for (var i = 0; i < subctx.length; i++) {
          subctx[i].stop();
        }
      }

      for (var noteid in playingNotes) {
        playingNotes[noteid].stop();
      }

      playingNotes = {};
    };

    var sequenceStartTime = function sequenceStartTime() {
      if (!songCtx.sequenceStartTime) {
        songCtx.sequenceStartTime = this.instrument.currentTime();
      }

      return songCtx.sequenceStartTime;
    };

    return {
      sequenceStartTime: sequenceStartTime,
      setPlaying: setPlaying,
      unsetPlaying: unsetPlaying,
      instrument: instrument,
      stop: stop,
      songCtx: songCtx
    };
  };
})();
;

(function () {
  var playingStop = function playingStop(playing) {
    playing.stop();
  };

  MUSIC.MultiPlayable = function (playableArray) {
    this._playableArray = playableArray;
    MUSIC.playablePipeExtend(this);
  };

  MUSIC.MultiPlayable.prototype.play = function (options) {
    var playablePlay = function playablePlay(playable) {
      return playable.play(options);
    };

    var playingArray = this._playableArray.map(playablePlay);

    return {
      stop: function stop() {
        playingArray.forEach(playingStop);
      }
    };
  };

  var higher = function higher(a, b) {
    return a > b ? a : b;
  };

  var getDuration = function getDuration(playable) {
    return playable && playable.duration ? playable.duration() : 0;
  };

  MUSIC.MultiPlayable.prototype.duration = function () {
    return this._playableArray.map(getDuration).reduce(higher, 0);
  };

  MUSIC.ChangeTimeWrapper = function (noteseq, extensionTime) {
    this._noteseq = noteseq;
    this._extensionTime = extensionTime;
  };

  MUSIC.ChangeTimeWrapper.prototype.push = function (input) {
    this._noteseq.push([input[0], input[1] * this._extensionTime, input[2] * this._extensionTime]);
  };

  MUSIC.Pattern = function (input, options) {
    var playableArray = [];
    options = options || {};
    options.pulseTime = options.pulseTime || 50;
    playableArray = input.map(function (seq) {
      var code = seq[0];
      var instrument = MUSIC.Types.cast("instrument", seq[1]);
      var noteseq = new MUSIC.NoteSequence();
      MUSIC.SequenceParser.parse(code, new MUSIC.ChangeTimeWrapper(noteseq, options.pulseTime));
      return noteseq.makePlayable(instrument);
    });
    return new MUSIC.MultiPlayable(playableArray);
  };
})();
;

(function () {
  MUSIC.SequenceParser = {};
  var notes = {
    "Cb": -1,
    "C": 0,
    "C#": 1,
    "Db": 1,
    "D": 2,
    "D#": 3,
    "Eb": 3,
    "E": 4,
    "E#": 5,
    "Fb": 4,
    "F": 5,
    "F#": 6,
    "Gb": 6,
    "G": 7,
    "G#": 8,
    "Ab": 8,
    "A": 9,
    "A#": 10,
    "Bb": 10,
    "B": 11,
    "B#": 12
  };

  var isNoteStart = function isNoteStart(chr) {
    return "CDEFGAB".indexOf(chr) !== -1;
  };

  var noteSplit = function noteSplit(str) {
    var ret = [];
    var lastNote = "";

    for (var i = 0; i < str.length; i++) {
      if (isNoteStart(str[i])) {
        if (lastNote !== "") ret.push(lastNote);
        lastNote = "";
      }

      if (str[i] === " " || str[i] === ".") {
        if (lastNote !== "") ret.push(lastNote);
        lastNote = "";
      }

      lastNote += str[i];
    }

    if (lastNote !== "") ret.push(lastNote);
    return ret;
  };

  var pipeReplace = new RegExp("\\|", "g");

  MUSIC.SequenceParser.parse = function (input, noteSeq) {
    var currentNote;
    var currentCharacter;
    if (input === "") return;
    input = input.replace(pipeReplace, "");
    var noteArray = noteSplit(input);
    var currentTime = 0;

    for (var i = 0; i < noteArray.length; i++) {
      var currentNoteStr = noteArray[i];
      var noteDuration = currentNoteStr.length;
      var equalIndex = currentNoteStr.indexOf("=");
      if (equalIndex != -1) currentNoteStr = currentNoteStr.slice(0, equalIndex);
      var lastChar = currentNoteStr.slice(-1);
      var octave = parseInt(lastChar);

      if (isNaN(octave)) {
        octave = 0;
      } else {
        currentNoteStr = currentNoteStr.slice(0, currentNoteStr.length - 1);
      }

      var currentNote = notes[currentNoteStr];

      if (currentNote !== undefined) {
        noteSeq.push([currentNote + octave * 12, currentTime, noteDuration]);
      }

      ;
      currentTime += noteDuration;
    }
  };
})();
;

(function () {
  var PlayingSong = function PlayingSong(funseq, patternContexts, options) {
    this._context = {
      playing: [],
      onStop: options && options.onStop
    };
    this._patternContexts = patternContexts;
    this._funseqHandler = funseq.start(this._context);
  };

  PlayingSong.prototype.stop = function () {
    if (this._patternContexts && this._patternContexts.length) {
      this._patternContexts.forEach(function (ctx) {
        ctx.stop();
      });
    }

    this._context.playing.forEach(function (playing) {
      playing.stop();
    });

    this._funseqHandler.stop();

    if (this._context.onStop) {
      this._context.onStop();
    }
  };

  var noPlay = {
    play: function play() {
      return {
        stop: function stop() {}
      };
    }
  };

  var defaultFromPatterns = function defaultFromPatterns(patterns) {
    return function (patternOrName) {
      if (typeof patternOrName === 'string') return patterns[patternOrName];
      return patternOrName || noPlay;
    };
  };

  var nullPlay = {
    stop: function stop() {}
  };

  var hasScheduleMethod = function hasScheduleMethod(pattern) {
    return !!pattern.schedule;
  };

  var hasNotScheduleMethod = function hasNotScheduleMethod(pattern) {
    return !pattern.schedule;
  };

  MUSIC.Song = function (input, patternsOrOptions, options) {
    var patterns;
    var self = this;

    if (arguments.length === 2) {
      return MUSIC.Song.bind(this)(input, {}, patternsOrOptions);
    } else {
      patterns = patternsOrOptions;
    }

    options = options || {};
    var getFromPatterns = options.pattern || defaultFromPatterns(patterns);
    var measure = (options.measure || 500) * options.ticks_per_beat;
    var funseq;

    if (!funseq) {
      var clock = MUSIC.Utils.Clock(window.performance.now.bind(window.performance), setInterval, clearInterval, 500);
      funseq = MUSIC.Utils.FunctionSeq(clock, setTimeout, clearTimeout);
    }

    var totalMeasures = input[0].length;
    this._funseq = funseq;

    var byStart = function byStart(a, b) {
      return a.s - b.s;
    }; // tempo events 


    var bpm_events = [];

    for (var j = 0; j < totalMeasures; j++) {
      var patternArray = [];

      for (var i = 0; i < input.length; i++) {
        var pattern = getFromPatterns(input[i][j]);

        if (pattern.bpm_events) {
          var displacedBpmEvents = pattern.bpm_events.map(function (evt) {
            return {
              n: evt.n,
              s: evt.s + j * measure,
              l: evt.l
            };
          });
          bpm_events = bpm_events.concat(displacedBpmEvents);
        }
      }

      ;
    }

    bpm_events = bpm_events.sort(byStart);
    var time = MUSIC.Math.ticksToTime({
      bpm: options.bpm,
      ticks_per_beat: options.ticks_per_beat,
      bpm_events: bpm_events,
      start: options.start || 0
    });

    this.timeToTicks = function () {
      return MUSIC.Math.timeToTicks({
        bpm: options.bpm,
        ticks_per_beat: options.ticks_per_beat,
        bpm_events: bpm_events,
        start: options.start || 0
      });
    };

    var timeFunc = function timeFunc(baseTicks) {
      return function (ticks) {
        return time(baseTicks + ticks);
      };
    };

    this._duration = time(totalMeasures * measure);
    this.songCtx = {};
    funseq.push({
      t: 0,
      f: function f() {
        if (self.songCtx.referenceInstrument) {
          self.songCtx.sequenceStartTime = self.songCtx.referenceInstrument.currentTime();
        }
      },
      externalSchedule: true
    });

    for (var j = 0; j < totalMeasures; j++) {
      (function () {
        var patternArray = [];

        for (var i = 0; i < input.length; i++) {
          patternArray.push(input[i][j]);
        }

        ;
        var playableArray = patternArray.map(getFromPatterns);
        var schedulable = playableArray.filter(hasScheduleMethod);
        var notSchedulable = playableArray.filter(hasNotScheduleMethod);

        if (notSchedulable.length > 0) {
          var multiPlayable = new MUSIC.MultiPlayable(notSchedulable);
          var playing = nullPlay;
          var duration = multiPlayable.duration();
          funseq.push({
            t: j * measure,
            f: function f(context) {
              playing = multiPlayable.play();
              context.playing.push(playing);
            }
          });
          funseq.push({
            t: j * measure + duration,
            f: function f(context) {
              playing.stop();
              context.playing = context.playing.filter(function (x) {
                return x != playing;
              });
            }
          });
        }

        schedulable.forEach(function (s) {
          var scheduleContexts = s.schedule(new MUSIC.NoteSequence(funseq, {
            time: timeFunc(j * measure)
          }), self.songCtx);
          self._patternContexts = (self._patternContexts || []).concat(scheduleContexts);
        });
      })();
    }

    ;
    funseq.push({
      t: timeFunc(0)(totalMeasures * measure),
      f: function f(context) {
        if (context.onStop) {
          context.onStop();
        }
      }
    });
  };

  MUSIC.Song.prototype.duration = function () {
    return this._duration;
  };

  MUSIC.Song.prototype.play = function (options) {
    return new PlayingSong(this._funseq, this._patternContexts, options);
  };
})();
;

(function () {
  MUSIC.Utils = MUSIC.Utils || {};

  MUSIC.Utils.Scale = function (base) {
    var toneAdd;
    var v;
    toneAdd = {};
    v = [0, 2, 5, 7, 9];

    for (var i = 0; i < v.length; i++) {
      toneAdd[(base + v[i]) % 12] = true;
    }

    return {
      add: function add(notenum, notes) {
        var ret = notenum;

        while (notes > 0) {
          ret += toneAdd[ret % 12] ? 2 : 1;
          notes--;
        }

        return ret;
      }
    };
  };

  MUSIC.Utils.Clock = function (preciseTimer, setInterval, clearInterval, interval) {
    var start = function start(fcn) {
      var startTime = preciseTimer();
      fcn(0);
      var hndl = setInterval(function () {
        var t = preciseTimer();
        fcn(t - startTime);
      }, interval);
      return {
        stop: function stop() {
          clearInterval(hndl);
        }
      };
    };

    return {
      start: start
    };
  };

  MUSIC.Utils.FunctionSeq = function (clock, setTimeout, clearTimeout) {
    var eventsArray = [];

    var reject = function reject(x) {
      return function (y) {
        return x != y;
      };
    };

    var start = function start(parameter) {
      var array = eventsArray.slice(0).sort(function (e1, e2) {
        var dt = e1.t - e2.t;

        if (dt === 0) {
          return eventsArray.indexOf(e1) - eventsArray.indexOf(e2);
        }

        return dt;
      });
      var timeoutHandlers = [];
      var eventCount = array.length;
      var clockHandler = clock.start(function (t) {
        var lastEvent;

        var callingCriteria = function callingCriteria(element) {
          return element.t - t < 1000 && element.t - t >= 0;
        };

        var pending = [];

        var processPending = function processPending() {
          if (!pending.length) return;
          var currentPending = pending;
          pending = [];

          for (var i = 0; i < currentPending.length; i++) {
            if (currentPending[i].externalSchedule) {
              currentPending[i].f(parameter, currentPending[i].t - t);
            }
          }

          var timeoutHandler = setTimeout(function () {
            timeoutHandlers = timeoutHandlers.filter(reject(timeoutHandler));

            for (var i = 0; i < currentPending.length; i++) {
              if (!currentPending[i].externalSchedule) {
                currentPending[i].f(parameter, 0);
                eventCount--;
                if (eventCount === 0) clockHandler.stop();
              }
            }
          }, currentPending[0].t - t);
          timeoutHandlers.push(timeoutHandler);
        };

        var addSchedule = function addSchedule(event) {
          if (lastEvent && lastEvent.t - t !== event.t - t) {
            processPending();
          }

          pending.push(event);
          lastEvent = event;
        };

        var nextElement;

        while (1) {
          if (array.length > 0) {
            nextElement = array[0];

            if (callingCriteria(nextElement)) {
              addSchedule(nextElement);
              array.shift(); // remove first element
            } else {
              break;
            }
          } else {
            break;
          }
        }

        processPending();
      });
      return {
        stop: function stop() {
          for (var i = 0; i < timeoutHandlers.length; i++) {
            clearTimeout(timeoutHandlers[i]);
          }

          ;
          clockHandler.stop();
        }
      };
    };

    var push = eventsArray.push.bind(eventsArray);
    return {
      start: start,
      push: push
    };
  };

  MUSIC.Utils.FunctionSeq.preciseTimeout = function (fcn, ms) {
    var funseq;
    clock = MUSIC.Utils.Clock(window.performance.now.bind(window.performance), setInterval, clearInterval, 500);
    funseq = MUSIC.Utils.FunctionSeq(clock, setTimeout, clearTimeout);
    var runningFunSeq;
    funseq.push({
      f: function f() {
        if (runningFunSeq) {
          runningFunSeq.stop();
        }

        fcn();
      },
      t: ms
    });
    runningFunSeq = funseq.start();
  };

  MUSIC.Utils.DelayedFunctionSeq = function (inner, delay) {
    var start = function start(params) {
      return inner.start(params);
    };

    var push = function push(params) {
      return inner.push({
        f: params.f,
        t: params.t + delay,
        externalSchedule: params.externalSchedule
      });
    };

    return {
      start: start,
      push: push
    };
  };
})();
;

(function () {
  MUSIC = MUSIC || {};
  MUSIC.Types.register("function", function (wave) {
    if (typeof wave.at === "function") {
      return wave.at.bind(wave);
    }
  });
  MUSIC.Types.register("function", function (fcn) {
    if (typeof fcn === "function") {
      return fcn;
    }
  });
  MUSIC.Types.register("wave", function (fcn) {
    if (typeof fcn === "function") {
      return new MUSIC.Wave.FunctionWave(fcn);
    }
  });
  MUSIC.Types.register("wave", function (wave) {
    if (typeof wave.at === "function") {
      return wave;
    }
  });
  var twopi = Math.PI * 2;
  MUSIC.Wave = {};

  var waveTransform = function waveTransform(fcn) {
    return function () {
      var wave = this;
      return {
        at: function at(t) {
          wave.at(fcn(t));
        }
      };
    };
  };

  var waveOps = {
    reverse: waveTransform(function (t) {
      return t - 1;
    }),
    scale: function scale(factor) {
      var wave = this;
      return new MUSIC.Wave.FunctionWave(function (t) {
        return wave.at(t * factor);
      });
    },
    translate: function translate(disp) {
      var wave = this;
      return new MUSIC.Wave.FunctionWave(function (t) {
        return wave.at(t + disp);
      });
    },
    table: function table(options) {
      return new MUSIC.Wave.Table(this, options);
    },
    combine: function combine(otherWave, otherFactor) {
      var thisWave = this;
      otherFactor = otherFactor || 0.5;
      var thisFactor = 1 - otherFactor;
      otherWave = MUSIC.Types.cast("wave", otherWave);
      return new MUSIC.Wave.FunctionWave(function (t) {
        return otherWave.at(t) * otherFactor + thisWave.at(t) * thisFactor;
      });
    }
  };

  var defaultInterpolation = function defaultInterpolation(table) {
    var length = table.length;
    return function (t) {
      var index = Math.floor(t * table.length);
      return table[index];
    };
  };

  MUSIC.Wave.Table = function (wave, options) {
    options = options || {};
    var sampleCount = options.samples || 100;
    var interpolation = options.interpolation || defaultInterpolation;
    var sample = [];

    for (var i = 0; i < sampleCount; i++) {
      sample[i] = wave.at(i / sampleCount);
    }

    this.at = interpolation(sample);
  };

  MUSIC.Wave.Table.prototype = waveOps;

  MUSIC.Wave.FunctionWave = function (fcn) {
    this.at = fcn;
  };

  MUSIC.Wave.FunctionWave.prototype = waveOps;

  MUSIC.Wave.sine = function () {
    return new MUSIC.Wave.FunctionWave(function (t) {
      return Math.sin(twopi * t);
    });
  };

  MUSIC.Wave.square = function (options) {
    options = options || {};
    var dutyCycle = options.dutyCycle || 0.5;
    var dutyLevel = options.dutyLevel || 1;
    var offLevel = options.offLevel || -1;
    return new MUSIC.Wave.FunctionWave(function (t) {
      if (t < dutyCycle) {
        return dutyLevel;
      } else {
        return offLevel;
      }
    });
  };

  MUSIC.Wave.triangle = function () {
    return new MUSIC.Wave.FunctionWave(function (t) {
      var t2 = t - 0.25;
      if (t2 < 0) t2++;

      if (t2 < 0.5) {
        return 1 - t2 * 4;
      } else {
        return -1 + (t2 - 0.5) * 4;
      }
    });
  };

  MUSIC.Wave.sawtooth = function () {
    return new MUSIC.Wave.FunctionWave(function (t) {
      return t * 2 - 1;
    });
  };
})();
;

MUSIC = MUSIC || {};
MUSIC.Formats = MUSIC.Formats || {};

MUSIC.Formats.CachedSerializer = function (innerSerializer) {
  var lastOutput;
  var lastInput;
  var lastType;
  return {
    serialize: function serialize(type, input) {
      var jsonCurrentInput;

      if (lastType && lastInput) {
        jsonCurrentInput = JSON.stringify(input);
        if (lastType === type && lastInput === jsonCurrentInput) return lastOutput;
      }

      lastType = type;
      lastInput = jsonCurrentInput || JSON.stringify(input);
      lastOutput = innerSerializer.serialize(type, input);
      return lastOutput;
    },
    deserialize: innerSerializer.deserialize.bind(innerSerializer)
  };
};
;

MUSIC = MUSIC || {};
MUSIC.Formats = MUSIC.Formats || {};

(function () {
  MUSIC.Formats.HuffmanSerializerWrapper = function (innerSerializer) {
    var frequencies = [[",", 100], ["[]", 20], ["0123456789", 10], ["abcdef.-{}", 4], ["t+-*/()<>=? ", 1]];

    var times = function times(str, n) {
      var ret = "";

      for (var i = 0; i < n; i++) {
        ret = ret + str;
      }

      return ret;
    };

    var concat = function concat(a, b) {
      return a.concat(b);
    };

    var text = frequencies.map(function (freq) {
      return times(freq[0], freq[1]);
    }).reduce(concat);
    text = text + "!\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~";
    var huffman = Huffman.treeFromText(text);

    var serialize = function serialize(type, obj) {
      var str = innerSerializer.serialize(type, obj);
      return huffman.encode(str);
    };

    var deserialize = function deserialize(type, str) {
      var decoded = huffman.decode(str);
      return innerSerializer.deserialize(type, decoded);
    };

    return {
      serialize: serialize,
      deserialize: deserialize
    };
  };
})();
;

MUSIC = MUSIC || {};
MUSIC.Formats = MUSIC.Formats || {};
MUSIC.Formats.JSONSerializer = {};

MUSIC.Formats.JSONSerializer.serialize = function (type, obj) {
  return JSON.stringify(obj);
};

MUSIC.Formats.JSONSerializer.deserialize = function (type, str) {
  return JSON.parse(str);
};
;

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

MUSIC = MUSIC || {};
MUSIC.Formats = MUSIC.Formats || {};
MUSIC.Formats.MultiSerializer = {};

(function () {
  var serializerArray = [];

  var match = function match(a, b) {
    if (_typeof(a) !== _typeof(b)) return false;
    if (Array.isArray(a) && !Array.isArray(b)) return false;
    if (Array.isArray(b) && !Array.isArray(a)) return false;

    if (Array.isArray(a)) {
      if (a.length !== b.length) return false;

      for (var i = 0; i < a.length; i++) {
        if (!match(a[i], b[i])) return false;
      }

      return true;
    } else if (_typeof(a) === 'object') {
      return Object.keys(a).every(function (key) {
        return match(a[key], b[key]);
      });
    } else {
      return a === b;
    }
  };

  MUSIC.Formats.MultiSerializer.match = match;

  MUSIC.Formats.MultiSerializer.wrapSerializer = function (serializer) {
    return {
      serialize: function serialize(type, obj) {
        try {
          var output = serializer.serialize(type, obj);
          var recoveredInput = serializer.deserialize(type, output);
          return MUSIC.Formats.MultiSerializer.match(obj, recoveredInput) ? output : null;
        } catch (e) {
          return null; // failed serializations are discarded
        }
      },
      deserialize: serializer.deserialize
    };
  };

  var smallest = function smallest(a, b) {
    return a.length < b.length ? a : b;
  };

  var truthy = function truthy(a) {
    return !!a;
  };

  MUSIC.Formats.MultiSerializer.selector = function (array) {
    array = array.filter(truthy);
    if (array.length) return array.filter(truthy).reduce(smallest);
    throw new Error("serialization not found");
  };

  MUSIC.Formats.MultiSerializer.serialize = function (type, obj) {
    return MUSIC.Formats.MultiSerializer.selector(serializerArray.map(function (s) {
      var serialized = s.serializer.serialize(type, obj);
      if (!serialized) return serialized;
      return s.base.concat(serialized);
    }));
  };

  MUSIC.Formats.MultiSerializer.deserialize = function (type, obj) {
    for (var i = 0; i < serializerArray.length; i++) {
      if (obj[0] === serializerArray[i].base) return serializerArray[i].serializer.deserialize(type, obj.slice(1));
    }

    throw new Error("Unsupported format");
  };

  MUSIC.Formats.MultiSerializer.setSerializers = function (array) {
    serializerArray = array.map(function (entry) {
      return {
        serializer: MUSIC.Formats.MultiSerializer.wrapSerializer(entry.serializer),
        base: entry.base
      };
    });
  };
})();
;

MUSIC = MUSIC || {};
MUSIC.Formats = MUSIC.Formats || {};
MUSIC.Formats.PackedJSONSerializer = {};

(function () {
  var objToArrayPacker = function objToArrayPacker(keys) {
    var pack = function pack(obj) {
      var array = [];

      for (var i = 0; i < keys.length; i++) {
        var key = keys[i];

        if (Array.isArray(key)) {
          array.push(key[1].pack(obj[key[0]], obj));
        } else {
          if (obj[key] !== null && obj[key] !== undefined) array.push(obj[key]);
        }
      }

      return array;
    };

    var unpack = function unpack(array) {
      var obj = {};

      for (var i = 0; i < array.length; i++) {
        var key = keys[i];

        if (Array.isArray(key)) {
          obj[key[0]] = key[1].unpack(array[i], obj);
        } else {
          if (array[i] !== null && array[i] !== undefined) obj[key] = array[i];
        }
      }

      return obj;
    };

    return {
      pack: pack,
      unpack: unpack
    };
  };

  var array = function array(innerPacker) {
    var pack = function pack(obj) {
      return obj.map(innerPacker.pack);
    };

    var unpack = function unpack(array) {
      return array.map(innerPacker.unpack);
    };

    return {
      pack: pack,
      unpack: unpack
    };
  };

  var concat = function concat(a, b) {
    return a.concat(b);
  };

  var flatten = function flatten(innerPacker, size) {
    var pack = function pack(obj) {
      var ret = innerPacker.pack(obj);
      return ret.reduce(concat, []);
    };

    var unpack = function unpack(array) {
      var deflatted = [];

      for (var i = 0; i < array.length; i += size) {
        deflatted.push(array.slice(i, i + size));
      }

      return innerPacker.unpack(deflatted);
    };

    return {
      pack: pack,
      unpack: unpack
    };
  };

  var patternPacker = objToArrayPacker(["measure", "measureCount", "bpm", "selectedTrack", "scrollLeft", ["tracks", flatten(array(objToArrayPacker(["scroll", ["events", flatten(array(objToArrayPacker(["n", "s", "l"])), 3)], "instrument"])), 3)]]);

  var patternIndexPacker = function patternIndexPacker(inner) {
    var pack = function pack(obj) {
      var patterns = [];

      var convertBlocks = function convertBlocks(block) {
        if (block.id) {
          if (patterns.indexOf(block.id) === -1) patterns.push(block.id);
          return {
            id: patterns.indexOf(block.id) + 1
          };
        } else {
          return {
            id: 0
          };
        }
      };

      var convertTrack = function convertTrack(track) {
        return {
          blocks: track.blocks.map(convertBlocks)
        };
      };

      var newObject = {
        patterns: patterns,
        measure: obj.measure,
        bpm: obj.bpm,
        tracks: obj.tracks.map(convertTrack)
      };
      return inner.pack(newObject);
    };

    var unpack = function unpack(obj) {
      var ret = inner.unpack(obj);
      ret.tracks.forEach(function (track) {
        track.blocks.forEach(function (block) {
          if (block.id === 0) {
            delete block.id;
          } else {
            block.id = ret.patterns[block.id - 1];
          }
        });
      });
      return {
        measure: ret.measure,
        bpm: ret.bpm,
        tracks: ret.tracks
      };
    };

    return {
      pack: pack,
      unpack: unpack
    };
  };

  var substitution = function substitution(keys) {
    var pack = function pack(obj) {
      var idx = keys.indexOf(obj);
      if (idx === -1) return obj;
      return idx;
    };

    var unpack = function unpack(obj) {
      if (isNaN(obj)) return obj;
      return keys[obj];
    };

    return {
      pack: pack,
      unpack: unpack
    };
  };

  var switchPacker = function switchPacker(selectAttribute, packers) {
    var pack = function pack(obj, parent) {
      var innerPacker = packers[parent[selectAttribute]];

      if (!innerPacker) {
        return obj;
      }

      return innerPacker.pack(obj);
    };

    var unpack = function unpack(obj, parent) {
      var innerPacker = packers[parent[selectAttribute]];

      if (!innerPacker) {
        return obj;
      }

      return innerPacker.unpack(obj);
    };

    return {
      pack: pack,
      unpack: unpack
    };
  };

  var booleanPacker = {
    pack: function pack(obj) {
      if (obj === undefined) return 3;
      if (obj === null) return 4;
      return !!obj ? 1 : 0;
    },
    unpack: function unpack(obj) {
      if (obj === 3) return undefined;
      if (obj === 4) return null;
      return obj === 1 ? true : false;
    }
  };

  var nullable = function nullable(innerPacker) {
    var pack = function pack(obj) {
      if (obj === undefined) return 0;
      if (obj === null) return 1;
      return innerPacker ? innerPacker.pack(obj) : obj;
    };

    var unpack = function unpack(obj) {
      if (obj === 0) return undefined;
      if (obj === 1) return null;
      return innerPacker ? innerPacker.unpack(obj) : obj;
    };

    return {
      pack: pack,
      unpack: unpack
    };
  };

  var songPacker = patternIndexPacker(objToArrayPacker(["patterns", "measure", "bpm", ["tracks", flatten(array(objToArrayPacker([["blocks", flatten(array(objToArrayPacker(["id"])), 1)]])), 1)]]));
  var recursiveInstrumentPacker = {
    pack: function pack(obj) {
      return instrumentPacker.pack(obj);
    },
    unpack: function unpack(obj) {
      return instrumentPacker.unpack(obj);
    }
  };
  var stackPacker = objToArrayPacker([["array", array(recursiveInstrumentPacker)]]);
  var envelopePacker = objToArrayPacker(["attackTime", "decayTime", "sustainLevel", "releaseTime", ["reset_on_cut", booleanPacker]]);
  var oscillatorPacker = objToArrayPacker([["oscillatorType", substitution(["sine", "square", "sawtooth", "triangle", "custom"])], ["fixed_frequency", booleanPacker], ["frequency", nullable()], ["waveform", nullable()], ["serie", nullable(objToArrayPacker(["sin", "cos"]))], ["terms", nullable(objToArrayPacker(["sin", "cos"]))], ["modulation", nullable(objToArrayPacker([["detune", recursiveInstrumentPacker]]))], "time_constant"]);
  var frequencyFilterPacker = objToArrayPacker(["frequency", "detune", "Q", ["modulation", objToArrayPacker([["frequency", recursiveInstrumentPacker], ["detune", recursiveInstrumentPacker], ["Q", recursiveInstrumentPacker]])]]);
  var noParametersPacker = objToArrayPacker([]);
  var multiInstrumentPacker = objToArrayPacker([["subobjects", flatten(array(recursiveInstrumentPacker), 2)]]);
  var typeNames = ["script", "null", "oscillator", "notesplit", "rise", "adsr", "envelope", "transpose", "scale", "gain", "echo", "lowpass", "highpass", "bandpass", "lowshelf", "highshelf", "peaking", "notch", "allpass", "reverb", "noise", "pink_noise", "red_noise", "arpeggiator", "stack", "multi_instrument", "monophoner", "polyphoner"];
  var monophonerPacker = objToArrayPacker([["force_note_cut", booleanPacker]]);
  var polyphonerPacker = objToArrayPacker(["maxChannels"]);
  var instrumentPacker = objToArrayPacker([["type", substitution(typeNames)], ["data", switchPacker('type', {
    script: objToArrayPacker(["code"]),
    'null': noParametersPacker,
    oscillator: oscillatorPacker,
    notesplit: objToArrayPacker(["delay"]),
    rise: objToArrayPacker(["time", "target"]),
    adsr: envelopePacker,
    envelope: envelopePacker,
    transpose: objToArrayPacker(["amount"]),
    scale: objToArrayPacker(["base", "top"]),
    gain: objToArrayPacker(["gain"]),
    echo: objToArrayPacker(["gain", "delay"]),
    lowpass: frequencyFilterPacker,
    highpass: frequencyFilterPacker,
    bandpass: frequencyFilterPacker,
    lowshelf: frequencyFilterPacker,
    highshelf: frequencyFilterPacker,
    peaking: frequencyFilterPacker,
    notch: frequencyFilterPacker,
    allpass: frequencyFilterPacker,
    reverb: objToArrayPacker(["room", "damp", "mix"]),
    noise: noParametersPacker,
    pink_noise: noParametersPacker,
    red_noise: noParametersPacker,
    arpeggiator: objToArrayPacker(["scale", "interval", "duration", "gap"]),
    stack: stackPacker,
    multi_instrument: multiInstrumentPacker,
    monophoner: monophonerPacker,
    polyphoner: polyphonerPacker
  })]]);
  var packer = {
    pattern: patternPacker,
    song: songPacker,
    instrument: instrumentPacker
  };

  MUSIC.Formats.PackedJSONSerializer.serialize = function (type, obj) {
    if (packer[type]) {
      var str = JSON.stringify(packer[type].pack(obj));
      str = str.slice(1, str.length - 1);
      return str;
    }

    return JSON.stringify(obj);
  };

  MUSIC.Formats.PackedJSONSerializer.deserialize = function (type, str) {
    if (packer[type]) {
      return packer[type].unpack(JSON.parse('[' + str + ']'));
    }

    return JSON.parse(str);
  };
})();
;

MUSIC = MUSIC || {};
MUSIC.Formats = MUSIC.Formats || {};
MUSIC.Formats.PackedJSONSerializerB = {};

(function () {
  var objToArrayPacker = function objToArrayPacker(keys) {
    var pack = function pack(obj) {
      var array = [];

      for (var i = 0; i < keys.length; i++) {
        var key = keys[i];

        if (Array.isArray(key)) {
          array.push(key[1].pack(obj[key[0]], obj));
        } else {
          if (obj[key] !== null && obj[key] !== undefined) array.push(obj[key]);
        }
      }

      return array;
    };

    var unpack = function unpack(array) {
      var obj = {};

      for (var i = 0; i < array.length; i++) {
        var key = keys[i];

        if (Array.isArray(key)) {
          obj[key[0]] = key[1].unpack(array[i], obj);
        } else {
          if (array[i] !== null && array[i] !== undefined) obj[key] = array[i];
        }
      }

      return obj;
    };

    return {
      pack: pack,
      unpack: unpack
    };
  };

  var array = function array(innerPacker) {
    var pack = function pack(obj) {
      return obj.map(innerPacker.pack);
    };

    var unpack = function unpack(array) {
      return array.map(innerPacker.unpack);
    };

    return {
      pack: pack,
      unpack: unpack
    };
  };

  var concat = function concat(a, b) {
    return a.concat(b);
  };

  var flatten = function flatten(innerPacker, size) {
    var pack = function pack(obj) {
      var ret = innerPacker.pack(obj);
      return ret.reduce(concat, []);
    };

    var unpack = function unpack(array) {
      var deflatted = [];

      for (var i = 0; i < array.length; i += size) {
        deflatted.push(array.slice(i, i + size));
      }

      return innerPacker.unpack(deflatted);
    };

    return {
      pack: pack,
      unpack: unpack
    };
  };

  var booleanPacker = {
    pack: function pack(obj) {
      if (obj === undefined) return 3;
      if (obj === null) return 4;
      return !!obj ? 1 : 0;
    },
    unpack: function unpack(obj) {
      if (obj === 3) return undefined;
      if (obj === 4) return null;
      return obj === 1 ? true : false;
    }
  };
  var patternEventPacker = {
    pack: function pack(obj) {
      var firstElement = obj.n;

      for (var k in obj) {
        if (k !== 'n' && k !== 's' && k !== 'l') {
          if (firstElement === obj.n) {
            firstElement = {
              n: obj.n
            };
          }

          firstElement[k] = obj[k];
        }
      }

      ;
      return [firstElement, obj.s, obj.l];
    },
    unpack: function unpack(array) {
      var firstElement = array[0];

      if (typeof firstElement === 'number') {
        return {
          n: array[0],
          s: array[1],
          l: array[2]
        };
      } else {
        var ret = {};

        for (var k in firstElement) {
          ret[k] = firstElement[k];
        }

        ret.s = array[1];
        ret.l = array[2];
        return ret;
      }
    }
  };
  var patternPacker = objToArrayPacker(["measure", "measureCount", "bpm", "selectedTrack", "scrollLeft", ["tracks", array(objToArrayPacker([["muted", booleanPacker], ["solo", booleanPacker], "scroll", ["events", flatten(array(patternEventPacker), 3)], "instrument"]))]]);

  var patternIndexPacker = function patternIndexPacker(inner) {
    var pack = function pack(obj) {
      var patterns = [];

      var convertBlocks = function convertBlocks(block) {
        if (block.id) {
          if (patterns.indexOf(block.id) === -1) patterns.push(block.id);
          return {
            id: patterns.indexOf(block.id) + 1
          };
        } else {
          return {
            id: 0
          };
        }
      };

      var convertTrack = function convertTrack(track) {
        return {
          blocks: track.blocks.map(convertBlocks)
        };
      };

      var newObject = {
        patterns: patterns,
        measure: obj.measure,
        bpm: obj.bpm,
        tracks: obj.tracks.map(convertTrack)
      };
      return inner.pack(newObject);
    };

    var unpack = function unpack(obj) {
      var ret = inner.unpack(obj);
      ret.tracks.forEach(function (track) {
        track.blocks.forEach(function (block) {
          if (block.id === 0) {
            delete block.id;
          } else {
            block.id = ret.patterns[block.id - 1];
          }
        });
      });
      return {
        measure: ret.measure,
        bpm: ret.bpm,
        tracks: ret.tracks
      };
    };

    return {
      pack: pack,
      unpack: unpack
    };
  };

  var substitution = function substitution(keys) {
    var pack = function pack(obj) {
      var idx = keys.indexOf(obj);
      if (idx === -1) return obj;
      return idx;
    };

    var unpack = function unpack(obj) {
      if (isNaN(obj)) return obj;
      return keys[obj];
    };

    return {
      pack: pack,
      unpack: unpack
    };
  };

  var switchPacker = function switchPacker(selectAttribute, packers) {
    var pack = function pack(obj, parent) {
      var innerPacker = packers[parent[selectAttribute]];

      if (!innerPacker) {
        return obj;
      }

      return innerPacker.pack(obj);
    };

    var unpack = function unpack(obj, parent) {
      var innerPacker = packers[parent[selectAttribute]];

      if (!innerPacker) {
        return obj;
      }

      return innerPacker.unpack(obj);
    };

    return {
      pack: pack,
      unpack: unpack
    };
  };

  var nullable = function nullable(innerPacker) {
    var pack = function pack(obj) {
      if (obj === undefined) return 0;
      if (obj === null) return 1;
      return innerPacker ? innerPacker.pack(obj) : obj;
    };

    var unpack = function unpack(obj) {
      if (obj === 0) return undefined;
      if (obj === 1) return null;
      return innerPacker ? innerPacker.unpack(obj) : obj;
    };

    return {
      pack: pack,
      unpack: unpack
    };
  };

  var songPacker = patternIndexPacker(objToArrayPacker(["patterns", "measure", "bpm", ["tracks", flatten(array(objToArrayPacker([["blocks", flatten(array(objToArrayPacker(["id"])), 1)]])), 1)]]));
  var recursiveInstrumentPacker = {
    pack: function pack(obj) {
      return instrumentPacker.pack(obj);
    },
    unpack: function unpack(obj) {
      return instrumentPacker.unpack(obj);
    }
  };
  var stackPacker = objToArrayPacker([["array", array(recursiveInstrumentPacker)]]);
  var envelopePacker = objToArrayPacker(["attackTime", "decayTime", "sustainLevel", "releaseTime", ["reset_on_cut", booleanPacker]]);
  var oscillatorPacker = objToArrayPacker([["oscillatorType", substitution(["sine", "square", "sawtooth", "triangle", "custom"])], ["fixed_frequency", booleanPacker], ["frequency", nullable()], ["waveform", nullable()], ["serie", nullable(objToArrayPacker(["sin", "cos"]))], ["terms", nullable(objToArrayPacker(["sin", "cos"]))], ["modulation", nullable(objToArrayPacker([["detune", recursiveInstrumentPacker], ["pulse_width", nullable(recursiveInstrumentPacker)]]))], "time_constant", "pulse_width"]);
  var frequencyFilterPacker = objToArrayPacker(["frequency", "detune", "Q", ["modulation", objToArrayPacker([["frequency", recursiveInstrumentPacker], ["detune", recursiveInstrumentPacker], ["Q", recursiveInstrumentPacker]])]]);
  var noParametersPacker = objToArrayPacker([]);
  var multiInstrumentPacker = objToArrayPacker([["subobjects", flatten(array(recursiveInstrumentPacker), 2)]]);
  var typeNames = ["script", "null", "oscillator", "notesplit", "rise", "adsr", "envelope", "transpose", "scale", "gain", "echo", "lowpass", "highpass", "bandpass", "lowshelf", "highshelf", "peaking", "notch", "allpass", "reverb", "noise", "pink_noise", "red_noise", "arpeggiator", "stack", "multi_instrument", "monophoner", "polyphoner", "note_padding", "note_condition", "signal_monitor", "signal_constant", "note_delay", "sample_rate_reduction", "bit_crushing", "signal_scale", "signal_not", "signal_or", "signal_and", "signal_nor", "signal_nand", "delay", "note_frequency_generator", "note_time_shift", "wave_shaper"];
  var monophonerPacker = objToArrayPacker([["force_note_cut", booleanPacker]]);
  var polyphonerPacker = objToArrayPacker(["maxChannels"]);
  var notePaddingPacker = objToArrayPacker(["time"]);

  var toModl = function toModl(value) {
    return [value, recursiveInstrumentPacker];
  };

  var modl = function modl(values) {
    return nullable(objToArrayPacker(values.map(toModl)));
  };

  var instrumentPacker = objToArrayPacker([["type", substitution(typeNames)], ["data", switchPacker('type', {
    script: objToArrayPacker(["code"]),
    'null': noParametersPacker,
    oscillator: oscillatorPacker,
    notesplit: objToArrayPacker(["delay"]),
    rise: objToArrayPacker(["time", "target"]),
    adsr: envelopePacker,
    envelope: envelopePacker,
    transpose: objToArrayPacker(["amount"]),
    scale: objToArrayPacker(["base", "top"]),
    gain: objToArrayPacker(["gain", ["modulation", modl(["gain"])]]),
    echo: objToArrayPacker(["gain", "delay"]),
    lowpass: frequencyFilterPacker,
    highpass: frequencyFilterPacker,
    bandpass: frequencyFilterPacker,
    lowshelf: frequencyFilterPacker,
    highshelf: frequencyFilterPacker,
    peaking: frequencyFilterPacker,
    notch: frequencyFilterPacker,
    allpass: frequencyFilterPacker,
    reverb: objToArrayPacker(["room", "damp", "mix"]),
    noise: noParametersPacker,
    pink_noise: noParametersPacker,
    red_noise: noParametersPacker,
    arpeggiator: objToArrayPacker(["scale", "interval", "duration", "gap"]),
    stack: stackPacker,
    multi_instrument: multiInstrumentPacker,
    monophoner: monophonerPacker,
    polyphoner: polyphonerPacker,
    note_padding: notePaddingPacker,
    note_condition: objToArrayPacker(["note_on", "note_off", "enter_time_constant", "leave_time_constant"]),
    signal_monitor: noParametersPacker,
    signal_constant: objToArrayPacker(["offset"]),
    note_delay: objToArrayPacker(["delay"]),
    delay: objToArrayPacker(["delay", ["modulation", modl(["delay"])]]),
    sample_rate_reduction: objToArrayPacker(["factor"]),
    bit_crushing: objToArrayPacker(["bits"]),
    signal_scale: objToArrayPacker(["base", "top"]),
    signal_not: noParametersPacker,
    signal_or: objToArrayPacker(["second_signal", ["modulation", modl(["second_signal"])]]),
    signal_and: objToArrayPacker(["second_signal", ["modulation", modl(["second_signal"])]]),
    signal_nor: objToArrayPacker(["second_signal", ["modulation", modl(["second_signal"])]]),
    signal_nand: objToArrayPacker(["second_signal", ["modulation", modl(["second_signal"])]]),
    note_frequency_generator: objToArrayPacker(["time_constant"]),
    note_time_shift: objToArrayPacker(["time"]),
    wave_shaper: objToArrayPacker(["samples", "f"])
  })]]);
  var packer = {
    pattern: patternPacker,
    song: songPacker,
    instrument: instrumentPacker
  };

  MUSIC.Formats.PackedJSONSerializerB.serialize = function (type, obj) {
    if (packer[type]) {
      var str = JSON.stringify(packer[type].pack(obj));
      str = str.slice(1, str.length - 1);
      return str;
    }

    return JSON.stringify(obj);
  };

  MUSIC.Formats.PackedJSONSerializerB.deserialize = function (type, str) {
    if (packer[type]) {
      return packer[type].unpack(JSON.parse('[' + str + ']'));
    }

    return JSON.parse(str);
  };
})();
//# sourceMappingURL=music.js.map
