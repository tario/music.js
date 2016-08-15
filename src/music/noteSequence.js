(function() {

MUSIC.NoteSequence = function(funseq) {
  var clock;
  if (!funseq){
    clock = MUSIC.Utils.Clock(
      window.performance.now.bind(window.performance),
      setInterval,
      clearInterval,
      500);
    funseq = MUSIC.Utils.FunctionSeq(clock, setTimeout, clearTimeout);
  }

  this._funseq = funseq;
  this._totalduration = 0;
  this._noteid = 0;
};

MUSIC.NoteSequence.Playable = function(noteseq, context, duration) {
  this._noteseq = noteseq;
  this._context = context;
  this._duration = duration;
};

MUSIC.NoteSequence.Playable.prototype.loop = function(times) {
  return MUSIC.Loop(this, times);
};

MUSIC.NoteSequence.Playable.prototype.duration = function() {
  return this._duration;
};

MUSIC.NoteSequence.Playable.prototype.play = function(options) {
  this._runningFunSeq = this._noteseq._funseq.start(this._context);
  return new MUSIC.NoteSequence.Playing(this._runningFunSeq, this._context);
};

MUSIC.NoteSequence.Playing = function(runningFunSeq, ctx) {
  this._runningFunSeq = runningFunSeq;
  this._context = ctx;
};
MUSIC.NoteSequence.Playing.prototype.stop = function() {
  if (this._context.playing) this._context.playing.stop();
  this._runningFunSeq.stop();
  this._context.stop();
};

MUSIC.NoteSequence.prototype.paddingTo = function(time){
  this._totalduration = time;
};

MUSIC.NoteSequence.prototype.padding = function(time){
  this._totalduration = this._totalduration + time;
};

MUSIC.NoteSequence.prototype.pushCallback = function(array){
  var startTime = array[0];
  var f = array[1];
  this._funseq.push({t:startTime, f: f});
};

MUSIC.NoteSequence.prototype.push = function(array){
  var noteNum = array[0];
  var startTime = array[1];
  var duration = array[2];

  this._noteid++;
  var mynoteid = this._noteid;

  this._funseq.push({t:startTime, f: function(ctx){
    var playing;
    playing = ctx.instrument.note(noteNum);
    ctx.setPlaying(mynoteid, playing);
  }});
  this._funseq.push({t:startTime + duration, f: function(ctx){
    ctx.unsetPlaying(mynoteid);
  }});

  if (startTime + duration > this._totalduration) this._totalduration = startTime + duration;
};

MUSIC.NoteSequence.prototype.makePlayable = function(instrument) {
  return new MUSIC.NoteSequence.Playable(this, MUSIC.NoteSequence.context(instrument), this._totalduration);
};

MUSIC.NoteSequence.context = function(instrument) {
  var playingNotes = [];
  var setPlaying = function(noteid, p) {
    playingNotes[noteid] = p.play();
  };
  var unsetPlaying = function(noteid) {
    var playing = playingNotes[noteid]; 
    if (playing) {
      playing.stop();
      playingNotes[noteid] = undefined;
    }
  };

  var stop = function() {
    for (var i = 0; i<playingNotes.length; i++) {
      if(playingNotes[i]) playingNotes[i].stop();
    }
  };

  return {
    setPlaying: setPlaying,
    unsetPlaying: unsetPlaying,
    instrument: instrument,
    stop: stop
  };
};

})();