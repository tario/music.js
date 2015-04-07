module.export = function(MusicContext) {
    return function(data, subobjects){
        if (!subobjects) return null;
        return MusicContext.runFcn(function(music) {
          var instrument = new MUSIC.MultiInstrument(subobjects);
          return instrument;
        });
    };
};

