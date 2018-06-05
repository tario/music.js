(function() {
MUSIC.Math = MUSIC.Math || {};

MUSIC.Math.bpmToSecondTick = function(options, bpm) {
  return 60000 / bpm / options.ticks_per_beat;
};

var makeEvaluableFunctionFromParts = function(array) {
  array = array.map(function(part) {
    return {
      init: part.init,
      end: part.end,
      f: makeEvaluableFunction(part.f)
    };
  });

  return function(x) {
    var part = array.find(function(p) {
      return x >= p.init && (!p.end || x <= p.end);
    });

    if (!part) return 0;
    return part.f(x);
  };
};

var makeEvaluableFunction = function(array) {
  if (array.length == 2) {
    var b = array[1];
    var a = array[0];
    return function(x) {
      return b*x + a;
    };
  } else if (array.length == 3) {
    var c = array[2];
    var b = array[1];
    var a = array[0];
    return function(x) {
      return b*x*x + a*x + c;
    };
  }
};

var integrate = function(array, lastPointValue) {
  var x = lastPointValue[0];
  var y = lastPointValue[1];

  if (array.length == 1) {
    var c = -array[0]*x + y;
    return [c, array[0]];
  } else if (array.length == 2) {
    var c = y - x*array[0] - x*x*array[1]/2;
    return [c, array[0], array[1]/2];
  }
};

MUSIC.Math.integrateBpmEvents = function(options) {
  var firstEventStart = options.bpm_events[0].s;
  var parts = [{
    init: 0,
    end: firstEventStart,
    f: [MUSIC.Math.bpmToSecondTick(options, options.bpm)]
  }];

  for (var i=0; i<options.bpm_events.length; i++) {
    var bpm_event = options.bpm_events[i];
    var next_bpm_event = options.bpm_events[i+1];

    parts.push({
      init: bpm_event.s,
      end: next_bpm_event && next_bpm_event.s,
      f: [MUSIC.Math.bpmToSecondTick(options, bpm_event.n)]
    });
  };

  var integratedParts = [];
  var lastPointValue = [0,0];

  for (var i=0; i<parts.length; i++) {
    var part = parts[i];
    var integral = integrate(part.f, lastPointValue);

    integratedParts.push({
      init: part.init,
      end: part.end,
      f: integrate(part.f, lastPointValue)
    });

    lastPointValue = [part.end, makeEvaluableFunction(integral)(part.end)];
  };

  return integratedParts;
};

MUSIC.Math.ticksToTime = function(options) {
  var bpm = options.bpm;
  var ticks_per_beat = options.ticks_per_beat;

  if (options.bpm_events && options.bpm_events.length) {
    var integral = MUSIC.Math.integrateBpmEvents(options);
    return makeEvaluableFunctionFromParts(integral);
  } else {
    var scale = 60000 / bpm / ticks_per_beat;
    return function(ticks) {
      return ticks*scale;
    };

  }

};

})();