(function() {
MUSIC.Utils = MUSIC.Utils || {};
MUSIC.Utils.Scale = function(base) {
  var toneAdd;
  var v;

  toneAdd = {};
  v = [0,2,5,7,9];
  for (var i=0; i<v.length; i++) {
    toneAdd[(base+v[i]) % 12 ] = true;
  }

  return {
    add: function(notenum, notes) {
      var ret = notenum;
      while (notes > 0) {
        ret+= toneAdd[ret % 12] ? 2 : 1;
        notes--;
      }
      return ret;
    }
  };
};

MUSIC.Utils.Clock = function(preciseTimer, setInterval, clearInterval, interval) {
  var start = function(fcn) {
    var startTime = preciseTimer();
    fcn(0);
    var hndl = setInterval(function(){
      var t = preciseTimer();
      fcn(t - startTime);
    }, interval);

    return {
      stop: function() {
        clearInterval(hndl);
      }
    }
  };

  return {
    start: start
  };
};

MUSIC.Utils.FunctionSeq = function(clock, setTimeout, clearTimeout) {
  var eventsArray = [];

  var reject = function(x) {
    return function(y) {
      return x!=y;
    };
  };

  var start = function(parameter) {
    var maxDelta = (parameter || {}).maxDelta || 2000;
    var array = eventsArray.slice(0).sort(function(e1, e2) {
      var dt = e1.t - e2.t;
      if (dt===0) {
        return eventsArray.indexOf(e1) - eventsArray.indexOf(e2);
      }

      return dt;
    });

    var timeoutHandlers = [];
    var timeoutHandlerFcn = function() {
      timeoutHandlers = timeoutHandlers.filter(reject(this.timeoutHandler))
      this.f(parameter, 0);
    };

    var eventCount = array.length;
    var currentIdx = 0;
    var next_t = 0;
    var clockHandler = clock.start(function(t) {
      if (t < next_t) {
        return;
      }

      for (; currentIdx<array.length; currentIdx++) {
        var evt = array[currentIdx];
        if (!evt) {
          break;
        }

        var dt = evt.t - t;
        if (dt < 0) {
          continue;
        }
        if (dt > maxDelta) {
          break;
        }

        if (evt.externalSchedule) {
          evt.f(parameter, dt);
        } else {
          var cfg = {
            f: evt.f
          };
          cfg.timeoutHandler = setTimeout(timeoutHandlerFcn.bind(cfg), dt);
          timeoutHandlers.push(cfg.timeoutHandler);
        }

        next_t = evt.t;
      }
    });

    return {
      stop: function(){
        for (var i=0; i<timeoutHandlers.length;i++){
          clearTimeout(timeoutHandlers[i]);
        };
        clockHandler.stop();
      }
    };
  };

  var push = eventsArray.push.bind(eventsArray);

  return {
    start: start,
    push: push
  };
};

MUSIC.Utils.FunctionSeq.preciseTimeout = function(fcn, ms) {
  var funseq;
  clock = MUSIC.Utils.Clock(
    window.performance.now.bind(window.performance),
    setInterval,
    clearInterval,
    500);
  funseq = MUSIC.Utils.FunctionSeq(clock, setTimeout, clearTimeout);

  var runningFunSeq;

  funseq.push({f: function() {
    if (runningFunSeq) {
      runningFunSeq.stop();
    }
    fcn();
  }, t: ms});
  runningFunSeq = funseq.start();
};

MUSIC.Utils.DelayedFunctionSeq = function(inner, delay) {
  var start = function(params) {
    return inner.start(params);
  };

  var push = function(params) {
    return inner.push({
      f: params.f,
      t: params.t + delay,
      externalSchedule: params.externalSchedule
    });
  };

  return {
    start: start,
    push: push
  };
};


})();