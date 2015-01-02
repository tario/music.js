(function() {
var playablePlay = function(playable) { return playable.play(); };
var playingStop = function(playing) { playing.stop(); };

MUSIC.MultiPlayable = function(playableArray) {
  this._playableArray = playableArray;

  MUSIC.playablePipeExtend(this);
};

MUSIC.MultiPlayable.prototype.play = function() {
  var playingArray = this._playableArray.map(playablePlay);

  return {
    stop: function() {
      playingArray.forEach(playingStop);
    }
  };
};

var higher = function(a,b){ return a > b ? a : b; };
var getDuration = function(playable) { return playable.duration(); };
MUSIC.MultiPlayable.prototype.duration = function() {
  return this._playableArray.map(getDuration).reduce(higher, 0);
};

MUSIC.ChangeTimeWrapper = function(noteseq, extensionTime) {
  this._noteseq=noteseq;
  this._extensionTime=extensionTime;
};

MUSIC.ChangeTimeWrapper.prototype.push = function(input) {
  this._noteseq.push([input[0], input[1]*this._extensionTime, input[2]*this._extensionTime]);
};

MUSIC.Pattern = function(input, options) {
  var playableArray = [];
  options = options || {};
  options.pulseTime = options.pulseTime || 50;

  playableArray = input.map(function(seq) {
    var code = seq[0];
    var instrument = seq[1];

    var noteseq = new MUSIC.NoteSequence();
    MUSIC.SequenceParser.parse(code, new MUSIC.ChangeTimeWrapper(noteseq,options.pulseTime));
    return noteseq.makePlayable(instrument);
  });

  return new MUSIC.MultiPlayable(playableArray);

};

})();