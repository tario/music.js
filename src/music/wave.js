(function() {
  MUSIC = MUSIC ||{};

  MUSIC.Types.register("function", function(wave) {
    if (typeof wave.at === "function") {
      return wave.at.bind(wave);
    }
  });

  MUSIC.Types.register("function", function(fcn) {
    if (typeof fcn === "function") {
      return fcn;
    }
  });

  MUSIC.Types.register("wave", function(fcn) {
    if (typeof fcn === "function") {
      return new MUSIC.Wave.FunctionWave(fcn);
    }
  });

  MUSIC.Types.register("wave", function(wave) {
    if (typeof wave.at === "function") {
      return wave;
    }
  });


  var twopi = Math.PI*2;
  MUSIC.Wave = {};

  var waveTransform = function(fcn) {
    return function() {
      var wave = this;
      return {
        at: function(t) {
          wave.at(fcn(t));
        }
      };
    }
  };
  var waveOps = {
    reverse: waveTransform(function(t){return t-1; }),
    scale: function(factor) {
      var wave = this;
      return new MUSIC.Wave.FunctionWave(function(t) {
        return wave.at(t*factor);
      }); 
    },
    translate: function(disp) {
      var wave = this;
      return new MUSIC.Wave.FunctionWave(function(t) {
        return wave.at(t+disp);
      });
    },
    table: function(options) {
      return new MUSIC.Wave.Table(this, options);
    },
    combine: function(otherWave, otherFactor) {
      var thisWave = this;
      otherFactor = otherFactor || 0.5;
      var thisFactor = 1-otherFactor;
      otherWave = MUSIC.Types.cast("wave", otherWave);
      return new MUSIC.Wave.FunctionWave(function(t) {
        return otherWave.at(t) * otherFactor + thisWave.at(t) * thisFactor;
      });
    }
  };

  var defaultInterpolation = function(table){
    var length = table.length;
    return function(t) {
      var index = Math.floor(t*table.length)
      return table[index];
    };
  };

  MUSIC.Wave.Table = function(wave, options) {
    options = options || {};
    var sampleCount = options.samples || 100;
    var interpolation = options.interpolation || defaultInterpolation;

    var sample = [];
    for (var i=0; i<sampleCount; i++) {
      sample[i] = wave.at(i/sampleCount);
    }

    this.at = interpolation(sample);
  };
  MUSIC.Wave.Table.prototype = waveOps;

  MUSIC.Wave.FunctionWave = function(fcn) {
    this.at = fcn;
  };
  MUSIC.Wave.FunctionWave.prototype = waveOps;


  MUSIC.Wave.sine = new MUSIC.Wave.FunctionWave(function(t) {
      return Math.sin(twopi*t);
  });

  MUSIC.Wave.square = function(options) {
    options = options || {};
    var dutyCycle = options.dutyCycle || 0.5;
    var dutyLevel = options.dutyLevel || 1;
    var offLevel = options.offLevel || -1;
    return new MUSIC.Wave.FunctionWave(function(t) {
      if (t<dutyCycle){
        return dutyLevel
      } else {
        return offLevel;
      }
    });
  };

  MUSIC.Wave.triangle = new MUSIC.Wave.FunctionWave(function(t) {
    var t2 = t-0.25;
    if (t2<0) t2++;
    if (t2<0.5) {
      return 1-t2*4;
    } else {
      return -1+(t2-0.5)*4;
    }
  });

  MUSIC.Wave.sawtooth = new MUSIC.Wave.FunctionWave(function(t) {
    return t*2-1;
  });

})();

