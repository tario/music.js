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
  "A#": 10,
  "Bb": 10,
  "B": 11,
  "B#": 12
};

var isNoteStart = function(chr) {
  return "CDEFGAB".indexOf(chr) !== -1;
};

var noteSplit = function(str) {
  var ret = [];
  var lastNote = "";
  for (var i = 0; i < str.length; i++) {
    if (isNoteStart(str[i])) {
      if (lastNote !== "") ret.push(lastNote);
      lastNote = "";
    }

    if (str[i] === " " || str[i] === ".") {
      if (lastNote !== "") ret.push(lastNote);
      lastNote = "";
    }

    lastNote += str[i];
  }
  if (lastNote !== "") ret.push(lastNote);
  return ret;
};

MUSIC.SequenceParser.parse = function(input, noteSeq) {
  var currentNote;
  var currentCharacter;
  if (input === "") return;

  var noteArray = noteSplit(input);
  var currentTime = 0;
  for (var i=0; i<noteArray.length; i++) {
    var currentNoteStr = noteArray[i];
    var noteDuration = currentNoteStr.length;
    var equalIndex = currentNoteStr.indexOf("=");
    if (equalIndex != -1) currentNoteStr = currentNoteStr.slice(0, equalIndex);

    var lastChar = currentNoteStr.slice(-1);
    var octave = parseInt(lastChar);
    if (isNaN(octave)) {
      octave = 0;
    } else {
      currentNoteStr = currentNoteStr.slice(0, currentNoteStr.length-1);
    }

    var currentNote = notes[currentNoteStr];
    if (currentNote !== undefined){
      noteSeq.push([currentNote + octave*12, currentTime, noteDuration])
    };
    currentTime += noteDuration;
  }
};

})();