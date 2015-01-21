MUSIC.Effects = MUSIC.Effects || {};

var LemonadePlayable = function(music, destination, outputFcn, ops) {
  this._destination = destination;
  this._music = music;
  this._ops = ops;
  this._output = outputFcn;
};

LemonadePlayable.prototype.play = function() {
  var destination = this._destination;
  var ops = this._ops;
  var opsLength = ops.length;
  var signalArray = [];
  var phaseArray = [];


  for (var i=0; i<opsLength; i++) {
    signalArray[i] = 0;
    phaseArray[i] = 0;
  }

  var lastT = 0;
  var outputFcn = this._output;
  var formulaGenerator = new MUSIC.Effects.Formula(this._music, destination, function(input, t) {
    var deltay = t-lastT;
    for (var i=0; i<opsLength; i++) {
      lastT = t;
      // EULER
      phaseArray[i] = phaseArray[i] + deltay * ops[i].frequency.apply(null, signalArray);

      var phase = phaseArray[i] % 1;
      if (phase < 0) phase++;
      signalArray[i] = ops[i].wave(phase)
    };

    return outputFcn.apply(null, signalArray);
  });
  return {
    stop: function() {
      formulaGenerator.disconnect(destination._destination);
    }
  };
};

MUSIC.playablePipeExtend(LemonadePlayable.prototype);

MUSIC.Effects.register("lemonade", function(music, next, options) {
  return new LemonadePlayable(music, next._audioDestination, options.output, options.ops);
});