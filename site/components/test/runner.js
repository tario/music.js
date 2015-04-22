module.export = function(data) {
    return function(music){
        var generator = music.oscillator({type: data.oscillatorType ||"square"});
        var instrument = new MUSIC.Instrument(generator);

        var tr = parseInt(data.transpose || 0);
        if (tr !== 0) {
          instrument = instrument.mapNote(function(n) { return n+tr; });
        }

        return instrument;
    };
};

