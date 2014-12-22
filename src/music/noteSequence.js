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
};

MUSIC.NoteSequence.Playable = function(noteseq, context, duration) {
  this._noteseq = noteseq;
  this._context = context;
  this._duration = duration;
};

MUSIC.NoteSequence.Playable.prototype.loop = function(times) {
  return MUSIC.Loop(this, times);
};

MUSIC.NoteSequence.Playable.prototype.duration = function() {
  return this._duration;
};

MUSIC.NoteSequence.Playable.prototype.play = function() {
  this._runningFunSeq = this._noteseq._funseq.start(this._context);
  return new MUSIC.NoteSequence.Playing(this._runningFunSeq, this._context);
};

MUSIC.NoteSequence.Playing = function(runningFunSeq, ctx) {
  this._runningFunSeq = runningFunSeq;
  this._context = ctx;
};
MUSIC.NoteSequence.Playing.prototype.stop = function() {
  if (this._context.playing) this._context.playing.stop();
  this._runningFunSeq.stop();
};

MUSIC.NoteSequence.prototype.push = function(array){
  var playing;
  var noteNum = array[0];
  var startTime = array[1];
  var duration = array[2];
  this._funseq.push({t:startTime, f: function(ctx){
    ctx.playing = ctx.instrument.note(noteNum).play()
  }});
  this._funseq.push({t:startTime + duration, f: function(ctx){
    if (ctx.playing) ctx.playing.stop();
  }});

  if (startTime + duration > this._totalduration) this._totalduration = startTime + duration;
};

MUSIC.NoteSequence.prototype.makePlayable = function(instrument) {
  return new MUSIC.NoteSequence.Playable(this, MUSIC.NoteSequence.context(instrument), this._totalduration);
};

MUSIC.NoteSequence.context = function(instrument) {
  return {
    instrument: instrument
  };
};

})();