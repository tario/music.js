describe("PackedJSONSerializerBV2", function() {
  var instruments = [];

  var obj1 = {"type": "note_padding", "data": {"time": 0.3}};
  var obj2 = {"type": "note_padding", "data": {"time": 0.05}};

  instruments.push({"type":"stack","data":{"array":[obj1]}});
  instruments.push({"type":"stack","data":{"array":[obj2]}});
  instruments.push(obj1);
  instruments.push(obj2);

  DeserializerTest.test(SerializerOracle.PackedJSONBV2.serialize, MUSIC.Formats.PackedJSONSerializerB.deserialize, {
    instruments: instruments
  });
});
