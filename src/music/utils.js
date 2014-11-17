(function() {
MUSIC.Utils = MUSIC.Utils || {};
MUSIC.Utils.Scale = function(base) {
  var nextNoteHash;

  nextNoteHash = {};
  var v = [0,2,4,5,7,9,11,12];

  for (var i=0; i<v.length-1; i++) {
    var value = base+v[i+1];
    var key = (base+v[i]) % 12;
    if (value - key > 11) value-=12;
    nextNoteHash[key] = value;
  }

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