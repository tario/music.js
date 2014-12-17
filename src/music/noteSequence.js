(function() {

MUSIC.NoteSequence = function(funseq, instrument) {
  this.push = function(array){
    var playing;
    var noteNum = array[0];
    funseq.push({t:0, f: function(){
      playing = instrument.note(noteNum).play()
    }});
    funseq.push({t:100, f: function(){
      playing.stop();
    }});
  };
};


})();