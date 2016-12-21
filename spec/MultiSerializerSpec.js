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

  });
});
