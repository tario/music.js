function() {
  return function(music) {

    // create the sound generator
    var twopi = Math.PI * 2;
    var soundGenerator = {
      freq: function(fr) {
        var formulaNode = music
                  .formulaGenerator(function(t) {
                      return Math.sin(twopi*fr*t);
                  });

        return formulaNode;

      }
    };

    // add instrument to show on UI
    return new MUSIC.Instrument(soundGenerator);
  }
}