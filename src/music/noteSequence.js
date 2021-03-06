(function() {

MUSIC.NoteSequence = function(funseq, options) {
  var clock;
  var songCtx = options && options.songCtx;

  if (!funseq){
    clock = MUSIC.Utils.Clock(
      window.performance.now.bind(window.performance),
      setInterval,
      clearInterval,
      500);
    funseq = MUSIC.Utils.FunctionSeq(clock, setTimeout, clearTimeout);
    funseq.push({t: 0, f: function() {
      if (songCtx.referenceInstrument) {
        songCtx.sequenceStartTime = songCtx.referenceInstrument.currentTime();
      }
    }, externalSchedule: true});
  }

  this._time = options && options.time;
  this._funseq = funseq;
  this._totalduration = 0;
  this._noteid = 0;
  this._contextList = [];
};

MUSIC.NoteSequence.Playable = function(noteseq, instrument, duration, contextList) {
  this._noteseq = noteseq;
  this._instrument = instrument;
  this._duration = duration;
  this._contextList = contextList || [];
};

MUSIC.NoteSequence.Playable.prototype.loop = function(times) {
  return MUSIC.Loop(this, times);
};

MUSIC.NoteSequence.Playable.prototype.duration = function() {
  return this._duration;
};

MUSIC.NoteSequence.Playable.prototype.play = function(options) {
  var context = MUSIC.NoteSequence.context(this._instrument, this._contextList);
  this._runningFunSeq = this._noteseq._funseq.start(context);
  return new MUSIC.NoteSequence.Playing(this._runningFunSeq, context);
};

MUSIC.NoteSequence.Playing = function(runningFunSeq, ctx) {
  this._runningFunSeq = runningFunSeq;
  this._context = ctx;
};

MUSIC.NoteSequence.Playing.prototype.stop = function() {
  if (this._context.playing) this._context.playing.stop();
  this._context.stop();
  this._runningFunSeq.stop();
};

MUSIC.NoteSequence.prototype.paddingTo = function(ticks){
  this._totalduration = this._time(ticks);
};

MUSIC.NoteSequence.prototype.padding = function(time){
  this._totalduration = this._totalduration + time;
};

MUSIC.NoteSequence.prototype.pushCallback = function(array){
  var startTime = this._time(array[0]);
  if (startTime < 0) return;

  var f = array[1];
  this._funseq.push({t:startTime, f: f});
};

MUSIC.NoteSequence.prototype.push = function(array, baseCtx){
  var noteNum = array[0];
  var startTime = this._time(array[1]);
  var duration = this._time(array[1]+array[2]) - startTime;

  if (startTime < 0) {
    if (startTime + duration < 0) {
      return;
    } else {
      duration = duration + startTime;
      startTime = 0;
    }
  }

  var options = array[3];

  this._noteid++;
  var mynoteid = this._noteid;

  if (baseCtx) {
    if (this._contextList.indexOf(baseCtx)===-1) {
      this._contextList.push(baseCtx);
    }
  }

  if (baseCtx && baseCtx.instrument && baseCtx.instrument.schedule_note) {
    if (baseCtx.instrument.currentTime) {
      baseCtx.songCtx.referenceInstrument = baseCtx.instrument;
    }

    this._funseq.push({t:startTime, f: function(param) {
      var playing = baseCtx.instrument.schedule_note(
        noteNum,
        options,
        baseCtx.sequenceStartTime() + startTime/1000,
        duration/1000);

      baseCtx.setPlaying(mynoteid, playing);
    }, externalSchedule: true});
  } else {

    console.warn("UNSUPPORTED WEBAUDIO SCHEDULE FOR note n=" + noteNum + " at " + startTime + " (fallback to setTimeout)");

    this._funseq.push({t:startTime, f: function(param){
      var ctx = baseCtx || param;
      if (!ctx.instrument.note) return;
      var playing = ctx.instrument.note(noteNum, options);
      ctx.setPlaying(mynoteid, playing);
    }});
    this._funseq.push({t:startTime + duration, f: function(param){
      var ctx = baseCtx || param;
      ctx.unsetPlaying(mynoteid);
    }});
  }

  if (startTime + duration > this._totalduration) this._totalduration = startTime + duration;
};

MUSIC.NoteSequence.prototype.makePlayable = function(instrument) {
  return new MUSIC.NoteSequence.Playable(this, instrument, this._totalduration, this._contextList);
};

MUSIC.NoteSequence.context = function(instrument, subctx, songCtx) {
  var playingNotes = {};
  var setPlaying = function(noteid, p) {
    playingNotes[noteid] = p.play();
  };
  var unsetPlaying = function(noteid) {
    var playing = playingNotes[noteid]; 
    if (playing) {
      playing.stop();
      delete playingNotes[noteid];
    }
  };

  var stop = function() {
    if (subctx) {
      for (var i=0; i<subctx.length; i++) {
        subctx[i].stop();
      }
    }

    for (var noteid in playingNotes) {
      playingNotes[noteid].stop();
    }

    playingNotes = {};
  };

  var sequenceStartTime = function() {
    if (!songCtx.sequenceStartTime) {
      songCtx.sequenceStartTime = this.instrument.currentTime();
    }

    return songCtx.sequenceStartTime;
  };

  return {
    sequenceStartTime: sequenceStartTime,
    setPlaying: setPlaying,
    unsetPlaying: unsetPlaying,
    instrument: instrument,
    stop: stop,
    songCtx: songCtx
  };
};

})();