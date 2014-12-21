(function() {

MUSIC.NoteSequence = function(funseq) {
  this._funseq = funseq;
};

MUSIC.NoteSequence.Playable = function(noteseq, context) {
  this._noteseq = noteseq;
  this._context = context;
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
    ctx.playing.stop();
  }});
};

MUSIC.NoteSequence.prototype.makePlayable = function(instrument) {
  return new MUSIC.NoteSequence.Playable(this, MUSIC.NoteSequence.context(instrument));
};

MUSIC.NoteSequence.context = function(instrument) {
  return {
    instrument: instrument
  };
};

})();