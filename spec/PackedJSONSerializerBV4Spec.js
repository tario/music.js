describe("PackedJSONSerializerBV3", function() {
  var instruments = [];
  var obj1 = {"type": "adsr", "data": {"attackTime": "0.0","decayTime": 0.4,"sustainLevel": 0.8,"releaseTime": "0.2"}};
  var obj2 = {"type": "note_condition", "data": {
    "note_on": 0.1,
    "note_off": 1,
    "enter_time_constant": 0.01,
    "leave_time_constant": 0.1
  }};
  var obj3 = {"type": "signal_monitor", "data": {}};
  var obj4 = {"type": "signal_constant", "data": {"offset": 0.3}};
  var obj5 = {"type": "note_delay", "data": {"delay": 0.4}};
  var obj6 = {"type": "sample_rate_reduction", "data": {"factor": 4}};
  var obj7 = {"type": "bit_crushing", "data": {"bits": 4}};
  var obj8 = {"type": "signal_scale", "data": {"base": -1, "top": 1}};

  instruments.push(obj1);
  instruments.push(obj2);
  instruments.push(obj3);
  instruments.push(obj4);
  instruments.push(obj5);
  instruments.push(obj6);
  instruments.push(obj7);
  instruments.push(obj8);

  instruments.push({"type": "signal_not", "data": {}});

  var obj9 = {"type": "signal_and", "data": {"second_signal": 0.0, "modulation": {"second_signal": obj4}}};
  var obj10 = {"type": "signal_nand", "data": {"second_signal": 0.0, "modulation": {"second_signal": obj4}}};
  var obj11 = {"type": "signal_or", "data": {"second_signal": 0.0, "modulation": {"second_signal": obj4}}};
  var obj12 = {"type": "signal_nor", "data": {"second_signal": 0.0, "modulation": {"second_signal": obj4}}};

  instruments.push(obj9);
  instruments.push(obj10);
  instruments.push(obj11);
  instruments.push(obj12);

  instruments.push({"type": "delay", "data": {"delay": 0.4}});

  instruments.push({
            "type": "gain",
            "data": {
              "modulation": {
                "gain": {
                  "type": "stack",
                  "data": {
                    "array": [
                      {
                        "type": "adsr",
                        "data": {
                          "attackTime": "0.0",
                          "decayTime": 0.4,
                          "sustainLevel": 0.8,
                          "releaseTime": "0.2"
                        }
                      }
                    ]
                  }
                }
              },
              "gain": "0.12"
            }
          });

  instruments.push({
            "type": "gain",
            "data": {
              "gain": "0.12"
            }
          });  

  instruments.push({
      "type": "stack",
      "data": {
        "array": [
          {
            "type": "gain",
            "data": {
              "modulation": {
                "gain": {
                  "type": "stack",
                  "data": {
                    "array": [
                      {
                        "type": "adsr",
                        "data": {
                          "attackTime": "0.0",
                          "decayTime": 0.4,
                          "sustainLevel": 0.8,
                          "releaseTime": "0.2"
                        }
                      }
                    ]
                  }
                }
              },
              "gain": "0.1244"
            }
          },
          {
            "type": "gain",
            "data": {
              "modulation": {
                "gain": {
                  "type": "stack",
                  "data": {
                    "array": [
                      {
                        "type": "signal_scale",
                        "data": {
                          "base": "0.5",
                          "top": "1.5"
                        }
                      },
                      {
                        "type": "gain",
                        "data": {
                          "modulation": {
                            "gain": {
                              "type": "stack",
                              "data": {
                                "array": [
                                  {
                                    "type": "note_condition",
                                    "data": {
                                      "note_on": 0.1,
                                      "note_off": 1,
                                      "enter_time_constant": 0.01,
                                      "leave_time_constant": 0.1
                                    }
                                  }
                                ]
                              }
                            }
                          },
                          "gain": 0.8
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
                          "time_constant": 0.005,
                          "fixed_frequency": true,
                          "frequency": "15"
                        }
                      }
                    ]
                  }
                }
              },
              "gain": 0.8
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
              "time_constant": 0.005,
              "waveform": "t > 0.5 ? t*4 - 1 : -1",
              "serie": {
                "sin": "0",
                "cos": "0"
              },
              "terms": {}
            }
          }
        ]
      }
    });

  instruments.push({
            "type": "note_frequency_generator",
            "data": {
              "time_constant": "0.01"
            }
          });  

  instruments.push({
            "type": "note_time_shift",
            "data": {
              "time": "-0.01"
            }
          });  

  instruments.push({
            "type": "note_time_shift",
            "data": {
              "time": "0.35"
            }
          });  

  DeserializerTest.test(SerializerOracle.PackedJSONBV4.serialize, MUSIC.Formats.PackedJSONSerializerB.deserialize, {
    instruments: instruments
  });
});
