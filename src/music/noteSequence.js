(function() {

MUSIC.NoteSequence = function(funseq, instrument) {
  this.push = function(array){
    funseq.push({t:0, f: function(){}});
    funseq.push({t:100, f: function(){}});
  };
};


})();