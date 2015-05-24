MUSIC = {};

(function() {
MUSIC.SoundLib = MUSIC.SoundLib || {};
MUSIC.Effects = MUSIC.Effects || {};
MUSIC.Types = new TypeCast();


var getTemporalPipeline = function(effectsFcn, next, param) {
  var nextNode = effectsFcn(next, param);
  return {
    _destination: nextNode._destination,
    dispose: function() {
      var x = nextNode;
      while (1) {
        x.disconnect();
        x = x.next();
        if (x === next) {
          break;
        }
      };
      disposeNode = null;
    }
  };

};

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
    ret.prune = sfxPrune;
    return ret;
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

  T: function() {
    return this._wrapFcn(new MUSIC.T(arguments, this._audio, this._audioDestination));
  },

  noise: function() {
    return this._wrapFcn(new MUSIC.SoundLib.Noise(this._audio, this._audioDestination));
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

  this.disconnect = function() {
    gainNode.disconnect(audioDestination._destination);
    api.cancel();
  };

  this.dispose = this.disconnect;

  this._destination = gainNode;
  this.next = function() {
    return audioDestination;
  };

  music.registerDisposable(this);  
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

  this.record = function() {
    var rec = new Recorder(gainNode, {workerPath: "lib/recorder/recorderWorker.js"});

    rec.record();
    return rec;
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

MUSIC.SoundLib.Noise = function(audio, nextProvider) {
  this.play = function(param) {
    var audioDestination;
    var noiseGenerator = new MUSIC.Effects.Formula(audio, nextProvider, function() {
      return Math.random();
    });

    return {
      stop: function() {
        noiseGenerator.disconnect(nextProvider._destination);
      }
    }
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

MUSIC.SoundLib.Oscillator = function(music, destination, options) {
  options = options || {};
  var effects = options.effects;
  var frequency = options.frequency;

  this.freq = function(newFreq) {
    var newoptions = {type: options.type, wave: options.wave, f: options.f, frequency: newFreq};
    return new MUSIC.SoundLib.Oscillator(music, destination, newoptions)
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
    this.play = function(param) {
      var osc;
      var nextNode;
      var disposeNode;
      var audioDestination;

      osc = music.audio.createOscillator();

      if (frequency.apply) {
        frequency.apply(music.audio.currentTime, osc.frequency);
      } else {
        osc.frequency.value = frequency;
      }

      osc.type = options.type;

      nextNode = destination;
      audioDestination = nextNode._destination;
      disposeNode = function() {
        osc.disconnect(audioDestination);
      };
      osc.connect(audioDestination);
      osc.start(0);

      return {
        stop : function() {
          osc.stop(0);
          disposeNode();
        }
      };
    };
  }

  MUSIC.playablePipeExtend(this);
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