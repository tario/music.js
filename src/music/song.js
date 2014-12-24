(function() {

var PlayingSong = function(funseq) {
  this._funseq = funseq;
};

PlayingSong.prototype.stop = function() {
  this._funseq.stop();
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
    clock = MUSIC.Utils.Clock(
      window.performance.now.bind(window.performance),
      setInterval,
      clearInterval,
      500);
    funseq = MUSIC.Utils.FunctionSeq(clock, setTimeout, clearTimeout);
  }


  var totalMeasures = input[0].length;
  var getFromPatterns = fromPatterns(patterns);

  this._funseq = funseq;

  for (var j = 0; j < totalMeasures; j++) {
    (function() {
      var patternArray = [];
      for (var i = 0 ; i < input.length; i++) {
        patternArray.push(input[i][j]);
      };
      var playableArray = patternArray.map(getFromPatterns) 
      var multiPlayable = new MUSIC.MultiPlayable(playableArray);
      var playing;
      funseq.push({t: j*measure, f: function() {
        playing = multiPlayable.play();
      }});

      funseq.push({t: (j+1)*measure, f: function() {
        playing.stop();
      }});

    })();
  };
};


MUSIC.Song.prototype.play = function() {
  this._funseq.start();
  return new PlayingSong(this._funseq);
};

})();