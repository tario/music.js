// create the sound generator
var wave = new MUSIC.SoundLib.Wave("src/sound/Kick 1.wav",1000);
var soundGenerator = {
  freq: function(fr) {
            return music
              .oscillator({wave: wave, frequency: fr});
  }
};

// create the instrument from sound generator
var instrument = 
    new MUSIC.Instrument(soundGenerator)
                .mapNote(function(n) { return n - 36*2; });

// add instrument to show on UI
instruments.add("Custom wave oscillator from file", instrument);