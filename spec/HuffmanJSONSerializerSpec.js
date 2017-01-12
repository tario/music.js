describe("HuffmanJSONSerializer", function() {
  var jsonSerializer = {
    serialize: function(type, obj) {
      return JSON.stringify(obj);
    }
  };

  var serializer = SerializerOracle.HuffmanPackedJSON(jsonSerializer);
  var deserializer = MUSIC.Formats.HuffmanSerializerWrapper(MUSIC.Formats.JSONSerializer);

  DeserializerTest.test(serializer.serialize, deserializer.deserialize);
});
