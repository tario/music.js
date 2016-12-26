describe("PackedJSONSerializer", function() {
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
    return {pack: pack};
  };

  var array = function(innerPacker) {
    var pack = function(obj) {
      return obj.map(innerPacker.pack);
    };
    return {pack: pack};
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

  var serializerv1 = function(type, obj) {
    if (type === "pattern") return JSON.stringify(patternPacker.pack(obj));
    return JSON.stringify(obj);
  };

  DeserializerTest.test(serializerv1, MUSIC.Formats.PackedJSONSerializer.deserialize);
});
