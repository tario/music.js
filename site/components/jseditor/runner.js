module.export = function(MusicContext) {
    return function(object){
        var results = MusicContext.run(object.code);
        return (results.instruments||[]).concat(results.playables||[]);
    };
};
