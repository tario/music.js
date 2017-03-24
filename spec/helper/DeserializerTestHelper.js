DeserializerTest = {};
(function() {

var patterns = [];

var track1 = {"scroll":1000,"instrument": "8a3bcf2aadc59f6ee6d983d31d461a87", "events":[{"n":66,"s":48,"l":96},{"n":64,"s":216,"l":96}]};
var track2 = {"scroll":653,"events":[{"n":6,"s":48,"l":961},{"n":640,"s":2160,"l":960}]}
var track3 = {"scroll":6665,"instrument": "2a3bcf2aadc59f6aaaa321141bbc1a14", "events":[]}

patterns.push({"measure":5,"measureCount":1,"bpm":140,"selectedTrack":0,"tracks":[track1],"scrollLeft":0});
patterns.push({"measure":15,"measureCount":1,"bpm":240,"selectedTrack":0,"tracks":[track2],"scrollLeft":10});
patterns.push({"measure":15,"measureCount":1,"bpm":440,"selectedTrack":0,"tracks":[track1],"scrollLeft":10});
patterns.push({"measure":15,"measureCount":1,"bpm":440,"selectedTrack":0,"tracks":[],"scrollLeft":10});
patterns.push({"measure":15,"measureCount":1,"bpm":440,"selectedTrack":0,"tracks":[track1, track2],"scrollLeft":10});
patterns.push({"measure":7,"measureCount":1,"bpm":440,"selectedTrack":0,"tracks":[track1, track1],"scrollLeft":1000});
patterns.push({"measure":7,"measureCount":1,"bpm":440,"selectedTrack":0,"tracks":[track1, track1, track1, track1, track1, track1],"scrollLeft":1000});
patterns.push({"measure":7,"measureCount":1,"bpm":240,"selectedTrack":0,"tracks":[track3, track3],"scrollLeft":1000});
patterns.push({"measure":7,"measureCount":1,"bpm":240,"selectedTrack":0,"tracks":[track3],"scrollLeft":100});
patterns.push({measure: 4,measureCount: 1,bpm: 140,selectedTrack: 0,tracks:[{scroll: 1000, events: []}], scrollLeft: 0});

var songs = [];

var blockline1=[{}, {}];
var blockline2=[{"id":"8a3bcf2aadc59f6ee6d983d31d461a87"},{}];
var blockline3=[{},{"id":"8a3bcf2aadc59f6ee6d983d31d461a87"}];
var blockline4=[];
var blockline5=[{},{"id":"8a3bcf2aadc59f6ee6d983d31d461a87"},{"id":"8a3bcf2aadc59f6ee6d983d31d461a87"}];
var blockline6=[{},{"id":"fe88881777aaab1a8100009328"},{"id":"8a3bcf2aadc59f6ee6d983d31d461a87"}];

songs.push({"measure":4,"bpm":140,"tracks":[{"blocks":blockline1},{"blocks":blockline1}]});
songs.push({"measure":6,"bpm":160,"tracks":[{"blocks":blockline1},{"blocks":blockline1}]});
songs.push({"measure":3,"bpm":140,"tracks":[{"blocks":blockline1},{"blocks":blockline1}]});
songs.push({"measure":4,"bpm":140,"tracks":[{"blocks":blockline1},{"blocks":blockline1}]});
songs.push({"measure":4,"bpm":140,"tracks":[{"blocks":blockline2},{"blocks":blockline3}]});
songs.push({"measure":4,"bpm":140,"tracks":[]});
songs.push({"measure":3,"bpm":100,"tracks":[{"blocks":blockline5},{"blocks":blockline5}]});
songs.push({"measure":3,"bpm":100,"tracks":[{"blocks":blockline5}]});
songs.push({"measure":8,"bpm":200,"tracks":[{"blocks":blockline1}]});
songs.push({"measure":3,"bpm":100,"tracks":[{"blocks":blockline6},{"blocks":blockline5}]});

var instruments = [];
instruments.push({"type": "envelope","data": {"attackTime": 0.0,"decayTime": 0.2,"sustainLevel": 0.8,"releaseTime": 0.2}});
instruments.push({
        "type": "oscillator",
        "data": {
          "modulation": {"detune": {"type": "stack","data": {"array": []}}},
          "oscillatorType": "custom",
          "waveform": "t > 0.3 ? t*8 : -t",
          "serie": {"sin": "0","cos": "0"},
          "terms": {
            "cos": [1.4694837135381,-0.05811631480024501,0.08248444874056014,0.023188238300227558,-0.051292761203623576,-0.0044855735267106634,0.016856579675364008,-0.028160272055584648,-0.022614464066654908,0.007785047414303945,-0.013744214801988742,-0.02708171838998731,-0.0021888840943413415,-0.005338338284473223,-0.025070038083245004,-0.011156849033433088,-0.002110373689301874,-0.019818826677008575,-0.017588682300379303,-0.003090343866042265,-0.01376903233508286,-0.020669499227740456,-0.006843525047976177,-0.008821202859850016,-0.02044113857671811,-0.011656052320659022,-0.006167663022861589,-0.01771854438040582,-0.015898131373370237,-0.006162105321761179,-0.013812753122002738,-0.01838657052343104,-0.00836035631727614,-0.010143206427175807,-0.01862435283035646,-0.011745649501742509,-0.007849195365625098,-0.016848605849780787,-0.015080293216611826,-0.007506333929832881,-0.013879425554534463,-0.017285818329904157,-0.009020706807841332,-0.010820021760948451,-0.017746643354829967,-0.011720762804779608,-0.008699498273902708,-0.016456746423880567,-0.014610338561006693,-0.008162859658454386,-0.013975927595184762,-0.016701494300879846,-0.009295613974067052,-0.011218115156888291,-0.0173256982166443,-0.011628419049618014,-0.009142005632425116,-0.01633160131970503,-0.014313021532807927,-0.00844090532734798,-0.014113803462140912,-0.01641030519145523,-0.009326208227179392,-0.011468781155593083],
            "sin": [0,-0.6702701632108987,-0.31985838759309226,-0.12028817754153127,-0.12360139121590197,-0.14007173679336007,-0.0744503184116591,-0.05536205584782911,-0.08422295789418317,-0.06161640617411701,-0.03358421330771915,-0.05319278182362812,-0.05371232236222591,-0.02698500578378094,-0.03334308961744409,-0.04548345731832984,-0.026433668309241418,-0.02114038836406159,-0.036156380700353506,-0.027495899301806022,-0.01493292652988382,-0.026531853337365432,-0.027675138236243988,-0.013182662592517437,-0.01791356036180057,-0.02580942289515569,-0.014137071724574296,-0.011466528718933057,-0.021826567717179987,-0.01598949069613282,-0.007812848984092324,-0.0164638257300942,-0.017199166761143386,-0.006861105734933325,-0.01089020771801434,-0.016787403510782346,-0.00786754069757601,-0.0062865315059450885,-0.014494684276603014,-0.009685088783469128,-0.003477553174497991,-0.010746688847852948,-0.011114292504971052,-0.0027049053447492357,-0.006440792293415876,-0.011248425838138624,-0.0035914303317176677,-0.002618874713832647,-0.009712955674689135,-0.005294042284711301,-0.00012370793661878695,-0.006734075531089744,-0.006789425838301729,0.0006612596111959696,-0.0030234785431653803,-0.007201180635301028,-0.00008374067045622572,0.0004791814519140054,-0.0060680347753423085,-0.0016910466014020092,0.002923602458449628,-0.003473406800564464,-0.0032331799351212856,0.003827724462733115]
          }
        }
      }
);

instruments.push(
{
  "type": "stack",
  "data": {
    "array": [{"type": "envelope","data": {"attackTime": 0.0,"decayTime": 0.2,"sustainLevel": 0.8,"releaseTime": 0.2  }},
    {
        "type": "oscillator",
        "data": {
          "modulation": {"detune": {  "type": "stack",  "data": {"array": []  }}},
          "oscillatorType": "custom",
          "waveform": "t > 0.3 ? t*8 : -t",
          "serie": {"sin": "0","cos": "0"
          },
          "terms": {
            "cos": [1.4694837135381,-0.05811631480024501,0.08248444874056014,0.023188238300227558,-0.051292761203623576,-0.0044855735267106634,0.016856579675364008,-0.028160272055584648,-0.022614464066654908,0.007785047414303945,-0.013744214801988742,-0.02708171838998731,-0.0021888840943413415,-0.005338338284473223,-0.025070038083245004,-0.011156849033433088,-0.002110373689301874,-0.019818826677008575,-0.017588682300379303,-0.003090343866042265,-0.01376903233508286,-0.020669499227740456,-0.006843525047976177,-0.008821202859850016,-0.02044113857671811,-0.011656052320659022,-0.006167663022861589,-0.01771854438040582,-0.015898131373370237,-0.006162105321761179,-0.013812753122002738,-0.01838657052343104,-0.00836035631727614,-0.010143206427175807,-0.01862435283035646,-0.011745649501742509,-0.007849195365625098,-0.016848605849780787,-0.015080293216611826,-0.007506333929832881,-0.013879425554534463,-0.017285818329904157,-0.009020706807841332,-0.010820021760948451,-0.017746643354829967,-0.011720762804779608,-0.008699498273902708,-0.016456746423880567,-0.014610338561006693,-0.008162859658454386,-0.013975927595184762,-0.016701494300879846,-0.009295613974067052,-0.011218115156888291,-0.0173256982166443,-0.011628419049618014,-0.009142005632425116,-0.01633160131970503,-0.014313021532807927,-0.00844090532734798,-0.014113803462140912,-0.01641030519145523,-0.009326208227179392,-0.011468781155593083],
            "sin": [0,-0.6702701632108987,-0.31985838759309226,-0.12028817754153127,-0.12360139121590197,-0.14007173679336007,-0.0744503184116591,-0.05536205584782911,-0.08422295789418317,-0.06161640617411701,-0.03358421330771915,-0.05319278182362812,-0.05371232236222591,-0.02698500578378094,-0.03334308961744409,-0.04548345731832984,-0.026433668309241418,-0.02114038836406159,-0.036156380700353506,-0.027495899301806022,-0.01493292652988382,-0.026531853337365432,-0.027675138236243988,-0.013182662592517437,-0.01791356036180057,-0.02580942289515569,-0.014137071724574296,-0.011466528718933057,-0.021826567717179987,-0.01598949069613282,-0.007812848984092324,-0.0164638257300942,-0.017199166761143386,-0.006861105734933325,-0.01089020771801434,-0.016787403510782346,-0.00786754069757601,-0.0062865315059450885,-0.014494684276603014,-0.009685088783469128,-0.003477553174497991,-0.010746688847852948,-0.011114292504971052,-0.0027049053447492357,-0.006440792293415876,-0.011248425838138624,-0.0035914303317176677,-0.002618874713832647,-0.009712955674689135,-0.005294042284711301,-0.00012370793661878695,-0.006734075531089744,-0.006789425838301729,0.0006612596111959696,-0.0030234785431653803,-0.007201180635301028,-0.00008374067045622572,0.0004791814519140054,-0.0060680347753423085,-0.0016910466014020092,0.002923602458449628,-0.003473406800564464,-0.0032331799351212856,0.003827724462733115]
          }
        }
      }
    ]
  }
});


instruments.push({
  "type": "stack",
  "data": {
    "array": [
      {"type":"envelope","data":{"attackTime": 0.0,"decayTime": 0.4,"sustainLevel": 0.8,"releaseTime": 0.4}},
      {"type": "oscillator",
        "data": {
          "modulation": {
            "detune": {
              "type": "stack",
              "data": {
                "array": [
                  {
                    "type": "rise",
                    "data": {
                      "time": "2",
                      "target": "-10000"
                    }
                  }
                ]
              }
            }
          },
          "oscillatorType": "sine",
          "fixed_frequency": false
        }
      }
    ]
  }
});

instruments.push({
  "type": "stack",
  "data": {
    "array": [
      {
        "type": "envelope",
        "data": {
          "attackTime": 0.0,
          "decayTime": 0.4,
          "sustainLevel": 0.8,
          "releaseTime": 0.4
        }
      },
      {
        "type": "noise",
        "data": {}
      }
    ]
  }
});

instruments.push({
  "type": "stack",
  "data": {
    "array": [
      {
        "type": "envelope",
        "data": {
          "attackTime": 0.4,
          "decayTime": 0.2,
          "sustainLevel": 0.8,
          "releaseTime": 0.2
        }
      },
      {
        "type": "oscillator",
        "data": {
          "modulation": {
            "detune": {
              "type": "stack",
              "data": {
                "array": [
                  {
                    "type": "scale",
                    "data": {
                      "base": "-100",
                      "top": "100"
                    }
                  },
                  {
                    "type": "oscillator",
                    "data": {
                      "modulation": {
                        "detune": {
                          "type": "stack",
                          "data": {
                            "array": []
                          }
                        }
                      },
                      "oscillatorType": "sine",
                      "fixed_frequency": true,
                      "frequency": "4"
                    }
                  }
                ]
              }
            }
          },
          "oscillatorType": "sine"
        }
      }
    ]
  }
});

var deepEqual = function(obj1, obj2) {
  expect(typeof obj1).to.be(typeof obj2);

  if (typeof obj1 === 'object') {
    var allKeys = {};
    //expect(Object.keys(obj1).length).to.be(Object.keys(obj2).length);
    Object.keys(obj1).forEach(function(key) {
      allKeys[key]=1;
    });

    Object.keys(obj2).forEach(function(key) {
      allKeys[key]=1;
    });

    Object.keys(allKeys).forEach(function(key) {
      deepEqual(obj1[key], obj2[key]);
    });

  } else if (Array.isArray(obj1)) {
    expect(obj1.length).to.be(obj2.length);
    for (var i=0; i<obj1.length; i++) {
      deepEqual(obj1[i], obj2[i]);
    }
  } else {
    expect(obj1).to.be(obj2);
  }
};

DeserializerTest.test = function(serializerfunc, deserializerfunc, extras) {

  var generateTests = function(type) {
    return function(obj) {
      describe("when serialized " + JSON.stringify(obj), function() {
        beforeEach(function() {
          this.serialized = serializerfunc(type, obj);
        });

        describe("when deserialized", function() {
          beforeEach(function() {
            this.deserialized = deserializerfunc(type, this.serialized);
          });

          it("should match original", function() {
            deepEqual(this.deserialized, obj);
          });
        });
      });
    };
  };

  var extraInstruments = [];
  var extraPatterns = [];
  if (extras) extraInstruments = extras.instruments||[];
  if (extras) extraPatterns = extras.patterns||[];


  describe("patterns", function() {
    patterns.concat(extraPatterns).forEach(generateTests('pattern'));
  });

  describe("songs", function() {
    songs.forEach(generateTests('song'));
  });

  describe("instruments", function() {
    instruments.concat(extraInstruments).forEach(generateTests('instrument'));
  });  
};

})();