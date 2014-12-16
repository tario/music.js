describe("Music.Utils", function() {

  describe("Scale", function() {
    var scaleTest = function(scaleName, scaleNum) {
      return function(semitone1, noteNum, semitoneResult) {
        it(scaleName + " scale should get semitone " + semitoneResult + " from adding " + noteNum + " notes to semitone " + semitone1 , function() {
          var scale = MUSIC.Utils.Scale(scaleNum);
          expect(scale.add(semitone1, noteNum)).toBe(semitoneResult);
        });
      };
    };

    var cmajor = scaleTest("C major", 0); // [0|2|4][5|7|9|11] think of piano keys for all scales
    var dmajor = scaleTest("D major", 2); // [2|4|6][7|9|11|1] think of piano keys for all scales
    var emajor = scaleTest("E major", 4); // [4|6|8][9|11|1|3] think of piano keys for all scales
    var multiScaleTest = function(semitone1, noteNum, semitoneResult) {
      cmajor(semitone1, noteNum, semitoneResult);
      dmajor(semitone1+2, noteNum, semitoneResult+2);
      emajor(semitone1+4, noteNum, semitoneResult+4);
    };

    for (var x = 0; x<4; x++) {
      describe("Octave " + x, function() {
        [0,2,4,5,7,9,11].forEach(function(semitone, index) {
          multiScaleTest(x*12, index, semitone + x*12);
          multiScaleTest(x*12, index+7, semitone + (x+1)*12);
          multiScaleTest(x*12, index+14, semitone + (x+2)*12);
        });

        [2,4,5,7,9,11,12].forEach(function(semitone, index) {
          multiScaleTest(x*12+2, index, semitone + x*12);
        });
      });
    }
  });

  // Clock calls repeatly a function reporting the precise time
  describe("Clock", function() {
    // Clock need two things to work: a setInterval and a precise timer function
    var FakeTimer = function() {
      this.timeFcn = function() {
        return this.fakeTime;
      }
    };

    [0,4,10,1000].forEach(function(x){

      it("should report precise timing (" + x + ") at desired interval", function(){
        var fakeTimer = new FakeTimer();
        fakeTimer.fakeTime = 0;
        var fakeSetInterval = function(fcn, interval) {
          fakeTimer.fakeTime = x;
          fcn();
        };

        var fakeClearInterval = function(hndl) {};

        var clock = MUSIC.Utils.Clock(fakeTimer.timeFcn.bind(fakeTimer), fakeSetInterval, fakeClearInterval, 1000);
        var timeReportFcn = jasmine.createSpy("mockTimeReportFcn"); 
        clock.start(timeReportFcn);
        expect(timeReportFcn).toHaveBeenCalled();
        expect(timeReportFcn).toHaveBeenCalledWith(x);
      });

    });

    it("should clearInterval if stopped", function(){
      var fakeTimer = function() {
        return 0;
      };

      var fakeClearInterval = jasmine.createSpy("mockClearInterval");
      var fakeSetInterval = function(){};
      var clock = MUSIC.Utils.Clock(fakeTimer, fakeSetInterval, fakeClearInterval, 1000);
      var clockInstance = clock.start(function(){});
      clockInstance.stop();
      expect(fakeClearInterval).toHaveBeenCalled();
    });    

    [0,4,32,100,51].forEach(function(handl) {
      it("should clearInterval if stopped with same handle returned by setInterval (" + handl + ")", function(){
        var fakeTimer = function() {
          return 0;
        };

        var fakeClearInterval = jasmine.createSpy("mockClearInterval");
        var fakeSetInterval = function(){ return handl };
        var clock = MUSIC.Utils.Clock(fakeTimer, fakeSetInterval, fakeClearInterval, 1000);
        var clockInstance = clock.start(function(){});
        clockInstance.stop();
        expect(fakeClearInterval).toHaveBeenCalledWith(handl);
      });
    });

    [1,12345,1000].forEach(function(base){
      [0,4,10,1000].forEach(function(x){
        it("should report precise timing (" + x + ") at desired interval, relative to " + base, function(){
          var fakeTimer = new FakeTimer();
          var firstCall = true;
          fakeTimer.fakeTime = base;
          var fakeSetInterval = function(fcn, interval) {
            fakeTimer.fakeTime = base+x;
            fcn();
          };

          var fakeClearInterval = function(hndl) {};

          var clock = MUSIC.Utils.Clock(fakeTimer.timeFcn.bind(fakeTimer), fakeSetInterval, fakeClearInterval, 1000);
          var timeReportFcn = jasmine.createSpy("mockTimeReportFcn"); 
          clock.start(timeReportFcn);
          expect(timeReportFcn).toHaveBeenCalled();
          expect(timeReportFcn).toHaveBeenCalledWith(x);
        });
      });
    });
  });

  // calls functions of an array at precise times using a clock
  describe("FunctionSeq", function() {
    var FakeClock = function() {
      var self = this;
      this.start = function(fcn) {
        this.fcn = fcn;
        return {
          stop: function(){self.stopCalled = true;}
        };
      }
    };    

    describe("when there is a single event at beginning", function() {
      describe("when function seq is called twice", function() {
        it("should behaves the same way", function() {
          var fakeClock = new FakeClock();
          var fakeSetTimeout = jasmine.createSpy("mockSetTimeout");

          var fSeq = MUSIC.Utils.FunctionSeq(fakeClock, fakeSetTimeout);
          fSeq.push({t:0, f: function(){}});
          fSeq.start();

          // simulate clock signal
          fakeClock.fcn(0);

          fSeq.start(); // this will replace the callback on fakeclock

          // simulate clock signal
          fakeClock.fcn(0);

          expect(fakeSetTimeout.calls.count()).toEqual(2);
        });
      });

      describe("when call stop after clock signal", function() {
        var fakeClock;
        var fakeSetTimeout, fakeClearTimeout;
        var fSeq;
        var handle;
        var innerFakeTimeout;

        var setupFunSeq = function() {
          fakeClock = new FakeClock();
          fakeClearTimeout = jasmine.createSpy("mockClearTimeout");

          fSeq = MUSIC.Utils.FunctionSeq(fakeClock, fakeSetTimeout, fakeClearTimeout);
          fSeq.push({t:100, f: function(){}});

          handle = fSeq.start();
          
          fakeClock.fcn(0);
        };

        var handleStop = function(){
          handle.stop();
        };

        describe("when event doesn't ocurrs (not called by setTimeout)", function() {
          beforeEach(function(){
            fakeSetTimeout = function(f,t){
              return 44;
            };
          });
          beforeEach(setupFunSeq);
          beforeEach(handleStop);

          it("should call stop on clock", function() {
            expect(fakeClock.stopCalled).toEqual(true);
          });

          it("should call clearTimeout", function() {
            expect(fakeClearTimeout).toHaveBeenCalled();
          });

          it("should call clearTimeout with the same handler", function() {
            expect(fakeClearTimeout).toHaveBeenCalledWith(44);
          });

          it("should call clearTimeout ONLY ONE time (one for each event)", function() {
            expect(fakeClearTimeout.calls.count()).toEqual(1);
          });
        });


        describe("when event DOES ocurrs (called by setTimeout)", function() {
          var setTimeoutFcn;

          beforeEach(function(){
            fakeSetTimeout = function(f,t){
              setTimeoutFcn = f;
              return 44;
            };
          });
          beforeEach(setupFunSeq);
          beforeEach(function(){
            setTimeoutFcn();
          });
          beforeEach(handleStop);

          it("should call stop on clock", function() {
            expect(fakeClock.stopCalled).toEqual(true);
          });

          it("should NOT call clearTimeout", function() {
            expect(fakeClearTimeout).not.toHaveBeenCalled();
          });
      
        });
      });

      it("should be called when got clock signal", function() {
        var fakeClock = new FakeClock();
        var fakeSetTimeout = function(fcn, timeout){
          fcn();
        };

        var fSeq = MUSIC.Utils.FunctionSeq(fakeClock, fakeSetTimeout);
        var firstEvent = jasmine.createSpy("mockFirstEventFcn");
        fSeq.push({t:0, f: firstEvent});

        fSeq.start();

        // simulate clock signal
        fakeClock.fcn(0);

        expect(firstEvent).toHaveBeenCalled();
      });

      it("should call setTimeout", function() {
        var fakeClock = new FakeClock();
        var fakeSetTimeout = jasmine.createSpy("mockSetTimeout");

        var fSeq = MUSIC.Utils.FunctionSeq(fakeClock, fakeSetTimeout);
        fSeq.push({t:0, f: function(){}});
        fSeq.start();

        // simulate clock signal
        fakeClock.fcn(0);

        expect(fakeSetTimeout).toHaveBeenCalled();
      });

      it("should call setTimeout with 0", function() {
        var fakeClock = new FakeClock();
        var fakeSetTimeout = jasmine.createSpy("mockSetTimeout");

        var fSeq = MUSIC.Utils.FunctionSeq(fakeClock, fakeSetTimeout);
        fSeq.push({t:0, f: function(){}});

        fSeq.start();

        // simulate clock signal
        fakeClock.fcn(0);

        expect(fakeSetTimeout).toHaveBeenCalledWith(jasmine.any(Function), 0);
      });

      describe("when event occurs at 100", function() {
        describe("when clock sends clock signal with 0", function() {
          it("should call setTimeout with 100", function() {
            var fakeClock = new FakeClock();
            var fakeSetTimeout = jasmine.createSpy("mockSetTimeout");

            var fSeq = MUSIC.Utils.FunctionSeq(fakeClock, fakeSetTimeout);
            fSeq.push({t:100, f: function(){}});

            fSeq.start();

            // simulate clock signal
            fakeClock.fcn(0);

            expect(fakeSetTimeout).toHaveBeenCalledWith(jasmine.any(Function), 100);
          });
        });

        describe("when clock sends clock signal with 25", function() {
          it("should call setTimeout with 75", function() {
            var fakeClock = new FakeClock();
            var fakeSetTimeout = jasmine.createSpy("mockSetTimeout");

            var fSeq = MUSIC.Utils.FunctionSeq(fakeClock, fakeSetTimeout);
            fSeq.push({t:100, f: function(){}});

            fSeq.start();

            // simulate clock signal
            fakeClock.fcn(25);

            expect(fakeSetTimeout).toHaveBeenCalledWith(jasmine.any(Function), 75);
          });
        });

        describe("when clock sends TWO clock signal with 0", function() {
          it("should NOT call setTimeout two times", function() {
            var fakeClock = new FakeClock();
            var fakeSetTimeout = jasmine.createSpy("mockSetTimeout");

            var fSeq = MUSIC.Utils.FunctionSeq(fakeClock, fakeSetTimeout);
            fSeq.push({t:100, f: function(){}});

            fSeq.start();

            // simulate TWO clock signal
            fakeClock.fcn(0);
            fakeClock.fcn(0);
            
            expect(fakeSetTimeout.calls.count()).toEqual(1);
          });
        });
        
        describe("when maxDelta is limited to 1000", function() {
          [0, 100, 1000, 2000].forEach(function(signalTime) {
            describe("when clock signal " + signalTime, function() {
              [50, 150, 1500, 2500, 10000].forEach(function(t) {
                describe("when event time is " + t, function() {
                  if (t >= signalTime && t < signalTime + 1000) {
                    it("should call setTimeout", function() {
                      var fakeClock = new FakeClock();
                      var fakeSetTimeout = jasmine.createSpy("mockSetTimeout");

                      var fSeq = MUSIC.Utils.FunctionSeq(fakeClock, fakeSetTimeout);
                      fSeq.push({t:t, f: function(){}});

                      fSeq.start({maxDelta: 1000});

                      // simulate clock signal
                      fakeClock.fcn(signalTime);

                      expect(fakeSetTimeout).toHaveBeenCalledWith(jasmine.any(Function), t-signalTime);
                    });

                  } else {
                    it("should NOT call setTimeout", function() {
                      var fakeClock = new FakeClock();
                      var fakeSetTimeout = jasmine.createSpy("mockSetTimeout");

                      var fSeq = MUSIC.Utils.FunctionSeq(fakeClock, fakeSetTimeout);
                      fSeq.push({t:t, f: function(){}});

                      fSeq.start({maxDelta: 1000});

                      // simulate clock signal
                      fakeClock.fcn(signalTime);

                      expect(fakeSetTimeout).not.toHaveBeenCalled();
                    });
                  }

                  var anotherSignalTime = signalTime + 1000;
                  describe("when clock signal " + anotherSignalTime + " after that", function() {
                    var fakeClock;
                    var fakeSetTimeout;
                    var fSeq;

                    beforeEach(function() {
                      fakeClock = new FakeClock();
                      fakeSetTimeout = jasmine.createSpy("mockSetTimeout");

                      fSeq = MUSIC.Utils.FunctionSeq(fakeClock, fakeSetTimeout);
                      fSeq.push({t:t, f: function(){}});

                      fSeq.start({maxDelta: 1000});
                      // simulate clock signal
                      fakeClock.fcn(signalTime);
                      fakeClock.fcn(anotherSignalTime);
                    });

                    if (t >= signalTime && t < signalTime + 1000) {
                      it("should call setTimeout only ONE time", function() {
                        expect(fakeSetTimeout).toHaveBeenCalledWith(jasmine.any(Function), t-signalTime);
                        expect(fakeSetTimeout.calls.count()).toEqual(1);
                      });
                    } else {
                      if (t >= anotherSignalTime && t < anotherSignalTime + 1000) {
                        it("should call setTimeout ony ONE time", function() {
                          expect(fakeSetTimeout).toHaveBeenCalledWith(jasmine.any(Function), t-anotherSignalTime);
                          expect(fakeSetTimeout.calls.count()).toEqual(1);
                        });

                      } else {
                        it("should NOT call setTimeout", function() {
                          expect(fakeSetTimeout).not.toHaveBeenCalled();
                        });
                      }                      
                    }

                  });


                });
              });

            });

          });
        });
      });
    });


    describe("when there is two events", function() {
      describe("when event occurs at 100 and second event occurs at 200", function() {
        describe("when call stop after clock signal", function() {
          var fakeClock;
          var fakeSetTimeout, fakeClearTimeout;
          var fSeq;
          var handle;

          beforeEach(function(){
            var currentHandler = 44;

            fakeClock = new FakeClock();
            fakeSetTimeout = function(f,t){
              currentHandler++;
              return currentHandler;
            };
            fakeClearTimeout = jasmine.createSpy("mockClearTimeout");

            fSeq = MUSIC.Utils.FunctionSeq(fakeClock, fakeSetTimeout, fakeClearTimeout);
            fSeq.push({t:100, f: function(){}});
            fSeq.push({t:200, f: function(){}});

            handle = fSeq.start();
            
            fakeClock.fcn(0);
            handle.stop();
          });

          it("should call stop on clock", function() {
            expect(fakeClock.stopCalled).toEqual(true);
          });

          it("should call clearTimeout", function() {
            expect(fakeClearTimeout).toHaveBeenCalled();
          });

          it("should call clearTimeout two times (one for each event)", function() {
            expect(fakeClearTimeout.calls.count()).toEqual(2);
          });

          it("should call clearTimeout first time with 44", function() {
            expect(fakeClearTimeout.calls.argsFor(0)[0]).toEqual(45);
          });

          it("should call clearTimeout second time with 45", function() {
            expect(fakeClearTimeout.calls.argsFor(1)[0]).toEqual(46);
          });
        });

        describe("when clock sends clock signal with 0", function() {
          it("should call setTimeout with 100", function() {
            var fakeClock = new FakeClock();
            var fakeSetTimeout = jasmine.createSpy("mockSetTimeout");

            var fSeq = MUSIC.Utils.FunctionSeq(fakeClock, fakeSetTimeout);
            fSeq.push({t:100, f: function(){}});
            fSeq.push({t:200, f: function(){}});

            fSeq.start();

            // simulate clock signal
            fakeClock.fcn(0);

            expect(fakeSetTimeout).toHaveBeenCalledWith(jasmine.any(Function), 100);
          });

          it("should call setTimeout once and then setTimeout with 200", function() {
            var fakeClock = new FakeClock();
            var fakeSetTimeout = jasmine.createSpy("mockSetTimeout");

            var fSeq = MUSIC.Utils.FunctionSeq(fakeClock, fakeSetTimeout);
            fSeq.push({t:100, f: function(){}});
            fSeq.push({t:200, f: function(){}});

            fSeq.start();

            // simulate clock signal
            fakeClock.fcn(0);

            expect(fakeSetTimeout).toHaveBeenCalled();
            expect(fakeSetTimeout).toHaveBeenCalledWith(jasmine.any(Function), 200);
          });
        });
      });
    });
  });
});
