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
    describe("a single event at beginning", function() {
      var FakeClock = function() {
        this.start = function(fcn) {
          fcn(0);
          return {
            stop: function(){}
          };
        }
      };

      it("should be called when got clock signal", function() {
        var fakeClock = new FakeClock();
        var fakeSetTimeout = function(fcn, timeout){
          fcn();
        };

        var fSeq = MUSIC.Utils.FunctionSeq(fakeClock, fakeSetTimeout);
        var firstEvent = jasmine.createSpy("mockFirstEventFcn");
        fSeq.push({t:0, f: firstEvent});

        fSeq.start();

        expect(firstEvent).toHaveBeenCalled();
      });

      it("should call setTimeout", function() {
        var fakeClock = new FakeClock();
        var fakeSetTimeout = jasmine.createSpy("mockSetTimeout");

        var fSeq = MUSIC.Utils.FunctionSeq(fakeClock, fakeSetTimeout);
        var firstEvent = jasmine.createSpy("mockFirstEventFcn");
        fSeq.push({t:0, f: function(){}});

        fSeq.start();

        expect(fakeSetTimeout).toHaveBeenCalled();
      });      
    });
  });
});
