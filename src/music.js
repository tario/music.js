MUSIC = {};

(function() {
MUSIC.SoundLib = MUSIC.SoundLib || {};
MUSIC.Effects = MUSIC.Effects || {};
MUSIC.Types = new TypeCast();


MUSIC.playablePipeExtend = function(obj) {
  obj.during = function(duration) {
    var original = this;
    return MUSIC.playablePipeExtend({
      play: function() {
        var stopped = false;
        var playable = original.play();
        var wrapper = {
          stop: function() {
            if (!stopped) playable.stop();
            stopped = true;
          }
        };
        setTimeout(wrapper.stop, duration);
        return wrapper;
      },

      duration: function() { return duration; }
    });
  };

  obj.stopDelay = function(delay) {
    var original = this;
    return MUSIC.playablePipeExtend(
      {
        play: function(param) {
          var playing = original.play(param);
          return {
            stop: function() {
              setTimeout(playing.stop.bind(playing), delay);
            }
          };
        }
      }
    );
  };

  obj.onError = function(fcn) {
    var original = this;
    return MUSIC.playablePipeExtend(
      {
        play: function(param) {
          try {
            var playing = original.play(param);
            return {
              stop: function() {
                try {
                  playing.stop();
                } catch(e) {
                  console.error(e);
                  fcn(e);
                }
              }
            };
          } catch(e) {
            console.error(e);
            fcn(e);
            throw e;
          }
        }
      }
    );
  };

  obj.onStop = function(fcn) {
    var original = this;
    return MUSIC.playablePipeExtend(
      {
        play: function(param) {
          var playing = original.play(param);
          return {
            stop: function() {
              playing.stop();
              fcn(param);
            }
          };
        }
      }
    );
  };

  return obj;
};

MUSIC.Types.register("playable", function(playable) {
  if (playable.play) {
    return playable;
  }
});

MUSIC.Types.register("playable", function(fcn) {
  if (typeof fcn === "function") {
    return {
      play: fcn
    };
  }
});

MUSIC.EffectsPipeline = function(audio, audioDestination) {
  this._audio = audio;
  this._audioDestination = audioDestination;
};

var defaultWrapFcn = function(obj){
  return obj;
};
var compose = function(f,g) {
  return function(obj) {
    return g(f(obj));
  };
};

MUSIC.EffectsPipeline.prototype = {

  _wrapFcn: defaultWrapFcn,

  wrap: function(f) {
    var ret = new MUSIC.DummyNode(this)
    if (this._wrapFcn !== defaultWrapFcn) {
      f = compose(f, this._wrapFcn);
    }
    ret._wrapFcn = function(obj) {
      var ret2 = f(obj);
      ret2._wrapFcn = ret._wrapFcn;
      return ret2;
    };
    return ret;
  },

  sfxBase: function() {
    var objects = [];
    var dispose = function(obj) {
      obj.dispose();
    };

    var sfxBaseWrapper = function(elem) {
      if (!elem.dispose) return elem;
      
      var removeElem = function(x) {
        return x != elem;
      };
      var originalDispose = elem.dispose;
      objects.push(elem);
      elem.dispose = function() {
        objects = objects.filter(removeElem);
        originalDispose.call(elem);
      };

      return elem;
    };

    var sfxPrune = function() {
      objects.forEach(dispose);
    };

    var ret = this.wrap(sfxBaseWrapper);
    var original = this;
    ret.getOriginal = function() {
      if (original.getOriginal) return original.getOriginal();
      return original;
    };

    ret.prune = sfxPrune;
    return ret;
  },

  constant: function(options) {
    return this._wrapFcn(new MUSIC.SoundLib.Constant(this._audio, this._audioDestination, options));
  },

  oscillator: function(options) {
    return this._wrapFcn(new MUSIC.SoundLib.Oscillator(this._audio, this._audioDestination, options));
  },

  soundfont: function(param) {
    return this._wrapFcn(new MUSIC.SoundfontInstrument(param, this._audio, this._audioDestination));
  },

  sound: function(path) {
    var audio = this._audio;
    var audioDestination = this._audioDestination;

    var request = new XMLHttpRequest();
    request.open("GET", path, true);
    request.responseType = "arraybuffer";
    var audioBuffer;

    request.onerror = function(err) {
      console.error(err);
    };

    request.onload = function(e) {
      audio.audio.decodeAudioData(request.response, function (buffer) {
        audioBuffer = buffer;
      });
    };

    request.send();
    return MUSIC.playablePipeExtend({
      play: function() {
        var bufferSource = audio.audio.createBufferSource();
        bufferSource.buffer = audioBuffer;
        bufferSource.connect(audioDestination._destination);
        bufferSource.start(audio.audio.currentTime);

        return {
          stop: function() {
            bufferSource.stop();
            bufferSource.disconnect(audioDestination._destination);
          }
        };
      }
    });
  },
  
  formulaGenerator: function(fcn) {
    return this._wrapFcn(new MUSIC.SoundLib.FormulaGenerator(this._audio, this._audioDestination, fcn));
  },

  signal_and: function(value) {
    return this.gain(value||1);
  },

  signal_nand: function(value) {
    return this.not().and(value||1);
  },

  signal_or: function(value) {
    return this.not().nor(value||0);
  },

  signal_nor: function(value) {
    var negateModl = function(modl) {
      if (!modl.apply) return modl;

      return {
        apply: function(currentTime, audioParam, music) {
          return modl.apply(currentTime, audioParam, music, function(modulatorFactory, f) {
            return f(modulatorFactory.not());
          });
        }
      };
    };

    var andNode = this.and(1);
    var update = function(value) {
      andNode.update(negateModl(value));
    };
    update(value);

    var ret = andNode.not();
    ret.update = update;
    return ret;
  },

  signal_not: function() {
    return this.signal_scale({top: 0, base: 2});
  },

  signal_scale: function(options) {
    var gain = this.gain(1.0);
    var c1 = this.constant(0.0);

    var gainUpdate = gain.update.bind(gain);
    var gainDispose = gain.dispose.bind(gain);
    var constantUpdate = c1.update.bind(c1);
    var constantDispose = c1.dispose.bind(c1);

    var dispose = function() {
      gainDispose();
      constantDispose();
    };

    var update = function(options) {
      var a, b;
      a = (options.top - options.base)/2;
      b = options.base + a;

      gainUpdate(a);
      constantUpdate(b);
    };

    update(options);
    gain.update = update;
    gain.dispose = dispose;

    return gain;
  },


  T: function() {
    return this._wrapFcn(new MUSIC.T(arguments, this._audio, this._audioDestination));
  },

  noise: function() {
    return this._wrapFcn(new MUSIC.SoundLib.Noise(this._audio, this._audioDestination));
  },

  pink_noise: function() {
    return this._wrapFcn(new MUSIC.SoundLib.PinkNoise(this._audio, this._audioDestination));
  },

  red_noise: function() {
    return this._wrapFcn(new MUSIC.SoundLib.RedNoise(this._audio, this._audioDestination));
  }
};

MUSIC.DummyNode = function(music) {
  MUSIC.EffectsPipeline.apply(this, [music._audio, music._audioDestination]);
};
MUSIC.DummyNode.prototype = Object.create(MUSIC.EffectsPipeline.prototype);

MUSIC.T = function(args, music, audioDestination) {
  var api = T("WebAudioAPI:recv", music.audio /* audioContext */);
  var context = api.context;
  var gainNode = context.createGain(1.0);

  api.recv(gainNode);
  setTimeout(function() { // this hack prevents a bug in current version of chrome
    gainNode.connect(audioDestination._destination);
  });

  var Targuments = [];
  for (var i=0; i<args.length; i++) {
    Targuments.push(args[i]);
  };

  Targuments.push(api);
  var synth = T.apply(null, Targuments);// ("reverb", {room:0.95, damp:0.1, mix:0.75}, api);
  var send = T("WebAudioAPI:send", synth, music.audio /* audioContext */).send(audioDestination._destination);

  this.output = function() {
    return gainNode;
  }; 

  var disconnected = false;
  this.disconnect = function() {
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
  this.next = function() {
    return audioDestination;
  };

  MUSIC.EffectsPipeline.bind(this)(music, this);
};
MUSIC.T.prototype = Object.create(MUSIC.EffectsPipeline.prototype);

MUSIC.Effects.register = function(effectName, fcn) {
  MUSIC.EffectsPipeline.prototype[effectName] = function(value) {
    return this._wrapFcn(fcn(this._audio, this._audioDestination, value));
  };
};

var audioContext = new (window.AudioContext || window.webkitAudioContext)();
MUSIC.Context = function(options) {
  var audio = audioContext;
  var music = this;
  var gainNode = audio.createGain();
  options = options || {};

  gainNode.gain.value = 1.0; 
  
  if (!options.nooutput) gainNode.connect(audio.destination);

  this._destination = gainNode;
  this.audio = audio;

  this.record = function(options, callback) {
    var recorder = new WebAudioRecorder(gainNode, {
      workerDir: "src/lib/recorder/worker/",
      encoding: options.encoding,
      numChannels: options.numChannels
    });
    recorder.onComplete = function(recorder, blob) {
      callback(blob);
    };

    recorder.startRecording();
    //recorder.record();
    return {
      stop: function() {
        recorder.finishRecording();
      }
    };
  };

  this.audio = audio;

  MUSIC.EffectsPipeline.bind(this)(music, this);
};
MUSIC.Context.prototype = new MUSIC.EffectsPipeline();

MUSIC.SoundLib.FormulaGenerator = function(audio, nextProvider, fcn) {
  this.play = function(param) {
    var audioDestination;
    var formulaGenerator = new MUSIC.Effects.Formula(audio, nextProvider, function(input, t) {
      return fcn(t);
    });

    return {
      stop: function() {
        formulaGenerator.disconnect(nextProvider._destination);
      }
    }
  };

  MUSIC.playablePipeExtend(this);
};

MUSIC.SoundLib.PinkNoise = function(audio, nextProvider) {
  this.play = function(param) {
    var audioDestination;
    var b0, b1, b2, b3, b4, b5, b6;
    b0 = b1 = b2 = b3 = b4 = b5 = b6 = 0.0;

    var noiseGenerator = new MUSIC.Effects.Formula(audio, nextProvider, function() {
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
      stop: function() {
        noiseGenerator.disconnect(nextProvider._destination);
      }
    }
  };

  this.setValue = function() {
  };

  MUSIC.playablePipeExtend(this);
};

MUSIC.SoundLib.RedNoise = function(audio, nextProvider) {
  this.play = function(param) {
    var audioDestination;
    var lastOut = 0.0;

    var noiseGenerator = new MUSIC.Effects.Formula(audio, nextProvider, function() {
      var white = Math.random() * 2 - 1;
      var ret = (lastOut + (0.02 * white)) / 1.02;
      lastOut = ret;
      return ret * 3.5;
    });

    return {
      stop: function() {
        noiseGenerator.disconnect(nextProvider._destination);
      }
    }
  };

  this.setValue = function() {
  };

  MUSIC.playablePipeExtend(this);
};

MUSIC.SoundLib.Noise = function(audio, nextProvider) {
  var audioContext = audio.audio;

  var bufferSize = 2 * audioContext.sampleRate,
      noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate),
      output = noiseBuffer.getChannelData(0);
  for (var i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
  }

  this.play = function(param) {
    var whiteNoise = audioContext.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;
    whiteNoise.start(0);

    whiteNoise.connect(nextProvider._destination);

    return {
      stop: function() {
        whiteNoise.stop();
        whiteNoise.disconnect(nextProvider._destination);
      }
    }
  };

  this.setValue = function() {
  };

  MUSIC.playablePipeExtend(this);
};

MUSIC.SoundLib.Wave = function(path, period) {

  var music = new MUSIC.Context({nooutput: true});
  var sound = music.sound(path);
  var sampleCount = Math.floor(period * music.audio.sampleRate / 1000);
  var dataArray = [];

  // fix race condition using callbacks
  setTimeout(function() {
    var recording = music.record();
    sound.play();

    setTimeout(function(){
      recording.stop();
      recording.getBuffer(function(data) {
        var originalDataArray = data[0];
        for (var i=0; i<sampleCount; i++) {
          dataArray.push(originalDataArray[i]);
        }
      });
    }, period+100);
  }, 500);

  this.f = function(t) {
    if (t<0)return 0;
    var value1 = dataArray[Math.floor(t*sampleCount)];
    return value1;
  };  
};

MUSIC.AudioDestinationWrapper = function(music, audioDestination) {
    this._destination = audioDestination;
    MUSIC.EffectsPipeline.bind(this)(music, this)
};
MUSIC.AudioDestinationWrapper.prototype = Object.create(MUSIC.EffectsPipeline.prototype);

MUSIC.modulator = function(f) {
  var _f = function(modulatorFactory, f) {
    return f(modulatorFactory);
  };

  return {
    apply: function(currentTime, audioParam, music, combineFunc) {
      var modulatorFactory, modulator;
      modulatorFactory = (new MUSIC.AudioDestinationWrapper(music, audioParam)).sfxBase();
      modulatorFactory.audioParamModulation = audioParam;
      modulator = (combineFunc||_f)(modulatorFactory, f);

      return {
        dispose: function() {
          modulatorFactory.prune();
        }
      };
    }
  };
};

(function() {

var len = 128;
var constantArrayBuffer = new Float32Array(len);
for (var i=0; i<len; i++) {
  constantArrayBuffer[i]=1;
};
var buffer1;

MUSIC.SoundLib.Constant = function(music, destination, options) {

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

  var noop = function() {};

  this.setParam = function(paramName, value) {
    if (paramName === 'offset' && !audioContext.createConstantSource) paramName = 'gain';
    value.apply(music.audio.currentTime, constantNode[paramName]);
  };

  this.setParamTarget = function(paramName, target, timeConstant) {
    if (paramName === 'offset' && !audioContext.createConstantSource) paramName = 'gain';
    var audioParam = constantNode[paramName];
    audioParam.cancelScheduledValues(0.0);
    audioParam.setTargetAtTime(target, music.audio.currentTime, timeConstant);
  };

  this.dispose = function() {
    if (audioContext.createConstantSource) {
      constantNode.stop();
    } else {
      bufferSource.stop();
      bufferSource.disconnect(constantNode);
    }
    constantNode.disconnect(destination._destination);

    this.dispose = function() {};
  };

  this.update = function(value) {
    if (audioContext.createConstantSource) {
      constantNode.offset.value = value;
    } else {
      constantNode.gain.value = value;
    }
  };

  this.freq = function(newFreq) {
    var playable = {};

    playable.setFreq = noop;
    playable.reset = noop;
    playable.play = function() {
      return {stop: noop}
    };

    MUSIC.playablePipeExtend(playable);
    return playable;
  };
};

})();

MUSIC.SoundLib.Oscillator = function(music, destination, options) {
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


  this.freq = function(newFreq) {
    var frequency = options.fixed_frequency ? options.fixed_frequency : newFreq

    if (frequency) {
      osc.frequency.value = frequency;
    }    

    var resetd = false;
    var playable = {};
    playable.setFreq = function(frequency, noteOptions) {
      if (options.fixed_frequency) return;

      var tc;

      if (noteOptions && noteOptions.tc) {
        tc = noteOptions.tc;
      } else {
        tc = time_constant||0.1;
        if (resetd) tc = 0.0001;
      }

      osc.frequency.setTargetAtTime(frequency, music.audio.currentTime, tc);
      resetd = false;
    };

    playable.reset = function() {
      resetd = true;
    };

    playable.play = function(param) {
      var nextNode;
      var disposeNode;

      disposeNode = function() {
        if (osc) osc.disconnect(audioDestination);
        osc = null;
      };

      osc.start(0);

      return {
        stop : function() {
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
    this.play = function(param) {
      var wtPosition = options.wtPosition || 0;
      var fcn = options.f;
      var ta = 0;
      var frequency;
      var optionsFrequency = options.frequency;

      if (optionsFrequency.at) {
        frequency = optionsFrequency.at.bind(optionsFrequency);
      } else {
        frequency = function(t){ return optionsFrequency };
      }
      var deltatime = 0;
      var lastTime = 0;
      var tb;

      if (wtPosition.at) {
        var formulaGenerator = new MUSIC.Effects.Formula(music, destination, function(input, t) {
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
        var formulaGenerator = new MUSIC.Effects.Formula(music, destination, function(input, t) {
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
        stop: function() {
          formulaGenerator.disconnect(destination._destination);
        }
      }
    };    
  } else if (options.wave) {
    var newOptions = Object.create(options);
    newOptions.f = options.wave.f;
    MUSIC.SoundLib.Oscillator.bind(this)(music, destination, newOptions);
  } else {

  }

};

MUSIC.Loop = function(playable, times) {
  var original = playable;
  var duration = playable.duration();
  return {
    play: function() {
      var lastPlay;
      var startTime = window.performance.now();
      var lastTime = startTime;
      var currentIteration = 0;

      lastPlay = playable.play();

      var nextIteration = function() {
        var now = window.performance.now();
        if (now - startTime > currentIteration * duration) { // ms
          setTimeout(function(){
              lastPlay = playable.play();
          }, (currentIteration+1) * duration - now)
          currentIteration++;
          if (currentIteration == times-1) {
            clearInterval(inter);
          }
        }
      };

      var inter = setInterval(nextIteration, duration);
      return {
        stop: function() {
          clearInterval(inter)
          if (lastPlay) lastPlay.stop();
        }
      };
    }
  };
};

MUSIC.Silence = function(time) {
  return {
    play : function() {
      return {
        stop: function(){

        }
      }
    },

    duration: function(){return time}
  };
};

})();