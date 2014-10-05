MUSIC.Effects = MUSIC.Effects || {};

var effectsObject = {};
MUSIC.Effects.register = function(effectName, fcn) {
  effectsObject[effectName] = fcn;
};

MUSIC.Effects.forEach = function(cb) {
  for (var sfx in effectsObject) {
    cb(sfx, effectsObject[sfx]);
  }
};

MUSIC.Effects.WebAudioNodeWrapper = function (audio, audioNode, next) {

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

  this.output = function() {
    return audioNode;
  };

  this.setParam = function(paramName, value) {
    value.apply(audio.currentTime, audioNode[paramName]);
  };

  MUSIC.effectsPipeExtend(this, audio, this);
};

MUSIC.Effects.Formula = function(audio, next, fcn) {
  var scriptNode = audio.createScriptProcessor(1024, 1, 1);

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
        outputData[sample] = fcn(inputData[sample]);
      }
    }
  }

  setTimeout(function() { // this hack prevents a bug in current version of chrome
    scriptNode.connect(next._destination);
  });

  this._destination = scriptNode;
  
  MUSIC.effectsPipeExtend(this, audio, this);

  this.next = function() {
    return next;
  };

  this.disconnect = function() {
    scriptNode.disconnect(next._destination);
  };

  this.output = function() {
    return scriptNode;
  };
}

MUSIC.Effects.register("formula", MUSIC.Effects.Formula);
MUSIC.Effects.register("attenuator", function(audio, next, factor) {
  MUSIC.Effects.Formula.bind(this)(audio, next, function(input) {
    return input * factor();
  });
});

MUSIC.Effects.register("lowpass", function(audio, next, freq) {
  var biquadFilter = audio.createBiquadFilter();

  biquadFilter.type = "lowpass";
  biquadFilter.frequency.value = freq;
  biquadFilter.gain.value = 25;

  MUSIC.Effects.WebAudioNodeWrapper.bind(this)(audio, biquadFilter, next);
});

MUSIC.Effects.register("gain", function(audio, next, value) {
  var gainNode = audio.createGain();
  gainNode.gain.value = value;
  MUSIC.Effects.WebAudioNodeWrapper.bind(this)(audio, gainNode, next);
});

MUSIC.Effects.register("delay", function(audio, next, value) {
  var delayNode = audio.createDelay(60);
  delayNode.delayTime.value = value;
  MUSIC.Effects.WebAudioNodeWrapper.bind(this)(audio, delayNode, next);
});

MUSIC.Effects.register("reverb", function(audio, next, options) {
  var delayNode = audio.createDelay(60);
  delayNode.delayTime.value = options.delay || 0.02;

  var channelMergerNode = audio.createChannelMerger(2);

  var gainNode = audio.createGain();
  gainNode.gain.value = 1.0;

  var att = audio.createGain();
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

  this.output = function() {
    return audioNode;
  };

  this.setParam = function(paramName, value) {
    value.apply(audio.currentTime, audioNode[paramName]);
  };

  MUSIC.effectsPipeExtend(this, audio, this);
});

MUSIC.Curve = {};
var during = function(array) {
  return function(time) {
    return { 
      apply: function(currentTime, audioParam) {
        audioParam.setValueCurveAtTime(array, currentTime, time);
      }
    };
  };
};

MUSIC.Curve.Ramp = function(initValue, endValue, n) {
  var array = new Float32Array(n);
  for (var i = 0; i < n; i++ ) {
    array[i] = (initValue + (endValue - initValue) * i / n);
  };

  this.during = during(array);
};
