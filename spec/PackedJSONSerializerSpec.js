describe("PackedJSONSerializer", function() {

  var objToArrayPacker = function(keys) {
    var pack = function(obj) {
      var array = [];
      for (var i=0; i<keys.length; i++) {
        var key = keys[i];
        if (Array.isArray(key)) {
          array.push(key[1].pack(obj[key[0]]));
        } else {
          if (obj[key]!==null && obj[key]!==undefined) array.push(obj[key]);
        }
      }
      return array;
    };

    var unpack = function(array) {
      var obj = {};
      for (var i=0; i<keys.length; i++) {
        var key = keys[i];
        if (Array.isArray(key)) {
          obj[key[0]] = key[1].unpack(array[i]);
        } else {
          if (array[i]!==null && array[i]!==undefined) obj[key] = array[i];
        }
      }
      return obj;
    };

    return {pack: pack, unpack: unpack};
  };

  var array = function(innerPacker) {
    var pack = function(obj) {
      return obj.map(innerPacker.pack);
    };

    var unpack = function(array) {
      return array.map(innerPacker.unpack);
    };

    return {pack: pack, unpack: unpack};
  };

  var concat = function(a, b){return a.concat(b); };
  var flatten = function(innerPacker, size) {
    var pack = function(obj) {
      var ret = innerPacker.pack(obj);
      return ret.reduce(concat, []);
    };

    var unpack = function(array) {
      var deflatted = [];
      for (var i=0; i<array.length; i+=size) {
        deflatted.push(array.slice(i,i+size));
      }
      return innerPacker.unpack(deflatted);
    };

    return {pack: pack, unpack: unpack};
  };

  var patternPacker = objToArrayPacker([
    "measure",
    "measureCount",
    "bpm",
    "selectedTrack",
    "scrollLeft",
    ["tracks", flatten(array(
      objToArrayPacker(["scroll",["events", flatten(array(objToArrayPacker(["n","s","l"])),3)], "instrument"])
    ),3)]
  ]);

  var patternIndexPacker = function(inner) {
    var pack = function(obj) {
      var patterns = [];
      var convertBlocks = function(block) {
        if(block.id) {
          if (patterns.indexOf(block.id)===-1) patterns.push(block.id);
          return {id: patterns.indexOf(block.id)+1};
        } else {
          return {id: 0};
        }
      };

      var convertTrack = function(track) {
        return {
          blocks: track.blocks.map(convertBlocks)
        };
      };

      var newObject = {
        patterns: patterns,
        measure: obj.measure,
        bpm: obj.bpm,
        tracks: obj.tracks.map(convertTrack)
      };

      return inner.pack(newObject);
    };

    var unpack = function(obj) {
      var ret = inner.unpack(obj);
      ret.tracks.forEach(function(track) {
        track.blocks.forEach(function(block) {
          if (block.id === 0) {
            delete block.id;
          } else {
            block.id = ret.patterns[block.id-1];
          }
        });
      });

      return {
        measure: ret.measure,
        bpm: ret.bpm,
        tracks: ret.tracks
      };
    };

    return {pack: pack, unpack: unpack};
  };


  var songPacker = patternIndexPacker(objToArrayPacker([
    "patterns",
    "measure",
    "bpm",
    ["tracks", flatten(array(objToArrayPacker([
      ["blocks", array(objToArrayPacker(["id"]))]
    ])),1)]
  ]));

  var packer = {
    pattern: patternPacker,
    song: songPacker
  };

  var serializerv1 = function(type, obj) {
    if (packer[type]) {
      var str = JSON.stringify(packer[type].pack(obj));
      str = str.slice(1, str.length-1);
      return str
    }
    return JSON.stringify(obj);
  };

  DeserializerTest.test(serializerv1, MUSIC.Formats.PackedJSONSerializer.deserialize);
});
