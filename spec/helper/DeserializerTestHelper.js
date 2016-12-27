DeserializerTest = {};
(function() {

var patterns = [];

var track1 = {"scroll":1000,"instrument": "8a3bcf2aadc59f6ee6d983d31d461a87", "events":[{"n":66,"s":48,"l":96},{"n":64,"s":216,"l":96}]};
var track2 = {"scroll":653,"events":[{"n":6,"s":48,"l":961},{"n":640,"s":2160,"l":960}]}
var track3 = {"scroll":6665,"instrument": "2a3bcf2aadc59f6AAAA321141BBC1a14", "events":[]}

patterns.push({"measure":5,"measureCount":1,"bpm":140,"selectedTrack":0,"tracks":[track1],"scrollLeft":0});
patterns.push({"measure":15,"measureCount":1,"bpm":240,"selectedTrack":0,"tracks":[track2],"scrollLeft":10});
patterns.push({"measure":15,"measureCount":1,"bpm":440,"selectedTrack":0,"tracks":[track1],"scrollLeft":10});
patterns.push({"measure":15,"measureCount":1,"bpm":440,"selectedTrack":0,"tracks":[],"scrollLeft":10});
patterns.push({"measure":15,"measureCount":1,"bpm":440,"selectedTrack":0,"tracks":[track1, track2],"scrollLeft":10});
patterns.push({"measure":7,"measureCount":1,"bpm":440,"selectedTrack":0,"tracks":[track1, track1],"scrollLeft":1000});
patterns.push({"measure":7,"measureCount":1,"bpm":440,"selectedTrack":0,"tracks":[track1, track1, track1, track1, track1, track1],"scrollLeft":1000});
patterns.push({"measure":7,"measureCount":1,"bpm":240,"selectedTrack":0,"tracks":[track3, track3],"scrollLeft":1000});
patterns.push({"measure":7,"measureCount":1,"bpm":240,"selectedTrack":0,"tracks":[track3],"scrollLeft":100});

var songs = [];

var blockline1=[{}, {}];
var blockline2=[{"id":"8a3bcf2aadc59f6ee6d983d31d461a87"},{}];
var blockline3=[{},{"id":"8a3bcf2aadc59f6ee6d983d31d461a87"}];
var blockline4=[];
var blockline5=[{},{"id":"8a3bcf2aadc59f6ee6d983d31d461a87"},{"id":"8a3bcf2aadc59f6ee6d983d31d461a87"}];

songs.push({"measure":4,"bpm":140,"tracks":[{"blocks":blockline1},{"blocks":blockline1}]});
songs.push({"measure":6,"bpm":160,"tracks":[{"blocks":blockline1},{"blocks":blockline1}]});
songs.push({"measure":3,"bpm":140,"tracks":[{"blocks":blockline1},{"blocks":blockline1}]});
songs.push({"measure":4,"bpm":140,"tracks":[{"blocks":blockline1},{"blocks":blockline1}]});
songs.push({"measure":4,"bpm":140,"tracks":[{"blocks":blockline2},{"blocks":blockline3}]});
songs.push({"measure":4,"bpm":140,"tracks":[]});
songs.push({"measure":3,"bpm":100,"tracks":[{"blocks":blockline5},{"blocks":blockline5}]});
songs.push({"measure":3,"bpm":100,"tracks":[{"blocks":blockline5}]});
songs.push({"measure":8,"bpm":200,"tracks":[{"blocks":blockline1}]});

var instruments = [];

var deepEqual = function(obj1, obj2) {
  expect(typeof obj1).to.be(typeof obj2);

  if (typeof obj1 === 'object') {
    expect(Object.keys(obj1).length).to.be(Object.keys(obj2).length);
    Object.keys(obj1).forEach(function(key) {
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

DeserializerTest.test = function(serializerfunc, deserializerfunc) {

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

  describe("patterns", function() {
    patterns.forEach(generateTests('pattern'));
  });

  describe("songs", function() {
    songs.forEach(generateTests('song'));
  });

  describe("instruments", function() {
    songs.forEach(generateTests('instrument'));
  });  
};

})();