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
        array.push(key[1].pack(obj[key[0]]));
      } else {
        array.push(obj[key]);
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
        obj[key] = array[i];
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

var patternPacker = objToArrayPacker([
  "measure",
  "measureCount",
  "bpm",
  "selectedTrack",
  "scrollLeft",
  ["tracks", array(
    objToArrayPacker(["scroll",["events", array(objToArrayPacker(["n","s","l"]))]])
  )]
]);


MUSIC.Formats.PackedJSONSerializer.serialize = function(type, obj) {
  if (type === "pattern") return JSON.stringify(patternPacker.pack(obj));
  return JSON.stringify(obj);
};

MUSIC.Formats.PackedJSONSerializer.deserialize = function(type, str) {
  if (type === "pattern") return patternPacker.unpack(JSON.parse(str));
  return JSON.parse(str);
};

})();
