describe("PackedJSONSerializerV4", function() {
  var instruments = [];

  var obj1 = {"type": "monophoner", "data": {"force_note_cut": true}};
  var obj2 = {"type": "monophoner", "data": {"force_note_cut": false}};
  var obj3 = {"type": "polyphoner", "data": {"maxChannels": 2}};
  var obj4 = {"type": "polyphoner", "data": {"maxChannels": 4}};

  instruments.push({"type":"stack","data":{"array":[obj1]}});
  instruments.push({"type":"stack","data":{"array":[obj2]}});
  instruments.push({"type":"stack","data":{"array":[obj3]}});
  instruments.push({"type":"stack","data":{"array":[obj4]}});

  instruments.push({"type":"stack","data":{"array":[obj3, obj1]}});
  instruments.push({"type":"stack","data":{"array":[obj4]}});

  instruments.push(obj1);
  instruments.push(obj2);
  instruments.push(obj3);
  instruments.push(obj4);

  DeserializerTest.test(SerializerOracle.PackedJSONV4.serialize, MUSIC.Formats.PackedJSONSerializer.deserialize, {
    instruments: instruments
  });
});
