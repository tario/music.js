(function() {
MUSIC.Utils = MUSIC.Utils || {};
MUSIC.Utils.Scale = function(base) {
  var nextNoteHash;

  if (base == 0) {
    nextNoteHash = {
      0: 2,
      2: 4,
      4: 5,
      5: 7,
      7: 9,
      9: 11,
      11: 12
    };
  } else if (base == 2) {
    nextNoteHash = {
      2: 4,
      4: 6,
      6: 7,
      7: 9,
      9: 11,
      11: 13,
      1: 14
    };
  } else if (base == 4) {
    nextNoteHash = {
      4: 6,
      6: 8,
      8: 9,
      9: 11,
      11: 13,
      1: 3,
      3: 4
    };
  };

  return {
    add: function(notenum, notes) {
      var octaveAdd = Math.floor(notes / 7)
      var noteNumOctave = Math.floor(notenum / 12);
      var ret;

      notes-= octaveAdd*7;

      ret = notenum - noteNumOctave*12;
      while (notes > 0) {
        ret = nextNoteHash[ret];
        if (ret > 11) {
          ret -= 12;
          octaveAdd++;
        }
        notes--;
      }
      return ret + noteNumOctave*12 + octaveAdd*12;
    }
  };
};

})();