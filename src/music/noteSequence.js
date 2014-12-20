(function() {

MUSIC.NoteSequence = function(funseq) {
  this._funseq = funseq;
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
  return {
    play: function() {
      return {
        stop: function() {

        }
      };
    }
  };
};

MUSIC.NoteSequence.context = function(instrument) {
  return {
    instrument: instrument
  };
};

})();