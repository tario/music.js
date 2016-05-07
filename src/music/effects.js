MUSIC.Effects = MUSIC.Effects || {};

var effectsObject = {};
MUSIC.Effects.forEach = function(cb) {
  for (var sfx in effectsObject) {
    cb(sfx, effectsObject[sfx]);
  }
};

MUSIC.Effects.WebAudioNodeWrapper = function (music, audioNode, next, onDispose) {

  this._destination = audioNode;
  setTimeout(function() { // this hack prevents a bug in current version of chrome
    audioNode.connect(next._destination);
  });

  this.next = function() {
    return next;
  };

  var disconnected = false;
  this.disconnect = function() {
    if (disconnected) return;
    if (onDispose) onDispose();
    disconnected = true;
    audioNode.disconnect(next._destination);
  };

  this.dispose = this.disconnect;

  this.output = function() {
    return audioNode;
  };

  this.setParam = function(paramName, value) {
    value.apply(music.audio.currentTime, audioNode[paramName]);
  };

  this.record = function() {
    var rec = new Recorder(audioNode, {workerPath: "lib/recorder/recorderWorker.js"});

    rec.record();
    return rec;
  };

  MUSIC.EffectsPipeline.bind(this)(music, this);
};
MUSIC.Effects.WebAudioNodeWrapper.prototype = Object.create(MUSIC.EffectsPipeline.prototype);

MUSIC.Effects.Formula = function(music, next, fcn) {
  var scriptNode = music.audio.createScriptProcessor(1024, 1, 1);
  var iteration = 0;
  var sampleRate = music.audio.sampleRate;

  scriptNode.onaudioprocess = function(audioProcessingEvent) {
    // The input buffer is the song we loaded earlier
    var inputBuffer = audioProcessingEvent.inputBuffer;

    // The output buffer contains the samples that will be modified and played
    var outputBuffer = audioProcessingEvent.outputBuffer;

    // Loop through the output channels (in this case there is only one)
    for (var channel = 0; channel < outputBuffer.numberOfChannels; channel++) {
      var inputData = inputBuffer.getChannelData(channel);
      var outputData = outputBuffer.getChannelData(channel);

      // Loop through the 4096 samples
      for (var sample = 0; sample < inputBuffer.length; sample++) {
        // make output equal to the same as the input
        outputData[sample] = fcn(inputData[sample], (inputBuffer.length * iteration + sample) / sampleRate);
      }
    }

    iteration++;
  }

  setTimeout(function() { // this hack prevents a bug in current version of chrome
    scriptNode.connect(next._destination);
  });

  this._destination = scriptNode;
  
  MUSIC.EffectsPipeline.bind(this)(music, this);

  this.next = function() {
    return next;
  };

  var disconnected = false;
  this.disconnect = function() {
    if (disconnected) return;
    disconnected = true;
    scriptNode.disconnect(next._destination);
  };

  this.dispose = this.disconnect;

  this.update = function(_f) {
    fcn = _f;
  };

  this.output = function() {
    return scriptNode;
  };
}
MUSIC.Effects.Formula.prototype = Object.create(MUSIC.EffectsPipeline.prototype);


MUSIC.Effects.register("formula", function(music, next, fcn) {
  return new MUSIC.Effects.Formula(music, next, fcn)
});


