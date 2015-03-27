(function() {

var PlayingSong = function(funseq) {
  this._context = {playing: []};
  this._funseqHandler = funseq.start(this._context);
};

PlayingSong.prototype.stop = function() {
  this._context.playing.forEach(function(playing) {
    playing.stop();
  });

  this._funseqHandler.stop();
};

var fromPatterns = function(patterns) {
  return function(patternName) {
    return patterns[patternName];
  };
};

MUSIC.Song = function(input, patterns, options){

  options = options || {};
  var measure = options.measure || 500;
  var funseq;
  if (!funseq){
    var clock = MUSIC.Utils.Clock(
      window.performance.now.bind(window.performance),
      setInterval,
      clearInterval,
      500);
    funseq = MUSIC.Utils.FunctionSeq(clock, setTimeout, clearTimeout);
  }


  var totalMeasures = input[0].length;
  var getFromPatterns = fromPatterns(patterns);

  this._funseq = funseq;
  this._duration = totalMeasures * measure;

  for (var j = 0; j < totalMeasures; j++) {
    (function() {
      var patternArray = [];
      for (var i = 0 ; i < input.length; i++) {
        patternArray.push(input[i][j]);
      };
      var playableArray = patternArray.map(getFromPatterns) 
      var multiPlayable = new MUSIC.MultiPlayable(playableArray);
      var playing;
      funseq.push({t: j*measure, f: function(context) {
        playing = multiPlayable.play();
        context.playing.push(playing);
      }});

      funseq.push({t: (j+1)*measure, f: function(context) {
        playing.stop();
        context.playing = context.playing.filter(function(x){ return x != playing; });
      }});

    })();
  };
};

MUSIC.Song.prototype.duration = function() {
  return this._duration;
};

MUSIC.Song.prototype.play = function() {
  return new PlayingSong(this._funseq);
};

})();