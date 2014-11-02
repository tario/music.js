(function() {
MUSIC.Utils = MUSIC.Utils || {};
MUSIC.Utils.Scale = function(base) {
  return {
    add: function(notenum, notes) {
      var ret = notenum + notes * 2;
      if (notes > 2) {
        ret--;
      }
      return ret;
    }
  };
};

})();