describe("PackedJSONSerializerBV2", function() {
  var instruments = [];

  var obj1 = {"type": "note_padding", "data": {"time": 0.3}};
  var obj2 = {"type": "note_padding", "data": {"time": 0.05}};

  instruments.push({"type":"stack","data":{"array":[obj1]}});
  instruments.push({"type":"stack","data":{"array":[obj2]}});
  instruments.push(obj1);
  instruments.push(obj2);

  instruments.push({
    "type": "stack",
    "data": {
      "array": [
        {
          "type": "envelope",
          "data": {
            "attackTime": 0.01,
            "decayTime": "0.42",
            "sustainLevel": 0.8,
            "releaseTime": 0.4
          }
        },
        {
          "type": "oscillator",
          "data": {
            "modulation": {
              "detune": {
                "type": "stack",
                "data": {
                  "array": []
                }
              }
            },
            "oscillatorType": "square",
            "time_constant": 0.005
          }
        }
      ]
    }
  });


  DeserializerTest.test(SerializerOracle.PackedJSONBV2.serialize, MUSIC.Formats.PackedJSONSerializerB.deserialize, {
    instruments: instruments
  });
});
