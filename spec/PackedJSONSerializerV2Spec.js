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

  for (var tc = 0.3; tc<2; tc+=0.25) {
    instruments.push({
      "type": "stack",
      "data": {
        "array": [
          {
            "type": "envelope",
            "data": {
              "attackTime": 0.4,
              "decayTime": 0.2,
              "sustainLevel": 0.8,
              "releaseTime": 0.2
            }
          },
          {
            "type": "oscillator",
            "data": {
              "modulation": {
                "detune": {
                  "type": "stack",
                  "data": {
                    "array": [
                      {
                        "type": "scale",
                        "data": {
                          "base": "-100",
                          "top": "100"
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
                          "oscillatorType": "sine",
                          "fixed_frequency": true,
                          "frequency": "4"
                        }
                      }
                    ]
                  }
                }
              },
              "oscillatorType": "sine",
              "time_constant": tc
            }
          }
        ]
      }
    });
  }

  DeserializerTest.test(SerializerOracle.PackedJSONV2.serialize, MUSIC.Formats.PackedJSONSerializer.deserialize, {
    instruments: instruments
  });
});