MUSIC.Effects.BiQuad = function(music, next, options) {
  var biquadFilter = music.audio.createBiquadFilter();
  var gainModulation = nodispose;
  var qModulation = nodispose;
  var frequencyModulation = nodispose;
  var detuneModulation = nodispose;

  var biquadType = options.type;

  this.update = function(options) {
    biquadFilter.type = biquadType;

    var assignParam = function(orig, audioParam) {
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

  MUSIC.Effects.WebAudioNodeWrapper.bind(this)(music, biquadFilter, next, function() {
    gainModulation.dispose();
    qModulation.dispose();
    frequencyModulation.dispose();
    detuneModulation.dispose();
  });
};
MUSIC.Effects.BiQuad.prototype = Object.create(MUSIC.Effects.WebAudioNodeWrapper.prototype);

MUSIC.Effects.register("biquad", MUSIC.Effects.BiQuad);
["lowpass", "highpass", "bandpass", "lowshelf", "highshelf", "peaking", "notch", "allpass"]
  .forEach(function(filterName) {
    MUSIC.Effects.register(filterName, function(music, next, options) {
      return new MUSIC.Effects.BiQuad(music, next, {type: filterName, frequency: options.frequency, Q: options.Q, detune: options.detune});
    });
  });

var canMutate = function(obj, updateFcn) {
  obj.update = function(value) {
    updateFcn(value);
    return obj;
  };
  return obj;
};

var nodispose = {
  dispose: function(){}
};

MUSIC.Effects.register("gain", function(music, next, value) {
  var gainNode = music.audio.createGain();
  var volumeModulation = nodispose;

  return canMutate(
    new MUSIC.Effects.WebAudioNodeWrapper(music, gainNode, next, function() {
      volumeModulation.dispose();
    }),
    function(value) {
      volumeModulation.dispose();

      if (value.apply) {
        gainNode.gain.value = 0.0;
        volumeModulation = value.apply(music.audio.currentTime, gainNode.gain, music);
      } else {
        volumeModulation = nodispose;
        gainNode.gain.value = value;
      }
    }
  ).update(value);
});

MUSIC.Effects.register("delay", function(music, next, value) {
  var delayNode = music.audio.createDelay(60);
  var delayModulation = nodispose;

  return canMutate(
    new MUSIC.Effects.WebAudioNodeWrapper(music, delayNode, next, function() {
      delayModulation.dispose();
    }),
    function(value) {
      delayModulation.dispose();

      if (value.apply) {
        delayModulation = value.apply(music.audio.currentTime, delayNode.delayTime, music);
      } else {
        delayModulation = nodispose;
        delayNode.delayTime.value = value;
      }
    }
  ).update(value);
});

var Echo = function(music, next, options) {
  this.update = function(options) {
    delayNode.delayTime.value = options.delay || 0.02;
    att.gain.value = options.gain === 0  ? 0 : (options.gain||0.2);

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

  setTimeout(function() {
    gainNode.connect(gainNode2);
    gainNode.connect(delayNode);
    delayNode.connect(att);
    gainNode2.connect(next._destination);
    gainNode2.connect(delayNode);
    att.connect(gainNode2);
  });

  this._destination = gainNode;


  this.next = function() {
    return next;
  };

  var disconnected = false;
  this.disconnect = function() {
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

  this.output = function() {
    return audioNode;
  };

  this.setParam = function(paramName, value) {
    value.apply(music.audio.currentTime, audioNode[paramName]);
  };

  MUSIC.EffectsPipeline.bind(this)(music, this);
};
Echo.prototype = Object.create(MUSIC.EffectsPipeline.prototype);

MUSIC.Effects.register("echo", function(music, next, options) {
  return new Echo(music, next, options);
});

MUSIC.Curve = function(array) {
  this.during = during(array);
};

MUSIC.Curve.concat = function(c1, time1, c2, time2, n) {
  var time = time1 + time2;
  if (!n) {
    n=Math.floor(time*100)+1;
  }

  var at = function(t) {
    if (t < time1){
      return c1.at(t); 
    } else {
      return c2.at(t-time1);
    }
  };

  var array = new Float32Array(n+1);
  for (var i = 0; i < n+1; i++ ) {
    array[i] = at(time * (i / n));
  };

  return {
    apply: function(currentTime, audioParam) {
      audioParam.setValueCurveAtTime(array, currentTime, time)
    },

    at: at
  };
};

var during = function(fcn, n) {
  return function(time) {
    if (!n) {
      n=Math.floor(time*100)+1;
    }

    var array = new Float32Array(n+1);
    for (var i = 0; i < n+1; i++ ) {
      array[i] = fcn(i / n);
    };

    return { 
      apply: function(currentTime, audioParam) {
        audioParam.setValueCurveAtTime(array, currentTime, time);
      },

      at: function(t) {
        return fcn(t/time);
      }
    };
  };
};


MUSIC.Curve.Formula = function(fcn, n) {
  this.during = during(fcn, n);
}

MUSIC.Curve.Ramp = function(initValue, endValue, n) {
  MUSIC.Curve.Formula.bind(this)(function(t){return initValue + (endValue - initValue)*t;}, n);
};

MUSIC.Curve.Periodic = function(fcn, frequency) {
  var ta = 0;
  var delayTime;
  var lastTime = 0;
  var deltatime;
  var tb;
  var period = 1.0 / frequency;
  if (frequency.at) {
    this.at = function(t) {
      deltatime = t - lastTime;
      ta += deltatime * frequency.at(t);
      ta = ta % 1;

      lastTime = t;
      return fcn(ta);
    };
  } else {
    this.at = function(t) {
      ta = (t % period) / period;
      if (ta < 0) ta++;
      return fcn(ta);
    };
  }
};

MUSIC.Effects.register("ADSR", function(music, next, options) {
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

  var gainNode = next
              .gain(sustainLevel);

  gainNode.setParam('gain', startCurve);
  
  return nextNodeFcn(gainNode)
    .onStop(function(){ gainNode.dispose(); }) // dispose gain node
    .stopDelay(releaseTime * 1000)
    .onStop(function(){ 
      var currentLevel = gainNode._destination.gain.value;
      var releaseCurve = new MUSIC.Curve.Ramp(currentLevel, 0.0, samples).during(releaseTime)
      gainNode.setParam('gain', releaseCurve); 
    }); // set gain curve

});

MUSIC.Effects.register("stopCurve", function(music, next, options) {
  options = options || {};
  var samples = options.samples || 100;
  var duration = options.duration || 0.4;
  var nextNodeFcn = options.node;
  var stopCurve = new MUSIC.Curve.Ramp(1.0, 0.0, samples).during(duration);
  var gainNode = next
              .gain(1.0);
  
  return nextNodeFcn(gainNode)
    .onStop(function(){ gainNode.dispose(); }) // dispose gain node
    .stopDelay(duration * 1000)
    .onStop(function(){ gainNode.setParam('gain', stopCurve); }); // set gain curve

});

