describe("PackedJSONSerializerBV6", function() {
  var patterns = [];
  var track1 = {"scroll":653,"events":[{"n":6,"s":48,"l":961,"tc":0.01},{"n":640,"s":2160,"l":960}]}

  patterns.push({"measure":7,"measureCount":1,"bpm":240,"selectedTrack":0,"tracks":[track1],"scrollLeft":100});

  DeserializerTest.test(SerializerOracle.PackedJSONBV6.serialize, MUSIC.Formats.PackedJSONSerializerB.deserialize, {
    patterns: patterns
  });
});
