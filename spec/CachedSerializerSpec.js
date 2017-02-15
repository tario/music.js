describe("CachedSerializer", function() {
  beforeEach(function() {
    var fakeInnerSerializerOutput = {};

    this.fakeInnerSerializerOutput = fakeInnerSerializerOutput;
    this.innerSerializer = {
      serialize: sinon.spy(function() {
        return fakeInnerSerializerOutput;
      }),

      deserialize: sinon.spy(function() {
        return fakeInnerSerializerOutput;
      })
    };

    this.serializer = MUSIC.Formats.CachedSerializer(this.innerSerializer);
  });

  describe("when called .deserialize", function() {
    beforeEach(function() {
      this.fakeInput = {};
      this.fakeType = {};
      this.currentOutput = this.serializer.deserialize(this.fakeType, this.fakeInput);
    });

    it("should return same inner output", function() {
      expect(this.currentOutput).to.be(this.fakeInnerSerializerOutput);
    });

    describe("first argument to inner.serialize", function() {
      it("should be same type", function() {
        expect(this.innerSerializer.deserialize.firstCall.args[0]).to.be(this.fakeType);
      });
    });

    describe("second argument to inner.serialize", function() {
      it("should be same input", function() {
        expect(this.innerSerializer.deserialize.firstCall.args[1]).to.be(this.fakeInput);
      });
    });
  });

  describe("when called .serialize", function() {
    beforeEach(function() {
      this.fakeInput = {};
      this.fakeType = {};
      this.currentOutput = this.serializer.serialize(this.fakeType, this.fakeInput);
    });

    it("should return same inner output", function() {
      expect(this.currentOutput).to.be(this.fakeInnerSerializerOutput);
    });

    describe("first argument to inner.serialize", function() {
      it("should be same type", function() {
        expect(this.innerSerializer.serialize.firstCall.args[0]).to.be(this.fakeType);
      });
    });

    describe("second argument to inner.serialize", function() {
      it("should be same input", function() {
        expect(this.innerSerializer.serialize.firstCall.args[1]).to.be(this.fakeInput);
      });
    });

    describe("when called .serialize again with same input and different type", function() {
      beforeEach(function() {
        this.fakeAnotherType = {};
        this.currentOutput = this.serializer.serialize(this.fakeAnotherType, this.fakeInput);
      });

      it("should call inner serializer twice", function() {
        expect(this.innerSerializer.serialize.calledTwice).to.be(true);
      });

      it("should return same inner output", function() {
        expect(this.currentOutput).to.be(this.fakeInnerSerializerOutput);
      });

      describe("first argument to inner.serialize", function() {
        it("should be same type", function() {
          expect(this.innerSerializer.serialize.args[1][0]).to.be(this.fakeAnotherType);
        });
      });

      describe("second argument to inner.serialize", function() {
        it("should be same input", function() {
          expect(this.innerSerializer.serialize.args[1][1]).to.be(this.fakeInput);
        });
      });      
    });

    describe("when called .serialize again with same input", function() {
      beforeEach(function() {
        this.currentOutput = this.serializer.serialize(this.fakeType, this.fakeInput);
      });

      it("should NOT call inner serializer again", function() {
        expect(this.innerSerializer.serialize.calledOnce).to.be(true);
      });

      it("should return same inner output", function() {
        expect(this.currentOutput).to.be(this.fakeInnerSerializerOutput);
      });
    });

    describe("when called .serialize again with different input", function() {
      beforeEach(function() {
        this.fakeAnotherInput = {a:3};
        this.currentOutput = this.serializer.serialize(this.fakeType, this.fakeAnotherInput);
      });

      it("should call inner serializer twice", function() {
        expect(this.innerSerializer.serialize.calledTwice).to.be(true);
      });

      it("should return same inner output", function() {
        expect(this.currentOutput).to.be(this.fakeInnerSerializerOutput);
      });

      describe("first argument to inner.serialize", function() {
        it("should be same type", function() {
          expect(this.innerSerializer.serialize.args[1][0]).to.be(this.fakeType);
        });
      });

      describe("second argument to inner.serialize", function() {
        it("should be same input", function() {
          expect(this.innerSerializer.serialize.args[1][1]).to.be(this.fakeAnotherInput);
        });
      });
    });

    describe("when called .serialize again with different input (same object)", function() {
      beforeEach(function() {
        this.fakeInput.i = 2;
        this.currentOutput = this.serializer.serialize(this.fakeType, this.fakeInput);
      });

      it("should call inner serializer twice", function() {
        expect(this.innerSerializer.serialize.calledTwice).to.be(true);
      });

      it("should return same inner output", function() {
        expect(this.currentOutput).to.be(this.fakeInnerSerializerOutput);
      });

      describe("first argument to inner.serialize", function() {
        it("should be same type", function() {
          expect(this.innerSerializer.serialize.args[1][0]).to.be(this.fakeType);
        });
      });

      describe("second argument to inner.serialize", function() {
        it("should be same input", function() {
          expect(this.innerSerializer.serialize.args[1][1]).to.be(this.fakeInput);
        });
      });
    });

  });

});
