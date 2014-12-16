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

  var start = function() {
    var array = eventsArray.slice(0);
    var timeoutHandlers = [];

    var clockHandler = clock.start(function(t) {
      var callingCriteria = function(element) {
        return element.t - t < 1000 && element.t - t >= 0;
      };

      var schedule = function(event) {
        var timeoutHandler = setTimeout(function(){
          timeoutHandlers = timeoutHandlers.filter(reject(timeoutHandler))
          event.f();
        }, event.t - t);
        timeoutHandlers.push(timeoutHandler);
      };

      var nextElement;

      while(1) {
        if (array.length > 0) {
          nextElement = array[0];
          if (callingCriteria(nextElement)) {
            schedule(nextElement);
            array.shift(); // remove first element
          } else {
            break;
          }
        } else {
          break;
        }
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


})();