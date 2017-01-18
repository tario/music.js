describe("PackedJSONSerializerV3", function() {
  var instruments = [];

  var obj0 = {"type":"oscillator","data":{"modulation":{"detune":{"type":"stack","data":{"array":[]}}},"oscillatorType":"square","time_constant":"0.1"}};
  var obj1 = {"data":{"array":[obj0]},"type":"stack"};
  var obj2 = {"data":{"array":[{"type":"gain","data":{"gain": 0.5}}]},"type":"stack"};
  var obj3 = {"data":{"array":[{"type":"gain","data":{"gain": 0.5}}, obj0]},"type":"stack"};
  instruments.push({"type":"stack","data":{"array":[{"type":"multi_instrument","data":{"subobjects":[obj1]}}]}});
  instruments.push({"type":"stack","data":{"array":[{"type":"multi_instrument","data":{"subobjects":[obj1, obj1]}}]}});
  instruments.push({"type":"stack","data":{"array":[{"type":"multi_instrument","data":{"subobjects":[]}}]}});
  instruments.push({"type":"stack","data":{"array":[{"type":"multi_instrument","data":{"subobjects":[obj1, obj2]}}]}});
  instruments.push({"type":"stack","data":{"array":[{"type":"multi_instrument","data":{"subobjects":[obj2, obj1]}}]}});
  instruments.push({"type":"stack","data":{"array":[obj2, {"type":"multi_instrument","data":{"subobjects":[obj1]}}]}});
  instruments.push({"type":"stack","data":{"array":[obj2, {"type":"multi_instrument","data":{"subobjects":[obj1, obj3]}}]}});

  DeserializerTest.test(SerializerOracle.PackedJSONV3.serialize, MUSIC.Formats.PackedJSONSerializer.deserialize, {
    instruments: instruments
  });
});
