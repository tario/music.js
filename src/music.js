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

MUSIC.EffectsPipeline = function(audio, audioDestination) {
  this._audio = audio;
  this._audioDestination = audioDestination;
};

MUSIC.EffectsPipeline.prototype = {
  oscillator: function(options) {
    return new MUSIC.SoundLib.Oscillator(this._audio, this._audioDestination, options);
  },

  soundfont: function(param) {
    return new MUSIC.SoundfontInstrument(param, this._audio, this._audioDestination);
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
    return new MUSIC.SoundLib.FormulaGenerator(this._audio, this._audioDestination, fcn);
  },

  T: function() {
    return new MUSIC.T(arguments, this._audio, this._audioDestination);
  },

  noise: function() {
    return new MUSIC.SoundLib.Noise(this._audio, this._audioDestination);
  }
};


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
    return fcn(this._audio, this._audioDestination, value);
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

  var disposable = [];
  this.dispose = function() {
    for (var i=0; i<disposable.length; i++) {
      var obj = disposable[i];
      obj.dispose();
    }
  };

  this.record = function() {
    var rec = new Recorder(gainNode, {workerPath: "lib/recorder/recorderWorker.js"});

    rec.record();
    return rec;
  };

  this.audio = audio;

  this.registerDisposable = disposable.push.bind(disposable);
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
      var frequency = options.frequency;
      var period = 1.0 / frequency;
      var wtPosition = options.wtPosition || 0;
      var fcn = options.f;

      if (wtPosition.at) {
        var formulaGenerator = new MUSIC.Effects.Formula(music, destination, function(input, t) {
          var ta = ((wtPosition.at(t) + t) % period) / period;
          if (ta < 0) ta++;
          return fcn(ta);
        });
      } else {
        var formulaGenerator = new MUSIC.Effects.Formula(music, destination, function(input, t) {
          var ta = ((wtPosition + t) % period) / period;
          if (ta < 0) ta++;
          return fcn(ta);
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