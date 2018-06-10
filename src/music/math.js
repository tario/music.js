(function() {
MUSIC.Math = MUSIC.Math || {};

MUSIC.Math.bpmToSecondTick = function(options, bpm) {
  return 60000 / bpm / options.ticks_per_beat;
};

var makeEvaluableInverseFunctionFromParts = function(array) {
  array = array.map(function(part) {
    var f = makeEvaluableFunction(part.f);
    var inverse_f = makeEvaluableInverseFunction(part.f);
    return {
      init: f(part.init),
      end: f(part.end),
      f: inverse_f
    };
  });

  return function(y) {
    var part = array.find(function(p) {
      return y >= p.init && (!p.end || y <= p.end);
    });

    if (!part) return 0;
    return part.f(y);
  };  
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

var makeEvaluableInverseFunction = function(array) {
  if (array.length == 2) {
    var b = array[1];
    var a = array[0];
    return function(y) {
      return (y - a)/b;  // y = b*x + a  ;   y - a = b*x; (y - a) / b = x;
    };
  } else if (array.length == 3) {
    var a = array[2];
    var b = array[1];
    var c = array[0];      

    if (a === 0) {
      return makeEvaluableInverseFunction([c,b]);
    } else {
      return function(y) {
        return 2*(c-y) / (-b - Math.sqrt(b*b - 4*a*(c-y)));
      };
    }
  }
};


var makeEvaluableFunction = function(array) {
  if (array.length == 2) {
    var b = array[1];
    var a = array[0];
    return function(x) {
      return b*x + a;
    };
  } else if (array.length == 3) {
    var a = array[2];
    var b = array[1];
    var c = array[0];
    return function(x) {
      return a*x*x + b*x + c;
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
  var cutBpmEvent = function(bpmEvent1) {
    var l = bpmEvent1.l;
    options.bpm_events.forEach(function(bpmEvent2) {
      if (bpmEvent2 !== bpmEvent1 && bpmEvent2.s >= bpmEvent1.s) {
        if (bpmEvent2.s < bpmEvent1.s + l) {
          var cutL = bpmEvent2.s - bpmEvent1.s;
          if (cutL < l) l = cutL;
        }
      }
    });

    return {
      s: bpmEvent1.s,
      l: l,
      n: Math.max(bpmEvent1.n, 1)
    };
  };

  options.bpm_events = options.bpm_events.map(cutBpmEvent);

  var firstEventStart = options.bpm_events[0].s;
  var parts = [{
    init: 0,
    end: firstEventStart,
    f: [MUSIC.Math.bpmToSecondTick(options, options.bpm)]
  }];

  for (var i=0; i<options.bpm_events.length; i++) {
    var bpm_event = options.bpm_events[i];
    var next_bpm_event = options.bpm_events[i+1];

    var init_second_tick = MUSIC.Math.bpmToSecondTick(options, 
      i == 0 ? options.bpm : options.bpm_events[i-1].n);
    var end_second_tick = MUSIC.Math.bpmToSecondTick(options, bpm_event.n);

    var b = (end_second_tick - init_second_tick) / bpm_event.l;
    var a = init_second_tick - b * bpm_event.s;

    // f(bpm_event.s) =  init_second_tick
    // f(bpm_event.s + bpm_event.l) =  init_second_tick - b * bpm_event.s + b * (bpm_event.s + bpm_event.l)
    // f(bpm_event.s + bpm_event.l) =  init_second_tick + b * bpm_event.l
    // f(bpm_event.s + bpm_event.l) =  end_second_tick

    if (bpm_event.l === 0) {
      parts.push({
        init: bpm_event.s,
        end: next_bpm_event && next_bpm_event.s,
        f: [end_second_tick]
      });
    } else {
      parts.push({
        init: bpm_event.s,
        end: bpm_event.s + bpm_event.l,
        f: [a, b]
      });

      parts.push({
        init: bpm_event.s + bpm_event.l,
        end: next_bpm_event && next_bpm_event.s,
        f: [end_second_tick]
      });
    }
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

MUSIC.Math.timeToTicks = function(options) {
  var bpm = options.bpm;
  var ticks_per_beat = options.ticks_per_beat;

  if (options.bpm_events && options.bpm_events.length) {
    var integral = MUSIC.Math.integrateBpmEvents(options);
    return makeEvaluableInverseFunctionFromParts(integral);
  } else {
    var inverseScale = ticks_per_beat * bpm / 60000;
    return function(time) {
      return time*inverseScale;
    };
  }
};

})();