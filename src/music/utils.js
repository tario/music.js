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
    var eventBlockSize = 1000;
    var eventBlock = [];

    var array = eventsArray.slice(0).sort(function(e1, e2) {
      var dt = e1.t - e2.t;
      if (dt===0) {
        return eventsArray.indexOf(e1) - eventsArray.indexOf(e2);
      }

      return dt;
    });

    array.forEach(function(event) {
      var idx = Math.floor(event.t / eventBlockSize);
      eventBlock[idx] = eventBlock[idx] || [];
      eventBlock[idx].push(event);
    });

    var timeoutHandlers = [];
    var timeoutHandlerFcn = function() {
      timeoutHandlers = timeoutHandlers.filter(reject(this.timeoutHandler))
      this.f(parameter, 0);
    };

    var eventCount = array.length;
    var next_t = 0;
    var clockHandler = clock.start(function(t) {
      if (t < next_t) {
        return;
      }

      var currentIdx = Math.floor(t / eventBlockSize);
      var currentBlock = eventBlock[currentIdx];
      var i;

      if (currentBlock) {
        for (i=0; i<currentBlock.length && currentBlock[i].t < t; i++) {
        }
        for (; i<currentBlock.length; i++) {
          var dt = currentBlock[i].t - t;
          if (currentBlock[i].externalSchedule) {
            currentBlock[i].f(parameter, dt);
          } else {
            var cfg = {
              f: currentBlock[i].f
            };

            cfg.timeoutHandler = setTimeout(timeoutHandlerFcn.bind(cfg), dt);
            timeoutHandlers.push(cfg.timeoutHandler);
          }
        }

        eventBlock[currentIdx] = null;
        next_t = (currentIdx + 1) * eventBlockSize;
      }

      var nextBlock = eventBlock[currentIdx+1];
      if (nextBlock) {
        for (i=0; i<nextBlock.length; i++) {
          var dt = nextBlock[i].t - t;
          if (nextBlock[i].externalSchedule) {
            nextBlock[i].f(parameter, dt);
          } else {
            var cfg = {
              f: nextBlock[i].f
            };

            cfg.timeoutHandler = setTimeout(timeoutHandlerFcn.bind(cfg), dt);
            timeoutHandlers.push(cfg.timeoutHandler);
          }
        }

        eventBlock[currentIdx+1] = null
        next_t = (currentIdx + 1) * eventBlockSize;
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