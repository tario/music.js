module.export = function(data, subobjects) {
    return function(music){
        if (!subobjects) return null;
        var instrument = new MUSIC.MultiInstrument(subobjects.map(function(obj) {
          return obj(music);
        }));
        return instrument;
    };
};

