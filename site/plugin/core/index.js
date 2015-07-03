module.export = function(m) {
  m.type("script", {template: "script", description: "Custom script"}, function(object){
    return function(music) {
      var results;
      try {
        results = {object: eval("(function() {\n" + object.code + "\n})")()};
      } catch(e) {
        results = {error: e.toString()};
      }

      if (results.error) {
          object.codeError = results.error;
      } else {
          object.codeError = null;
      }
      return results.object;
    };
  });

  m.type("multi_instrument", {template: "multi_instrument", description: "Multi Instrument"}, function(data, subobjects) {
    return function(music){
        if (!subobjects) return null;
        var instrument = new MUSIC.MultiInstrument(subobjects.map(function(obj) {
          return obj(music);
        }));
        return instrument;
    };
  });

  m.type("test", {template: "test", description: "Test Component"}, function(data) {
      return function(music){
          var generator = music.oscillator({type: data.oscillatorType ||"square"});
          var instrument = new MUSIC.Instrument(generator);

          var tr = parseInt(data.transpose || 0);
          if (tr !== 0) {
            instrument = instrument.mapNote(function(n) { return n+tr; });
          }

          return instrument;
      };
  });

  m.type("adsr", {template: "adsr", description: "ADSR"},  function(data, subobjects) {
    var wrapped = subobjects[0];
    var samples = data.samples || 100;
    var attackTime = parseFloat(data.attackTime || 0.4);
    var decayTime = parseFloat(data.decayTime || 0.4);
    var sustainLevel = parseFloat(data.sustainLevel || 0.8);
    var releaseTime = parseFloat(data.releaseTime || 0.4);

    var attackCurve = new MUSIC.Curve.Ramp(0.0, 1.0, samples).during(attackTime);
    var decayCurve = new MUSIC.Curve.Ramp(1.0, sustainLevel, samples).during(decayTime);
    var startCurve = MUSIC.Curve.concat(attackCurve, attackTime, decayCurve, decayTime);

    return function(music){
        var note = function(n) {
            var gainNode = music.gain(sustainLevel);
            var instance = wrapped(gainNode);
            gainNode.setParam('gain', startCurve);

            return instance.note(n)
                      .onStop(function() {
                        gainNode.dispose();
                        instance.dispose();
                      })
                      .stopDelay(releaseTime * 1000)
                      .onStop(function(){ 
                        var currentLevel = gainNode._destination.gain.value;
                        var releaseCurve = new MUSIC.Curve.Ramp(currentLevel, 0.0, samples).during(releaseTime)
                        gainNode.setParam('gain', releaseCurve); 
                      });
        };
        return MUSIC.playablePipeExtend({
          note: note
        });
    };
  });
};
