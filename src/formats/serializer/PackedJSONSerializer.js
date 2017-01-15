MUSIC = MUSIC ||{};
MUSIC.Formats = MUSIC.Formats||{};
MUSIC.Formats.PackedJSONSerializer = {};

(function() {

var objToArrayPacker = function(keys) {
  var pack = function(obj) {
    var array = [];
    for (var i=0; i<keys.length; i++) {
      var key = keys[i];
      if (Array.isArray(key)) {
        array.push(key[1].pack(obj[key[0]], obj));
      } else {
        if (obj[key]!==null && obj[key]!==undefined) array.push(obj[key]);
      }
    }
    return array;
  };

  var unpack = function(array) {
    var obj = {};
    for (var i=0; i<array.length; i++) {
      var key = keys[i];
      if (Array.isArray(key)) {
        obj[key[0]] = key[1].unpack(array[i], obj);
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

var substitution = function(keys) {
  var pack = function(obj) {
    var idx = keys.indexOf(obj);
    if (idx === -1) return obj;
    return idx;
  };

  var unpack = function(obj) {
    if (isNaN(obj)) return obj;
    return keys[obj];
  };

  return {pack: pack, unpack: unpack};
};

var switchPacker = function(selectAttribute, packers) {

  var pack = function(obj, parent) {
    var innerPacker = packers[parent[selectAttribute]];
    if (!innerPacker) {
      return obj;
    }

    return innerPacker.pack(obj);
  };

  var unpack = function(obj, parent) {
    var innerPacker = packers[parent[selectAttribute]];
    if (!innerPacker) {
      return obj;
    }

    return innerPacker.unpack(obj);
  };

  return {pack: pack, unpack: unpack};
};

var booleanPacker = {
  pack: function(obj) {
    if (obj === undefined) return 3;
    if (obj === null) return 4;

    return !!obj ? 1 : 0;
  },

  unpack: function(obj) {
    if (obj===3) return undefined;
    if (obj===4) return null;

    return obj === 1 ? true : false
  }
};

var nullable = function(innerPacker) {
  var pack = function(obj) {
    if (obj === undefined) return 0;
    if (obj === null) return 1;

    return innerPacker? innerPacker.pack(obj) : obj;
  };

  var unpack = function(obj) {
    if (obj===0) return undefined;
    if (obj===1) return null;

    return innerPacker ? innerPacker.unpack(obj) : obj;
  };

  return {pack: pack, unpack: unpack};
};



var songPacker = patternIndexPacker(objToArrayPacker([
  "patterns",
  "measure",
  "bpm",
  ["tracks", flatten(array(objToArrayPacker([
    ["blocks", flatten(array(objToArrayPacker(["id"])),1)]
  ])),1)]
]));

var recursiveInstrumentPacker = {
  pack: function(obj) {
    return instrumentPacker.pack(obj);
  },

  unpack: function(obj) {
    return instrumentPacker.unpack(obj);
  }
};

var stackPacker = objToArrayPacker([
  ["array", array(recursiveInstrumentPacker)]
]);

var envelopePacker = objToArrayPacker(["attackTime","decayTime","sustainLevel","releaseTime", ["reset_on_cut", booleanPacker]]);
var oscillatorPacker = objToArrayPacker([
  ["oscillatorType", substitution(["sine", "square", "sawtooth", "triangle", "custom"])],
  ["fixed_frequency", booleanPacker],
  ["frequency", nullable()],
  ["waveform", nullable()],
  ["serie", nullable(objToArrayPacker(["sin", "cos"]))],
  ["terms", nullable(objToArrayPacker(["sin", "cos"]))],
  ["modulation", nullable(objToArrayPacker([
    ["detune", recursiveInstrumentPacker]
  ]))]
]);

var frequencyFilterPacker = objToArrayPacker([
  "frequency",
  "detune",
  "Q",
  ["modulation", objToArrayPacker([
    ["frequency", recursiveInstrumentPacker],
    ["detune", recursiveInstrumentPacker],
    ["Q", recursiveInstrumentPacker]
  ])]
]);

var noParametersPacker = objToArrayPacker([]);

var typeNames = ["script","null","oscillator","notesplit","rise","adsr",
"envelope","transpose","scale","gain","echo","lowpass",
"highpass","bandpass","lowshelf","highshelf","peaking",
"notch","allpass","reverb","noise","pink_noise","red_noise","arpeggiator","stack"];

var instrumentPacker = objToArrayPacker([
  ["type", substitution(typeNames)],
  ["data", switchPacker('type', {
      script: objToArrayPacker(["code"]),
      'null': noParametersPacker,
      oscillator: oscillatorPacker,
      notesplit: objToArrayPacker(["delay"]),
      rise: objToArrayPacker(["time", "target"]),
      adsr: envelopePacker,
      envelope: envelopePacker,
      transpose: objToArrayPacker(["amount"]),
      scale: objToArrayPacker(["base", "top"]),
      gain: objToArrayPacker(["gain"]),
      echo: objToArrayPacker(["gain", "delay"]),
      lowpass: frequencyFilterPacker,
      highpass: frequencyFilterPacker,
      bandpass: frequencyFilterPacker,
      lowshelf: frequencyFilterPacker,
      highshelf: frequencyFilterPacker,
      peaking: frequencyFilterPacker,
      notch: frequencyFilterPacker,
      allpass: frequencyFilterPacker,
      reverb: objToArrayPacker(["room", "damp", "mix"]),
      noise: noParametersPacker,
      pink_noise: noParametersPacker,
      red_noise: noParametersPacker,
      arpeggiator: objToArrayPacker(["scale", "interval", "duration", "gap"]),
      stack: stackPacker
    }
  )],
]);

var packer = {
  pattern: patternPacker,
  song: songPacker,
  instrument: instrumentPacker
};

MUSIC.Formats.PackedJSONSerializer.serialize = function(type, obj) {
  if (packer[type]) {
    var str = JSON.stringify(packer[type].pack(obj));
    str = str.slice(1, str.length-1);
    return str
  }

  return JSON.stringify(obj);
};

MUSIC.Formats.PackedJSONSerializer.deserialize = function(type, str) {
  if (packer[type]) {
    return packer[type].unpack(JSON.parse('['+str+']'));
  }

  return JSON.parse(str);
};

})();
