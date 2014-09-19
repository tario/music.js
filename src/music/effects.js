MUSIC.Effects = MUSIC.Effects || {};

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
    scriptNode.connect(next);
  });

  this._destination = scriptNode;
  
  MUSIC.effectsPipeExtend(this, audio, scriptNode);

  this.output = function() {
    return scriptNode;
  };
};

MUSIC.Effects.Attenuator = function(audio, next, factor) {
  MUSIC.Effects.Formula.bind(this)(audio, next, function(input) {
    return input * factor();
  });
};

MUSIC.Effects.Noise = function(audio, next, noiseweight) {
  MUSIC.Effects.Formula.bind(this)(audio, next, function(input) {
    return input * noiseweight * Math.random() + input * (1 - noiseweight);
  });
};