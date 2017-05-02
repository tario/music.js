describe("DelayedSequenceSpec", function() {
  beforeEach(function() {
    this.fakeStart = sinon.spy();
    this.fakePush = sinon.spy();

    this.fakeInnerFunctionSeq = {
      start: this.fakeStart,
      push: this.fakePush
    };
  });

  [150, 400, 700].forEach(function(delay) {
    describe("when instantiated DelayedFunctionSeq with delay " + delay, function() {
      beforeEach(function() {
        this.delayed = MUSIC.Utils.DelayedFunctionSeq(this.fakeInnerFunctionSeq, delay);
      });

      [1000, 2000, 2100].forEach(function(startTime) {
        describe("when called push", function() {
          beforeEach(function() {
            this.fakeParameter = {
              f: {},
              t: startTime
            };

            this.delayed.push(this.fakeParameter);
          });

          it("should call inner.push(...)", function() {
            expect(this.fakeInnerFunctionSeq.push.calledOnce).to.be(true);
          });

          describe("parameter 1", function() {
            beforeEach(function() {
              this.param1 = this.fakeInnerFunctionSeq.push.args[0][0];
            });

            describe("t", function() {
              it("should be " + (startTime + delay), function() {
                expect(this.param1.t).to.be(startTime + delay)
              });
            });
          });
        });

      });
    });
  });

  describe("when instantiated DelayedFunctionSeq with delay 100", function() {
    beforeEach(function() {
      this.delayed = MUSIC.Utils.DelayedFunctionSeq(this.fakeInnerFunctionSeq, 100);
    });

    describe("when called push", function() {
      beforeEach(function() {
        this.fakeParameter = {
          f: {},
          t: 50
        };

        this.delayed.push(this.fakeParameter);
      });

      it("should call inner.push(...)", function() {
        expect(this.fakeInnerFunctionSeq.push.calledOnce).to.be(true);
      });

      describe("parameter 1", function() {
        beforeEach(function() {
          this.param1 = this.fakeInnerFunctionSeq.push.args[0][0];
        });

        describe("f", function() {
          it("should be the same", function() {
            expect(this.param1.f).to.be(this.fakeParameter.f)
          });
        });

        describe("t", function() {
          it("should be 150", function() {
            expect(this.param1.t).to.be(150)
          });
        });
      });
    });

    describe("when called start with parameter", function() {
      beforeEach(function() {
        this.fakeStartParameter = {};
        this.delayed.start(this.fakeStartParameter);
      });

      it("should call inner.start(...)", function() {
        expect(this.fakeInnerFunctionSeq.start.calledOnce).to.be(true);
      });

      describe("first parameter", function() {
        it("should be the same", function() {
          expect(this.fakeInnerFunctionSeq.start.firstCall.args[0]).to.be(this.fakeStartParameter);
        });
      });
    });
  });
});

