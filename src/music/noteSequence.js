(function() {

MUSIC.NoteSequence = function(funseq, instrument) {
  this.push = function(array){
    funseq.push({t:0});
    funseq.push({t:100});
  };
};


})();