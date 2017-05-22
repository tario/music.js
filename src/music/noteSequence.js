(function() {

MUSIC.NoteSequence = function(funseq) {
  var clock;
  if (!funseq){
    clock = MUSIC.Utils.Clock(
      window.performance.now.bind(window.performance),
      setInterval,
      clearInterval,
      500);
    funseq = MUSIC.Utils.FunctionSeq(clock, setTimeout, clearTimeout);
  }

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

MUSIC.NoteSequence.prototype.paddingTo = function(time){
  this._totalduration = time;
};

MUSIC.NoteSequence.prototype.padding = function(time){
  this._totalduration = this._totalduration + time;
};

MUSIC.NoteSequence.prototype.pushCallback = function(array){
  var startTime = array[0];
  var f = array[1];
  this._funseq.push({t:startTime, f: f});
};

MUSIC.NoteSequence.prototype.push = function(array, baseCtx){
  var noteNum = array[0];
  var startTime = array[1];
  var duration = array[2];

  if (duration <= 0) {
    // negative or zero duration events are ignored
    return;
  }

  this._noteid++;
  var mynoteid = this._noteid;

  if (baseCtx) {
    if (this._contextList.indexOf(baseCtx)===-1) {
      this._contextList.push(baseCtx);
    }
  }

  this._funseq.push({t:startTime, f: function(param){
    var ctx = baseCtx || param;
    var playing;
    playing = ctx.instrument.note(noteNum);
    ctx.setPlaying(mynoteid, playing);
  }});
  this._funseq.push({t:startTime + duration, f: function(param){
    var ctx = baseCtx || param;
    ctx.unsetPlaying(mynoteid);
  }});

  if (startTime + duration > this._totalduration) this._totalduration = startTime + duration;
};

MUSIC.NoteSequence.prototype.makePlayable = function(instrument) {
  return new MUSIC.NoteSequence.Playable(this, instrument, this._totalduration, this._contextList);
};

MUSIC.NoteSequence.context = function(instrument, subctx) {
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

  return {
    setPlaying: setPlaying,
    unsetPlaying: unsetPlaying,
    instrument: instrument,
    stop: stop
  };
};

})();