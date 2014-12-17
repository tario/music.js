(function() {

MUSIC.NoteSequence = function(funseq, instrument) {
  this.push = function(array){
    var playing;
    var noteNum = array[0];
    var startTime = array[1];
    var duration = array[2];
    funseq.push({t:startTime, f: function(){
      playing = instrument.note(noteNum).play()
    }});
    funseq.push({t:startTime + duration, f: function(){
      playing.stop();
    }});
  };
};


})();