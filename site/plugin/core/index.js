module.export = function(m) {
  m.type("script", {template: "script", description: "Custom script"}, function(object){
    if (!object) return;
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
    if (!data) return;
    if (!subobjects) return;
    return function(music){
        if (!subobjects) return null;
        var instrument = new MUSIC.MultiInstrument(subobjects.map(function(obj) {
          return obj(music);
        }));
        return instrument;
    };
  });

  m.type("test", {template: "test", description: "Test Component"}, function(data) {
    if (!data) return;
      return function(music){
          var generator = music.oscillator({type: data.oscillatorType ||"square"});
          return new MUSIC.Instrument(generator);
      };
  });

  m.type("adsr", {template: "adsr", description: "ADSR"},  function(data, subobjects) {
    if (!subobjects) return;
    var wrapped = subobjects[0];
    if (!wrapped) return;
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


  m.type("transpose",
      {
          template: "generic_wrapper_editor", 
          parameters: [
            {name: "amount"}
          ], 
          description: "Transpose by N semitones"

      }, function(data, subobjects) {
        if (!subobjects) return;
        var wrapped = subobjects[0];
        if (!wrapped) return;
        var tr = parseInt(data.amount);
        var transposeFcn = function(n) { return n+tr };

        return function(music) {
          return wrapped(music).mapNote(transposeFcn);
        };
      });

  var genericType = function(name, options){
    var fcn = options.fcn ||name;
    m.type(name, 
        {
          template: "generic_wrapper_editor", 
          parameters: options.parameters, 
          description: options.description
        },  function(data, subobjects) {

          var opt;
          if(options.singleParameter) {
            var parameter = options.parameters[0];
            opt = data[parameter.name] ? parseFloat(data[parameter.name]) : (parameter.default || 0.0);
          } else {
            opt = {};
            options.parameters.forEach(function(parameter) {
              opt[parameter.name] = data[parameter.name] ? parseFloat(data[parameter.name]) : (parameter.default || 0.0);
            });
          }

          if (!subobjects) return;
          var wrapped = subobjects[0];
          if (!wrapped) return;

          return function(music) {
            return wrapped(music[fcn].apply(music, [opt]));
          };
    });
  };


  genericType("gain", 
      {
        parameters: [
          {name: "gain"}
        ], 
        singleParameter: true,
        description: "Increase or decrease the amp. of signal"
      });

  genericType("echo", 
      {
        parameters: [
          {name: "gain"},
          {name: "delay"}
        ], 
        description: "Single echo effect"
      });

  ["lowpass", "highpass", "bandpass", "lowshelf", "highshelf", "peaking", "notch", "allpass"].forEach(function(filterName) {
    genericType(filterName, 
        {
          parameters: [
            {name: "frequency"}
          ], 
          description: filterName
        });

  });

};
