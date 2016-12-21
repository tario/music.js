describe("JSONSerializer", function() {
  describe("when called JSONSerializer.serialize", function() {
    var origStr = JSON.stringify;
    var inputFake = {};
    var inputType = {};
    var jsonstringifyFakeOutput = {};

    beforeEach(function() {
      origStr = JSON.stringify;
      JSON.stringify = sinon.spy(function(x) {
        return jsonstringifyFakeOutput;
      });
    });

    beforeEach(function() {
      this.output = JSONSerializer.serialize(inputType, inputFake);
    });

    it ("should call JSON.stringify", function() {
      expect(JSON.stringify.called).to.be(true);
    });

    it ("should call JSON.stringify with same input", function() {
      expect(JSON.stringify.args[0][0]).to.be(inputFake);
    });

    it ("should return output JSON.stringify", function() {
      expect(this.output).to.be(jsonstringifyFakeOutput);
    });

    afterEach(function() {
      JSON.stringify = origStr;
    })
  });
});
