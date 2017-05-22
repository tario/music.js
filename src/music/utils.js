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
    var array = eventsArray.slice(0).sort(function(e1, e2) {
      var dt = e1.t - e2.t;
      if (dt===0) {
        return eventsArray.indexOf(e1) - eventsArray.indexOf(e2);
      }

      return dt;
    });

    var timeoutHandlers = [];
    var eventCount = array.length;

    var clockHandler = clock.start(function(t) {
      var lastEvent;
      var callingCriteria = function(element) {
        return element.t - t < 1000 && element.t - t >= 0;
      };

      var pending = [];
      var processPending = function() {
        if (!pending.length) return;

        var currentPending = pending;
        pending = [];

        var timeoutHandler = setTimeout(function() {
          timeoutHandlers = timeoutHandlers.filter(reject(timeoutHandler))

          for (var i=0; i<currentPending.length; i++) {
            currentPending[i].f(parameter);
            eventCount--;
            if (eventCount === 0) clockHandler.stop();
          }
        }, currentPending[0].t - t);
        timeoutHandlers.push(timeoutHandler);
      };

      var addSchedule = function(event) {
        if (lastEvent && lastEvent.t - t !== event.t - t) {
          processPending();
        }

        pending.push(event);
        lastEvent = event;
      };

      var nextElement;

      while(1) {
        if (array.length > 0) {
          nextElement = array[0];
          if (callingCriteria(nextElement)) {
            addSchedule(nextElement);
            array.shift(); // remove first element
          } else {
            break;
          }
        } else {
          break;
        }
      }

      processPending();
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
      t: params.t + delay
    });
  };

  return {
    start: start,
    push: push
  };
};


})();