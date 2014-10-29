// create the sound generator
var stopCurve = new MUSIC.Curve.Ramp(1.0, 0.0, 100).during(0.4);

var soundGenerator = {
  freq: function(fr) {
    var gainNode = music
              .gain(1.0);

    return gainNode
            .oscillator({type: 'square', frequency: fr})
            .onStop(function(){gainNode.dispose(); }) // dispose gain node
            .stopDelay(400)
            .onStop(function(){ gainNode.setParam('gain', stopCurve); }); // set gain curve

  }
};

// create the instrument from sound generator
var instrument = 
    new MUSIC.Instrument(soundGenerator)
                .mapNote(function(n) { return n + 36; });

// add instrument to show on UI
instruments.add("Square wave oscillator", instrument);