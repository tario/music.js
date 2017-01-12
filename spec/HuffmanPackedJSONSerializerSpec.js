describe("HuffmanPackedJSONSerializer", function() {
  var serializer = SerializerOracle.HuffmanPackedJSON(SerializerOracle.PackedJSON);
  var deserializer = MUSIC.Formats.HuffmanSerializerWrapper(MUSIC.Formats.PackedJSONSerializer);

  DeserializerTest.test(serializer.serialize, deserializer.deserialize);
});
