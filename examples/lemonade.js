var LFOFreq = 5;
var sfx = music.echo({delay:1/LFOFreq, gain:0.3});

var sineWave = MUSIC.Wave.sine;
var squareWave = MUSIC.Wave.square();
var combineTwo = function(x,y){return x+y;};

// create the sound generator
var generator = {
  freq: function(fr) {
    var formulaNode = sfx
            .ADSR({
              node: function(node) {
                return node
                    .lemonade(
                      {
                        ops: [
                          {frequency: function(x,y,z){return (z+0.2)*fr*4;}, wave: squareWave },
                          {frequency: function(x,y,z){return (z+0.2)*fr*2;}, wave: sineWave},
                          {frequency: function(x,y,z){return LFOFreq;}, wave: sineWave}
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
