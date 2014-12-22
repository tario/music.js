MUSIC = {};

(function() {
MUSIC.SoundLib = MUSIC.SoundLib || {};

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

  ret = {
    output: function() {
      return gainNode;
    },
    disconnect: function() {
      gainNode.disconnect(audioDestination._destination);
    },
    next: function() {
      return audioDestination;
    },
    _destination: gainNode
  };

  MUSIC.effectsPipeExtend(ret, music, ret);
  return ret;
};

MUSIC.effectsPipeExtend = function(obj, audio, audioDestination) {

  obj.oscillator = function(options) {
    return new MUSIC.SoundLib.Oscillator(audio, audioDestination, options);
  };

  obj.noise = function() {
    return new MUSIC.SoundLib.Noise(audio, audioDestination);
  };

  obj.formulaGenerator = function(fcn) {
    return new MUSIC.SoundLib.FormulaGenerator(audio, audioDestination, fcn);
  };

  obj.periodicFormulaGenerator = function(fcn, options) {
    return new MUSIC.SoundLib.PeriodicFormulaGenerator(audio, audioDestination, fcn, options);
  };


  MUSIC.Effects.forEach(function(sfxName, sfxFunction) {
    var method = function(argument) {
      return new sfxFunction(audio, audioDestination, argument);
    };
    obj[sfxName] = method;
  });

  obj.T = function() {
    return MUSIC.T(arguments, audio, audioDestination);
  };

  obj.soundfont = function(param) {
    return new MUSIC.SoundfontInstrument(param, audio, audioDestination);
  };

  obj.sound = function(path) {
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
  };

  if (!obj.getNext) {
    obj.getNext = function() {
      return {
        _destination: obj._destination,
        dispose: function() {
        }
      };
    };
  };

  return obj;
};

var audioContext = new (window.AudioContext || window.webkitAudioContext)();
MUSIC.Context = function() {
  var audio = audioContext;
  var music = this;

  this._destination = audio.destination;
  this.audio = audio;
  this.wrap = function(destination) {
    var ret = {};
    MUSIC.effectsPipeExtend(ret, music, destination);
    return ret;
  };

  var disposable = [];
  this.dispose = function() {
    for (var i=0; i<disposable.length; i++) {
      var obj = disposable[i];
      obj.dispose();
    }
  };

  this.audio = audio;

  this.registerDisposable = disposable.push.bind(disposable);

  MUSIC.effectsPipeExtend(this, music, this);
};

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

MUSIC.SoundLib.PeriodicFormulaGenerator = function(audio, nextProvider, fcn, options) {
  this.play = function(param) {
    var audioDestination;
    var frequency = options.frequency;
    var period = 1.0 / frequency;

    var formulaGenerator = new MUSIC.Effects.Formula(audio, nextProvider, function(input, t) {
      return fcn((t % period) / period);
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

MUSIC.SoundLib.Oscillator = function(music, destination, options) {
  options = options || {};
  var effects = options.effects;
  var frequency = options.frequency;

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
  }

  this.freq = function(newFreq) {
    var newoptions = {type: options.type, frequency: newFreq};
    return new MUSIC.SoundLib.Oscillator(music, destination, newoptions)
  };

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