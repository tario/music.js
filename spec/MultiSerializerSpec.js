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
    describe("when using MultiSerializer with two serializers", function() {
      var inputType = {};
      var innerOutputFake1 = {};
      var innerOutputFake2 = {};
      var magic1 = {};
      var magic2 = {};

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
