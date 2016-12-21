describe("MultiSerializer", function() {
  describe("serialize", function() {
    describe("when using MultiSerializer with only one serializer", function() {
      var inputObj = {};
      var inputType = {};
      var fakeBase;

      var outputFake = {};
      var innerOutputFake = {};

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
        MUSIC.Formats.MultiSerializer.setSerializers([
          {serializer: this.fakeSerializer, base: this.fakeBase}
        ]);
      });

      describe("when called MultiSerializer.serialize", function() {
        beforeEach(function() {
          this.output = MUSIC.Formats.MultiSerializer.serialize(inputType, inputObj);
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

        describe("return value", function() {
          it ("should be the result of concat", function() {
            expect(this.output).to.be(outputFake);
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
    describe("when using MultiSerializer with only one serializer", function() {
      var fakeSliced = {};
      var inputType = {};
      var innerOutputFake = {};

      beforeEach(function() {
        this.fakeBase = {
          concat: sinon.spy(function(string) {
            return outputFake;
          })
        };

        this.fakeString = {
          slice: sinon.spy(function() {
            return fakeSliced;
          })
        };

        this.fakeSerializer = {
          deserialize: sinon.spy(function(type, obj) {
            return innerOutputFake;
          })
        };
        MUSIC.Formats.MultiSerializer.setSerializers([
          {serializer: this.fakeSerializer, base: this.fakeBase}
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
