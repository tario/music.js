(function() {
MUSIC.SequenceParser = {};
var notes = {
  "Cb": -1,
  "C": 0,
  "C#": 1,
  "Db": 1,
  "D": 2,
  "D#": 3,
  "Eb": 3,
  "E": 4,
  "E#": 5,
  "Fb": 4,
  "F": 5,
  "F#": 6,
  "Gb": 6,
  "G": 7,
  "G#": 8,
  "Ab": 8,
  "A": 9,
  "A#": 9,
  "Bb": 10,
  "B": 11,
  "B#": 12
};

MUSIC.SequenceParser.parse = function(input, noteSeq) {
  var currentNote;
  var currentCharacter;
  if (input === "") return;

  firstNote = input[0];
  for (var i=0; i<input.length; i++) {
    currentCharacter = input.slice(i);
    currentNote = notes[currentCharacter];
    if (currentNote!==undefined) {
      noteSeq.push([currentNote,i,currentCharacter.length]);
    }
  }
};

})();