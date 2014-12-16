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

MUSIC.Utils.FunctionSeq = function(clock, setTimeout) {
  var array = [];

  var start = function() {
    clock.start(function(t) {
      var callingCriteria = function(element) {
        return element.t - t < 1000 && element.t - t >= 0;
      };

      var schedule = function(event) {
        setTimeout(event.f, event.t - t);
      };

      var notCallingCriteria = function(element) {
        return !(element.t - t < 1000 && element.t - t >= 0);
      };

      var callingEvents = array.filter(callingCriteria);
      var notCallingEvents = array.filter(notCallingCriteria);

      callingEvents.forEach(schedule);
      array = notCallingEvents;
    });
  };

  var push = array.push.bind(array);

  return {
    start: start,
    push: push
  };
};


})();