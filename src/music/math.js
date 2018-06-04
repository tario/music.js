(function() {
MUSIC.Math = MUSIC.Math || {};
MUSIC.Math.ticksToTime = function(options) {
  var bpm = options.bpm;
  var ticks_per_beat = options.ticks_per_beat;
  var scale = 60000 / bpm / ticks_per_beat;

  return function(ticks) {
    return ticks*scale;
  };
};

})();