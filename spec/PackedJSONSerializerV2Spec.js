describe("PackedJSONSerializerV2", function() {
  var instruments = [];
  instruments.push({
    "type": "stack",
    "data": {
      "array": [
        {
          "type": "envelope",
          "data": {
            "attackTime": 0.0,
            "decayTime": 0.4,
            "sustainLevel": 0.8,
            "releaseTime": 0.4
          }
        },
        {
          "type": "noise",
          "data": {}
        }
      ]
    }
  });

  instruments.push({
    "type": "stack",
    "data": {
      "array": [
        {
          "type": "envelope",
          "data": {
            "attackTime": 0.0,
            "decayTime": 0.4,
            "sustainLevel": 0.8,
            "releaseTime": 0.4,
            "reset_on_cut": false
          }
        },
        {
          "type": "noise",
          "data": {}
        }
      ]
    }
  });

  DeserializerTest.test(SerializerOracle.PackedJSONV2.serialize, MUSIC.Formats.PackedJSONSerializer.deserialize, {
    instruments: instruments
  });
});
