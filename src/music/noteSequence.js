(function() {

MUSIC.NoteSequence = function(funseq) {
  this.push = function(array){
    var playing;
    var noteNum = array[0];
    var startTime = array[1];
    var duration = array[2];
    funseq.push({t:startTime, f: function(ctx){
      playing = ctx.instrument.note(noteNum).play()
    }});
    funseq.push({t:startTime + duration, f: function(){
      playing.stop();
    }});
  };
};

MUSIC.NoteSequence.context = function(instrument) {
  return {
    instrument: instrument
  };
};

})();