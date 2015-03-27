module.export = function(MusicContext) {
    return function(object){
        var results = MusicContext.run(object.code);
        if (results.error) {
            object.codeError = results.error;
        } else {
            object.codeError = null;
        }
        return results.object;
    };
};
