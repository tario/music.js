(function() {

var PlayingSong = function(funseq, options) {
  this._context = {playing: [], onStop: options && options.onStop};
  this._funseqHandler = funseq.start(this._context);
};

PlayingSong.prototype.stop = function() {
  this._context.playing.forEach(function(playing) {
    playing.stop();
  });

  this._funseqHandler.stop();

  if (this._context.onStop){
    this._context.onStop();
  }
};

var noPlay = {
  play: function() {
    return {
      stop: function() {}
    };
  }
};

var defaultFromPatterns = function(patterns) {
  return function(patternOrName) {
    if (typeof patternOrName === 'string') return patterns[patternOrName];
    return patternOrName || noPlay;
  };
};

var nullPlay = {stop: function(){}};
var hasScheduleMethod = function(pattern) {
  return !!pattern.schedule;
};

var hasNotScheduleMethod = function(pattern) {
  return !pattern.schedule;
};

MUSIC.Song = function(input, patternsOrOptions, options){
  var patterns;
  if (arguments.length === 2) {
    return MUSIC.Song.bind(this)(input, {}, patternsOrOptions);
  } else {
    patterns = patternsOrOptions;
  }

  options = options || {};
  var getFromPatterns = options.pattern|| defaultFromPatterns(patterns);
  var measure = options.measure || 500;
  var funseq;
  if (!funseq){
    var clock = MUSIC.Utils.Clock(
      window.performance.now.bind(window.performance),
      setInterval,
      clearInterval,
      500);
    funseq = MUSIC.Utils.FunctionSeq(clock, setTimeout, clearTimeout);
  }


  var totalMeasures = input[0].length;

  this._funseq = funseq;
  this._duration = totalMeasures * measure;

  for (var j = 0; j < totalMeasures; j++) {
    (function() {
      var patternArray = [];
      for (var i = 0 ; i < input.length; i++) {
        patternArray.push(input[i][j]);
      };
      var playableArray = patternArray.map(getFromPatterns) 

      var schedulable = playableArray.filter(hasScheduleMethod);
      var notSchedulable = playableArray.filter(hasNotScheduleMethod);

      if (notSchedulable.length > 0) {
        var multiPlayable = new MUSIC.MultiPlayable(notSchedulable);
        var playing = nullPlay;
        var duration = multiPlayable.duration();

        funseq.push({t: j*measure, f: function(context) {
          playing = multiPlayable.play();
          context.playing.push(playing);
        }});
        funseq.push({t: j*measure+duration, f: function(context) {
          playing.stop();
          context.playing = context.playing.filter(function(x){ return x != playing; });
        }});
      }

      schedulable.forEach(function(s) {
        var delayedFunseq = MUSIC.Utils.DelayedFunctionSeq(funseq, j*measure);
        s.schedule(new MUSIC.NoteSequence(delayedFunseq));
      });

    })();
  };

  funseq.push({t: totalMeasures*measure, f: function(context) {
    if (context.onStop) {
      context.onStop();
    }
  }});

};

MUSIC.Song.prototype.duration = function() {
  return this._duration;
};

MUSIC.Song.prototype.play = function(options) {
  return new PlayingSong(this._funseq, options);
};

})();