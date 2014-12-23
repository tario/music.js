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
  var currentNote;
  var currentCharacter;
  if (input === "") return;

  firstNote = input[0];
  for (var i=0; i<input.length; i++) {
    currentCharacter = input[i];
    currentNote = notes[currentCharacter];
    if (currentNote!==undefined) {
      noteSeq.push([currentNote,i,1]);
    }
  }
};

})();