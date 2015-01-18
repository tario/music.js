// create the sound generator
var twopi = Math.PI * 2;
var op = music.lemonade.op;
var twopi = Math.PI * 2;
var sineWave = function(t) {
  return Math.sin(twopi*t);
};

var combineTwo = function(x,y){return x+y;};
var generator = {
  freq: function(fr) {
    var formulaNode = music
            .ADSR({
              node: function(node) {
                var reducedFreq = 5;
                return node
                    .lemonade(
                      {
                        ops: [
                          {frequency: function(x,y,z){return (z+0.2)*fr*4;}, wave: sineWave},
                          {frequency: function(x,y,z){return (z+0.2)*fr*2;}, wave: sineWave},
                          {frequency: function(x,y,z){return reducedFreq;}, wave: sineWave}
                        ],
                        output: combineTwo
                      }
                    );
              }, 
              attackTime: 0.2,
              decayTime: 0.2,
              releaseTime: 0.2,
              sustainLevel: 0.8
            });


    return formulaNode;

  }
};


instruments.add("test sound", generator);
