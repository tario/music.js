module.export = function(data, subobjects) {
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
                      .onStop(gainNode.dispose.bind(gainNode))
                      .stopDelay(decayTime * 1000)
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
};

