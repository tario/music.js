(function() {

MUSIC.NoteSequence = function(funseq, instrument) {
  this.push = function(array){
    var playing;
    funseq.push({t:0, f: function(){
      playing = instrument.note(0).play()
    }});
    funseq.push({t:100, f: function(){
      playing.stop();
    }});
  };
};


})();