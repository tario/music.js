(function() {

var PlayingSong = function(funseq, patternContexts, options) {
  this._context = {playing: [], onStop: options && options.onStop};
  this._patternContexts = patternContexts;
  this._funseqHandler = funseq.start(this._context);
};

PlayingSong.prototype.stop = function() {
  if (this._patternContexts && this._patternContexts.length) {
    this._patternContexts.forEach(function(ctx) {
      ctx.stop();
    });
  }

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
  var self = this;

  if (arguments.length === 2) {
    return MUSIC.Song.bind(this)(input, {}, patternsOrOptions);
  } else {
    patterns = patternsOrOptions;
  }

  options = options || {};
  var getFromPatterns = options.pattern|| defaultFromPatterns(patterns);
  var measure = (options.measure || 500) * options.ticks_per_beat;
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

  var byStart = function(a, b) {
    return a.s-b.s;
  };

  // tempo events 
  var bpm_events = [];
  for (var j = 0; j < totalMeasures; j++) {
    var patternArray = [];
    for (var i = 0 ; i < input.length; i++) {
      var pattern = getFromPatterns(input[i][j]);
      if (pattern.bpm_events) {
        var displacedBpmEvents = pattern.bpm_events.map(function(evt) {
          return {n: evt.n, s: evt.s + j*measure, l: evt.l};
        });
        bpm_events = bpm_events.concat(displacedBpmEvents);
      }
    };
  }

  bpm_events = bpm_events.sort(byStart);

  var time = MUSIC.Math.ticksToTime({
    bpm: options.bpm,
    ticks_per_beat: options.ticks_per_beat,
    bpm_events: bpm_events
  });

  this.timeToTicks = function() {
    return MUSIC.Math.timeToTicks({
      bpm: options.bpm,
      ticks_per_beat: options.ticks_per_beat,
      bpm_events: bpm_events
    });
  };

  var timeFunc = function(baseTicks) {
    return function(ticks) {
      return time(baseTicks+ticks);
    };
  };

  this._duration = time(totalMeasures * measure);
  this.songCtx = {};

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
        var scheduleContexts = s.schedule(new MUSIC.NoteSequence(funseq, {
          time: timeFunc(j*measure)
        }), self.songCtx);
        self._patternContexts = (self._patternContexts||[]).concat(scheduleContexts);
      });

    })();
  };

  funseq.push({t: timeFunc(0)(totalMeasures*measure), f: function(context) {
    if (context.onStop) {
      context.onStop();
    }
  }});

};

MUSIC.Song.prototype.duration = function() {
  return this._duration;
};

MUSIC.Song.prototype.play = function(options) {
  if (this.songCtx.referenceInstrument) {
    this.songCtx.sequenceStartTime = this.songCtx.referenceInstrument.currentTime();
  }
  return new PlayingSong(this._funseq,  this._patternContexts, options);
};

})();