MUSIC.Effects = MUSIC.Effects || {};

var effectsObject = {};
MUSIC.Effects.forEach = function(cb) {
  for (var sfx in effectsObject) {
    cb(sfx, effectsObject[sfx]);
  }
};

MUSIC.Effects.WebAudioNodeWrapper = function (music, audioNode, next) {

  this._destination = audioNode;
  setTimeout(function() { // this hack prevents a bug in current version of chrome
    audioNode.connect(next._destination);
  });

  this.next = function() {
    return next;
  };

  this.disconnect = function() {
    audioNode.disconnect(next._destination);
  };

  this.dispose = this.disconnect;
  music.registerDisposable(this);

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

  this.disconnect = function() {
    scriptNode.disconnect(next._destination);
  };

  this.dispose = this.disconnect;
  music.registerDisposable(this);  

  this.output = function() {
    return scriptNode;
  };
}
MUSIC.Effects.Formula.prototype = Object.create(MUSIC.EffectsPipeline.prototype);


MUSIC.Effects.register("formula", function(music, next, fcn) {
  return new MUSIC.Effects.Formula(music, next, fcn)
});

MUSIC.Effects.register("attenuator", function(music, next, factor) {
  MUSIC.Effects.Formula.bind(this)(music, next, function(input) {
    return input * factor();
  });
});

MUSIC.Effects.BiQuad = function(music, next, options) {
  var biquadFilter = music.audio.createBiquadFilter();

  biquadFilter.type = options.type;

  if (options.frequency.apply) {
    options.frequency.apply(music.audio.currentTime, biquadFilter.frequency);
  } else {
    biquadFilter.frequency.value = options.frequency;
  }

  if (options.Q) biquadFilter.Q.value = options.Q;
  if (options.gain) biquadFilter.gain.value = options.gain;

  MUSIC.Effects.WebAudioNodeWrapper.bind(this)(music, biquadFilter, next);
};
MUSIC.Effects.BiQuad.prototype = Object.create(MUSIC.Effects.WebAudioNodeWrapper.prototype);

MUSIC.Effects.register("biquad", MUSIC.Effects.BiQuad);
["lowpass", "highpass", "bandpass", "lowshelf", "highshelf", "peaking", "notch", "allpass"]
  .forEach(function(filterName) {
    MUSIC.Effects.register(filterName, function(music, next, options) {
      return new MUSIC.Effects.BiQuad(music, next, {type: filterName, frequency: options.frequency});
    });
  });

MUSIC.Effects.register("gain", function(music, next, value) {
  var gainNode = music.audio.createGain();
  gainNode.gain.value = value;
  return new MUSIC.Effects.WebAudioNodeWrapper(music, gainNode, next);
});

MUSIC.Effects.register("delay", function(music, next, value) {
  var delayNode = music.audio.createDelay(60);
  delayNode.delayTime.value = value;
  return new MUSIC.Effects.WebAudioNodeWrapper(music, delayNode, next);
});

var Echo = function(music, next, options) {
  var delayNode = music.audio.createDelay(60);
  delayNode.delayTime.value = options.delay || 0.02;

  var channelMergerNode = music.audio.createChannelMerger(2);

  var gainNode = music.audio.createGain();
  gainNode.gain.value = 1.0;

  var att = music.audio.createGain();
  att.gain.value = options.gain || 0.2;

  setTimeout(function() {
    gainNode.connect(channelMergerNode);
    gainNode.connect(delayNode);
    delayNode.connect(channelMergerNode);
    channelMergerNode.connect(next._destination);
    channelMergerNode.connect(att);
    att.connect(delayNode);
  });

  this._destination = gainNode;


  this.next = function() {
    return next;
  };

  this.disconnect = function() {
    gainNode.disconnect(channelMergerNode);
    gainNode.disconnect(delayNode);
    delayNode.disconnect(channelMergerNode);
    channelMergerNode.disconnect(next._destination);
    channelMergerNode.disconnect(att);
    att.disconnect(delayNode);
  };

  this.dispose = this.disconnect;
  music.registerDisposable(this);    

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

  var array = new Float32Array(n);
  for (var i = 0; i < n; i++ ) {
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

    var array = new Float32Array(n);
    for (var i = 0; i < n; i++ ) {
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

MUSIC.Effects.register("ADSR", function(music, next, options) {
  options = options || {};
  var samples = options.samples || 100;
  var attackTime = options.attackTime || 0.1;
  var decayTime = options.decayTime || 0.1;
  var sustainLevel = options.sustainLevel || 0.8;
  var releaseTime = options.releaseTime || 0.1;

  var nextNodeFcn = options.node;
  var releaseCurve = new MUSIC.Curve.Ramp(sustainLevel, 0.0, samples).during(releaseTime);
  var attackCurve = new MUSIC.Curve.Ramp(0.0, 1.0, samples).during(attackTime);
  var decayCurve = new MUSIC.Curve.Ramp(1.0, sustainLevel, samples).during(decayTime);
  var startCurve = MUSIC.Curve.concat(attackCurve, attackTime, decayCurve, decayTime);

  var gainNode = next
              .gain(sustainLevel);

  gainNode.setParam('gain', startCurve);
  
  return nextNodeFcn(gainNode)
    .onStop(function(){ gainNode.dispose(); }) // dispose gain node
    .stopDelay(releaseTime * 1000)
    .onStop(function(){ gainNode.setParam('gain', releaseCurve); }); // set gain curve

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

