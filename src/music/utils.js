(function() {
MUSIC.Utils = MUSIC.Utils || {};
MUSIC.Utils.Scale = function(base) {
  return {
    add: function(notenum, notes) {
      var octaveAdd = Math.floor(notes / 7)
      var ret;

      notes-= octaveAdd*7;
      ret = notenum + notes * 2;
      if (notes > 2) {
        ret--;
      }
      return ret + octaveAdd*12;
    }
  };
};

})();