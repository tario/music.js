describe("PackedJSONSerializer", function() {
  DeserializerTest.test(SerializerOracle.PackedJSON.serialize, MUSIC.Formats.PackedJSONSerializer.deserialize);
});
