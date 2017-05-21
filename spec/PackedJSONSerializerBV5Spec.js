describe("PackedJSONSerializerBV5", function() {
  var instruments = [];

  instruments.push({
    "type": "oscillator",
    "data": {
      "oscillatorType": "square",
      "waveform": "t > 0.5 ? 1 : -1",
      "serie": {
        "sin": "0",
        "cos": "0"
      },
      "terms": {
        "sin": [],
        "cos": []
      },
      "modulation": {
        "detune": {
          "type": "stack",
          "data": {
            "array": []
          }
        }
      },
      "time_constant": 0.005
    }
  });

  instruments.push({
    "type": "oscillator",
    "data": {
      "oscillatorType": "square",
      "waveform": "t > 0.5 ? 1 : -1",
      "serie": {
        "sin": "0",
        "cos": "0"
      },
      "terms": {
        "sin": [],
        "cos": []
      },
      "modulation": {
        "detune": {
          "type": "stack",
          "data": {
            "array": []
          }
        }
      },
      "time_constant": 0.005,
      "pulse_width": "0.75"
    }
  });


  instruments.push({
    "type": "oscillator",
    "data": {
      "oscillatorType": "square",
      "waveform": "t > 0.5 ? 1 : -1",
      "serie": {
        "sin": "0",
        "cos": "0"
      },
      "terms": {
        "sin": [],
        "cos": []
      },
      "modulation": {
        "detune": {
          "type": "stack",
          "data": {
            "array": []
          }
        },
        "pulse_width": {
          "type": "stack",
          "data": {
            "array": [
              {
                "type": "signal_scale",
                "data": {
                  "base": "-0.97",
                  "top": "1.05"
                }
              },
              {
                "type": "rise",
                "data": {
                  "time": "1.8",
                  "target": "0.45"
                }
              }
            ]
          }
        }
      },
      "time_constant": 0.005
    }
  });

  instruments.push({
    "type": "oscillator",
    "data": {
      "oscillatorType": "square",
      "waveform": "t > 0.5 ? 1 : -1",
      "serie": {
        "sin": "0",
        "cos": "0"
      },
      "terms": {
        "sin": [],
        "cos": []
      },
      "modulation": {
        "detune": {
          "type": "stack",
          "data": {
            "array": []
          }
        },
        "pulse_width": {
          "type": "stack",
          "data": {
            "array": [
              {
                "type": "signal_scale",
                "data": {
                  "base": "-0.97",
                  "top": "1.05"
                }
              },
              {
                "type": "rise",
                "data": {
                  "time": "1.8",
                  "target": "0.45"
                }
              }
            ]
          }
        }
      },
      "time_constant": 0.005,
      "pulse_width": "0.75"
    }
  });

  DeserializerTest.test(SerializerOracle.PackedJSONBV5.serialize, MUSIC.Formats.PackedJSONSerializerB.deserialize, {
    instruments: instruments
  });
});
