MUSIC.Effects = MUSIC.Effects || {};

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
};

MUSIC.Effects.Attenuator = function(audio, next, factor) {
  MUSIC.Effects.Formula.bind(this)(audio, next, function(input) {
    return input * factor();
  });
};

MUSIC.Effects.LowPass = function(audio, next, freq, gain) {
  var biquadFilter = audio.createBiquadFilter();

  biquadFilter.type = "lowpass";
  biquadFilter.frequency.value = freq;
  biquadFilter.gain.value = gain || 25;

  MUSIC.Effects.WebAudioNodeWrapper.bind(this)(audio, biquadFilter, next);
};

MUSIC.Effects.Gain = function(audio, next, value) {
  var gainNode = audio.createGain();
  gainNode.gain.value = value;
  MUSIC.Effects.WebAudioNodeWrapper.bind(this)(audio, gainNode, next);
};