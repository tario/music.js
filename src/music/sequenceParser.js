(function() {
MUSIC.SequenceParser = {};
var notes = {
  "C": 0,
  "D": 2,
  "E": 4,
  "F": 5,
  "G": 7,
  "A": 9,
  "B": 11
};

MUSIC.SequenceParser.parse = function(input, noteSeq) {
  noteSeq.push(notes[input],0,1);
};

})();