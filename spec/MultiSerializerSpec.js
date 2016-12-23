describe("MultiSerializer", function() {
  describe("match", function() {
    var jsonstringifyFakeOutput1 = {};
    var jsonstringifyFakeOutput2 = {};
    var object1 = {}, object2 = {};

    beforeEach(function() {
      this.object1 = object1;
      this.object2 = object2;
      this.jsonstringifyFakeOutput1 = jsonstringifyFakeOutput1;
      this.jsonstringifyFakeOutput2 = jsonstringifyFakeOutput2;
    });

    var origStr = JSON.stringify;
    beforeEach(function() {
      origStr = JSON.stringify;
    });

    describe("when JSON.stringify outputs are the same", function() {
      describe("when called .match", function() {
        beforeEach(function() {
          JSON.stringify = sinon.spy(function(x) {
            return jsonstringifyFakeOutput1;
          });
          this.output = MUSIC.Formats.MultiSerializer.match(object1, object2);
        });

        it("should return true", function() {
          expect(this.output).to.be(true);
        });
      });
    });

    describe("when JSON.stringify outputs are the different", function() {
      describe("when called .match", function() {
        beforeEach(function() {
          JSON.stringify = sinon.spy(function(x) {
            if (x===object1) return jsonstringifyFakeOutput1;
            if (x===object2) return jsonstringifyFakeOutput2;
          });
          this.output = MUSIC.Formats.MultiSerializer.match(object1, object2);
        });

        it("should return false", function() {
          expect(this.output).to.be(false);
        });
      });
    });

    afterEach(function() {
      JSON.stringify = origStr;
    })
  });

  describe("wrapSerializer", function() {
    describe("when called wrapSerializer", function() {
      beforeEach(function() {
        var fakeSerializerOutput = {};
        var fakeObj = {};
        this.fakeObj = fakeObj;

        this.fakeDeserializerFunction = function(){return fakeObj; };
        this.fakeSerializerOutput = fakeSerializerOutput;

        this.fakeInnerSerializer = {
          serialize: sinon.spy(function() {
            return fakeSerializerOutput;
          }),
          deserialize: this.fakeDeserializerFunction
        };

        this.output = MUSIC.Formats.MultiSerializer.wrapSerializer(this.fakeInnerSerializer);
      });

      describe("deserializer function", function() {
        it("should be the same", function() {
          expect(this.output.deserialize).to.be(this.fakeDeserializerFunction);
        });
      })

      describe("when called serializer.serialize", function() {
        describe("when inner serializer returns normally", function() {
          var orig;
          beforeEach(function() {
            orig = MUSIC.Formats.MultiSerializer.match;
            MUSIC.Formats.MultiSerializer.match = function() { return true; };
          });

          afterEach(function() {
            MUSIC.Formats.MultiSerializer.match = orig;
          });

          beforeEach(function() {
            this.serializedOutput = this.output.serialize(this.fakeObj);
          });

          describe("output", function() {
            it("should be the same from inner serializer", function() {
              expect(this.serializedOutput).to.be(this.fakeSerializerOutput);
            });
          });
        });

        describe("when inner serializer throws", function() {
          beforeEach(function() {
            this.fakeInnerSerializer.serialize = function() {
              throw new Error();
            };
            this.serializedOutput = this.output.serialize(this.fakeObj);
          });

          describe("output", function() {
            it("should be null", function() {
              expect(this.serializedOutput).to.be(null);
            });
          });
        });

        describe("when deserialize result does not match input", function() {
          var orig;
          beforeEach(function() {
            orig = MUSIC.Formats.MultiSerializer.match;
            MUSIC.Formats.MultiSerializer.match = function() { return false; };
          });

          afterEach(function() {
            MUSIC.Formats.MultiSerializer.match = orig;
          });

          beforeEach(function() {
            this.fakeInnerSerializer.deserialize = function() {
              return {};
            };
            this.serializedOutput = this.output.serialize(this.fakeObj);
          });

          describe("output", function() {
            it("should be null", function() {
              expect(this.serializedOutput).to.be(null);
            });
          });
        });

      });

    });
  });

  describe("selector", function() {
    var testSelectorError = function(array) {
      describe("when selector " + JSON.stringify(array), function() {
        it("should throw error", function() {
          expect(function() {
            this.selected = MUSIC.Formats.MultiSerializer.selector(array);
          }.bind(this)).to.throwError(/serialization not found/);
        });
      });
    };
    var testSelector = function(array, expected) {
      describe("when selector " + JSON.stringify(array), function() {
        beforeEach(function() {
          this.selected = MUSIC.Formats.MultiSerializer.selector(array);
        });

        it("should result on " + expected, function() {
          expect(this.selected).to.be(expected);
        });
      });
    }; 

    var l1 = {length:1};
    var l2 = {length:2};
    var l10 = {length:10};
    var l21 = {length:21};

    testSelector([l1], l1);
    testSelector([l10], l10);
    testSelector([l1, l2], l1);
    testSelector([l2, l1], l1);
    testSelector([null, l1], l1);
    testSelector([undefined, l1], l1);
    testSelector([l21, l1], l1);
    testSelector([l21, l10], l10);
    testSelector([l2, l10], l2);

    testSelectorError([]);
    testSelectorError([undefined]);
    testSelectorError([undefined, undefined]);
  });

  describe("serialize", function() {
    describe("when using MultiSerializer with two serializers", function() {
      var inputObj = {};
      var outputFake = {};
      var innerOutputFake = {};
      var inputType = {};
      var innerOutputFake1 = {};
      var innerOutputFake2 = {};

      var possibleOutput1 = {};
      var possibleOutput2 = {};

      var magic1, magic2;
      var orig;

      beforeEach(function() {
        magic1 = {concat: sinon.spy(function() {
          return possibleOutput1;
        })};
        magic2 = {concat: sinon.spy(function() {
          return possibleOutput2;
        })};
        this.fakeSerializer1 = {
          serialize: sinon.spy(function(type, obj) {
            return innerOutputFake1;
          })
        };

        this.fakeSerializer2 = {
          serialize: sinon.spy(function(type, obj) {
            return innerOutputFake2;
          })
        };

        var fakeSerializer1 = this.fakeSerializer1;
        var fakeSerializer2 = this.fakeSerializer2;

        orig = MUSIC.Formats.MultiSerializer.wrapSerializer;
        MUSIC.Formats.MultiSerializer.wrapSerializer = function(obj) {
          if (obj.ser === 1) return fakeSerializer1;
          if (obj.ser === 2) return fakeSerializer2;
        };

        MUSIC.Formats.MultiSerializer.setSerializers([
          {serializer: {ser: 1}, base: magic1},
          {serializer: {ser: 2}, base: magic2}
        ]);
      });

      afterEach(function() {
        MUSIC.Formats.MultiSerializer.wrapSerializer = orig;
      });

      describe("when called MultiSerializer.serialize", function() {
        var orig;
        var selected = {};

        beforeEach(function() {
          orig = MUSIC.Formats.MultiSerializer.selector;
          MUSIC.Formats.MultiSerializer.selector = sinon.spy(function() {
            return selected;
          });

          this.output = MUSIC.Formats.MultiSerializer.serialize(inputType, inputObj);
        });
        
        it ("should call Serializer1.serialize", function() {
          expect(this.fakeSerializer1.serialize.called).to.be(true);
        });

        it ("should call Serializer2.serialize", function() {
          expect(this.fakeSerializer2.serialize.called).to.be(true);
        });

        it ("should call MultiSerializer.selector", function() {
          expect(MUSIC.Formats.MultiSerializer.selector.called).to.be(true);
        });

        it ("should call MultiSerializer.selector with array length 2", function() {
          expect(MUSIC.Formats.MultiSerializer.selector.args[0][0].length).to.be(2);
        });

        it ("should call MultiSerializer.selector with array[0] = innerOutputFake1", function() {
          expect(MUSIC.Formats.MultiSerializer.selector.args[0][0][0]).to.be(possibleOutput1);
        });

        it ("should call MultiSerializer.selector with array[0] = innerOutputFake2", function() {
          expect(MUSIC.Formats.MultiSerializer.selector.args[0][0][1]).to.be(possibleOutput2);
        });

        describe("magic1.concat", function() {
          it ("should be called once", function() {
            expect(magic1.concat.calledOnce).to.be(true);
          });

          describe("first parameter", function() {
            it ("should be the inner serialization", function() {
              expect(magic1.concat.args[0][0]).to.be(innerOutputFake1);
            });
          });
        });

        describe("magic2.concat", function() {
          it ("should be called once", function() {
            expect(magic2.concat.calledOnce).to.be(true);
          });

          describe("return value", function() {
            it ("should be the return value of .selector", function() {
              expect(this.output).to.be(selected);
            });
          });

          describe("first parameter", function() {
            it ("should be the inner serialization", function() {
              expect(magic2.concat.args[0][0]).to.be(innerOutputFake2);
            });
          });
        });
        afterEach(function() {
          MUSIC.Formats.MultiSerializer.selector = orig;
        });

      });
    });

    describe("when using MultiSerializer with only one serializer", function() {
      var inputObj = {};
      var inputType = {};
      var fakeBase;

      var outputFake = {};
      var innerOutputFake = {};
      var selected = {};
      var orig;

      beforeEach(function() {
        this.fakeBase = {
          concat: sinon.spy(function(string) {
            return outputFake;
          })
        };

        this.fakeSerializer = {
          serialize: sinon.spy(function(type, obj) {
            return innerOutputFake;
          })
        };

        var fakeSerializer = this.fakeSerializer;
        orig = MUSIC.Formats.MultiSerializer.wrapSerializer;
        MUSIC.Formats.MultiSerializer.wrapSerializer = function() {
          return fakeSerializer;                    
        };

        MUSIC.Formats.MultiSerializer.setSerializers([
          {serializer: {}, base: this.fakeBase}
        ]);
      });

      afterEach(function() {
        MUSIC.Formats.MultiSerializer.wrapSerializer = orig;
      });

      describe("when called MultiSerializer.serialize", function() {
        var orig;

        beforeEach(function() {
          orig = MUSIC.Formats.MultiSerializer.selector;
          MUSIC.Formats.MultiSerializer.selector = sinon.spy(function() {
            return selected;
          });

          this.output = MUSIC.Formats.MultiSerializer.serialize(inputType, inputObj);
        });

        afterEach(function() {
          MUSIC.Formats.MultiSerializer.selector = orig;
        });

        it ("should call Serializer.serialize", function() {
          expect(this.fakeSerializer.serialize.called).to.be(true);
        });

        describe("first parameter of JSONSerializer.serialize", function() {
          it ("should be the same type", function() {
            expect(this.fakeSerializer.serialize.args[0][0]).to.be(inputType);
          });
        });

        describe("second parameter of JSONSerializer.serialize", function() {
          it ("should be the same object", function() {
            expect(this.fakeSerializer.serialize.args[0][1]).to.be(inputObj);
          });
        });

        it ("should call MultiSerializer.selector with array length 1", function() {
          expect(MUSIC.Formats.MultiSerializer.selector.args[0][0].length).to.be(1);
        });

        it ("should call MultiSerializer.selector with array[0] = outputFake", function() {
          expect(MUSIC.Formats.MultiSerializer.selector.args[0][0][0]).to.be(outputFake);
        });        

        describe("return value", function() {
          it ("should be the return value of selector", function() {
            expect(this.output).to.be(selected);
          });
        });

        describe("base.concat", function() {
          it ("should be called once", function() {
            expect(this.fakeBase.concat.calledOnce).to.be(true);
          });

          describe("first parameter", function() {
            it ("should be the inner serialization", function() {
              expect(this.fakeBase.concat.args[0][0]).to.be(innerOutputFake);
            });
          });
        });

      });
    });
  });

  describe("deserialize", function() {
    describe("when using MultiSerializer with two serializers", function() {
      var inputType = {};
      var innerOutputFake1 = {};
      var innerOutputFake2 = {};
      var magic1 = {};
      var magic2 = {};
      var magic3 = {};

      beforeEach(function() {
        this.fakeSerializer1 = {
          deserialize: sinon.spy(function(type, obj) {
            return innerOutputFake1;
          })
        };

        this.fakeSerializer2 = {
          deserialize: sinon.spy(function(type, obj) {
            return innerOutputFake2;
          })
        };
        MUSIC.Formats.MultiSerializer.setSerializers([
          {serializer: this.fakeSerializer1, base: magic1},
          {serializer: this.fakeSerializer2, base: magic2}
        ]);
      });

      describe("when string has format 1", function() {
        var fakeSliced = {};
        beforeEach(function() {
          this.fakeString = {
            slice: sinon.spy(function(start) {
              return fakeSliced;
            }),
            0:magic1
          };
        });

        describe("when called MultiSerializer.deserialize", function() {
          beforeEach(function() {
            this.output = MUSIC.Formats.MultiSerializer.deserialize(inputType, this.fakeString);
          });

          it ("should call Serializer1.deserialize", function() {
            expect(this.fakeSerializer1.deserialize.called).to.be(true);
          });

          it ("should NOT call Serializer2.deserialize", function() {
            expect(this.fakeSerializer2.deserialize.called).to.be(false);
          });

          describe("first parameter of .deserialize", function() {
            it ("should be the same type", function() {
              expect(this.fakeSerializer1.deserialize.args[0][0]).to.be(inputType);
            });
          });

          describe("second parameter of .deserialize", function() {
            it ("should be the sliced string", function() {
              expect(this.fakeSerializer1.deserialize.args[0][1]).to.be(fakeSliced);
            });
          });

          describe("return value", function() {
            it ("should be the result of inner deserializer", function() {
              expect(this.output).to.be(innerOutputFake1);
            });
          });

          describe("string.slice", function() {
            it ("should be called once", function() {
              expect(this.fakeString.slice.calledOnce).to.be(true);
            });

            describe("first parameter", function() {
              it ("should be 1", function() {
                expect(this.fakeString.slice.args[0][0]).to.be(1);
              });
            });
          });

        });
      });

      describe("when string has format 2", function() {
        var fakeSliced = {};
        beforeEach(function() {
          this.fakeString = {
            slice: sinon.spy(function(start) {
              return fakeSliced;
            }),
            0:magic2
          };
        });

        describe("when called MultiSerializer.deserialize", function() {
          beforeEach(function() {
            this.output = MUSIC.Formats.MultiSerializer.deserialize(inputType, this.fakeString);
          });

          it ("should call Serializer2.deserialize", function() {
            expect(this.fakeSerializer2.deserialize.called).to.be(true);
          });

          it ("should NOT call Serializer1.deserialize", function() {
            expect(this.fakeSerializer1.deserialize.called).to.be(false);
          });

          describe("first parameter of .deserialize", function() {
            it ("should be the same type", function() {
              expect(this.fakeSerializer2.deserialize.args[0][0]).to.be(inputType);
            });
          });

          describe("second parameter of .deserialize", function() {
            it ("should be the sliced string", function() {
              expect(this.fakeSerializer2.deserialize.args[0][1]).to.be(fakeSliced);
            });
          });

          describe("return value", function() {
            it ("should be the result of inner deserializer", function() {
              expect(this.output).to.be(innerOutputFake2);
            });
          });

          describe("string.slice", function() {
            it ("should be called once", function() {
              expect(this.fakeString.slice.calledOnce).to.be(true);
            });

            describe("first parameter", function() {
              it ("should be 1", function() {
                expect(this.fakeString.slice.args[0][0]).to.be(1);
              });
            });
          });

        });
      });

      describe("when string has unsupported format 3", function() {
        var fakeSliced = {};
        beforeEach(function() {
          this.fakeString = {
            slice: sinon.spy(function(start) {
              return fakeSliced;
            }),
            0:magic3
          };
        });

        describe("when called MultiSerializer.deserialize", function() {
          it ("should throw error", function() {
            expect(function() {
              MUSIC.Formats.MultiSerializer.deserialize(inputType, this.fakeString);
            }.bind(this)).to.throwError();
          });
        });
      });

    });

    describe("when using MultiSerializer with only one serializer", function() {
      var fakeSliced = {};
      var inputType = {};
      var innerOutputFake = {};

      beforeEach(function() {

        this.fakeString = {
          slice: sinon.spy(function() {
            return fakeSliced;
          }),
          0:'0'
        };

        this.fakeSerializer = {
          deserialize: sinon.spy(function(type, obj) {
            return innerOutputFake;
          })
        };
        MUSIC.Formats.MultiSerializer.setSerializers([
          {serializer: this.fakeSerializer, base: '0'}
        ]);
      });

      describe("when called MultiSerializer.deserialize", function() {
        beforeEach(function() {
          this.output = MUSIC.Formats.MultiSerializer.deserialize(inputType, this.fakeString);
        });

        it ("should call Serializer.deserialize", function() {
          expect(this.fakeSerializer.deserialize.called).to.be(true);
        });

        describe("first parameter of .deserialize", function() {
          it ("should be the same type", function() {
            expect(this.fakeSerializer.deserialize.args[0][0]).to.be(inputType);
          });
        });

        describe("second parameter of .deserialize", function() {
          it ("should be the sliced string", function() {
            expect(this.fakeSerializer.deserialize.args[0][1]).to.be(fakeSliced);
          });
        });

        describe("return value", function() {
          it ("should be the result of inner deserializer", function() {
            expect(this.output).to.be(innerOutputFake);
          });
        });

        describe("string.slice", function() {
          it ("should be called once", function() {
            expect(this.fakeString.slice.calledOnce).to.be(true);
          });

          describe("first parameter", function() {
            it ("should be 1", function() {
              expect(this.fakeString.slice.args[0][0]).to.be(1);
            });
          });
        });

      });
    });
  });
});
