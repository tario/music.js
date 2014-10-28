var startCurve = new MUSIC.Curve.Ramp(0, 1.0, 100).during(0.4);
var stopCurve = new MUSIC.Curve.Ramp(1.0, 0.0, 100).during(0.4);

// creates an effects pipeline
var effects = music
            .gain(0.2)
            .reverb({delay: 0.07, gain: 0.5}); // apply reverb effect                

// creates a soundGenerator to generate sound from frequency
// appended to the effects pipeline
var soundGenerator = 
            effects
                .oscillator({type: 'square', effects: function(dst, param) { // implement separated efects for each note play
                    var gainNode = dst.gain(1.0);
                    /// gainNode.setParam('gain', startCurve); // optional
                    param.onstop = function() {
                        gainNode.setParam('gain', stopCurve);
                    };
                    return gainNode;
                }});

// create instrument from sound generator
var instrument = 
    new MUSIC.Instrument(soundGenerator)
                .mapNote(function(n) { return n + 36; })
                .stopDelay(400)
                .perNoteWrap(MUSIC.StopEvent());

instruments.add("Square Oscillator with Reverb", instrument);

/*
var player = MUSIC.InstrumentSequence(instrument, 200);


var seq = MUSIC
    .Sequence()
    .n(
            player('A-B-C-D-').loop(10));


window.playing = seq.play();

*/

var percussion = new MUSIC.PatchInstrument({
    'C': music.sound("src/sound/Kick 1.wav"),
    'D': music.highpass({frequency: 400}).sound("src/sound/Effect 1.wav"),
    'E': music
            .reverb({delay: 0.07, gain: 0.5})
            .sound("src/sound/Snare 1.wav")
            .stopDelay(1000)
}, 0);

instruments.add("Percussion patch", percussion);

/*

player = MUSIC.InstrumentSequence(instrument, 200);
var seq = MUSIC
    .Sequence()
    .n(
            [
                player('C-C---C-'),
                player('------E-')
            ]).loop(10);

    window.seq = seq;
*/