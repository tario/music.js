(function() {

MUSIC.NoteSequence = function(funseq) {
  this._funseq = funseq;
};

MUSIC.NoteSequence.Playable = function(noteseq) {
  this._noteseq = noteseq;
};
MUSIC.NoteSequence.Playable.prototype.play = function() {
  this._runningFunSeq = this._noteseq._funseq.start();
  return new MUSIC.NoteSequence.Playing(this._runningFunSeq);
};

MUSIC.NoteSequence.Playing = function(runningFunSeq) {
  this._runningFunSeq = runningFunSeq;
};
MUSIC.NoteSequence.Playing.prototype.stop = function() {
  this._runningFunSeq.stop();
};

MUSIC.NoteSequence.prototype.push = function(array){
  var playing;
  var noteNum = array[0];
  var startTime = array[1];
  var duration = array[2];
  this._funseq.push({t:startTime, f: function(ctx){
    playing = ctx.instrument.note(noteNum).play()
  }});
  this._funseq.push({t:startTime + duration, f: function(){
    playing.stop();
  }});
};

MUSIC.NoteSequence.prototype.makePlayable = function() {
  return new MUSIC.NoteSequence.Playable(this);
};

MUSIC.NoteSequence.context = function(instrument) {
  return {
    instrument: instrument
  };
};

})();