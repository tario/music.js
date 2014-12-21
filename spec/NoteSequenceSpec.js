describe("Music.NoteSequence", function() {
  var fakeFunSeq;
  var fakeInstrument;
  var fakeInstrumentSpy;
  var runningFunSeq;

  beforeEach(function() {
    jasmine.addMatchers({
      toBeNoteSequenceContext: function(util, customEqualityTesters) {
        return {
          compare: function(actual, expected) {
            if (typeof actual !== "object")
              return {pass: false, message: actual + " is not an object"};

            if (!actual.instrument)
              return {pass: false, message: actual + " doesn't have instrument attribute"};

            if (typeof actual.instrument.note !== "function")
              return {pass: false, message: actual + " instrument doesn't respond to .note()"};

            return {pass: true};
          }
        };
      }
    });

    fakeFunSeq = {start: function() {
      var fakeRunningFunSeq = {
        stop: jasmine.createSpy("runningFunSeqStop")
      };

      runningFunSeq = fakeRunningFunSeq;
      return fakeRunningFunSeq;
    }, push: function() {}};

    spyOn(fakeFunSeq, "start").and.callThrough();
    spyOn(fakeFunSeq, "push").and.callThrough();

    fakeInstrument = {
      note: function() {
        return {play:function(){}};
      }
    };

    spyOn(fakeInstrument, "note").and.callThrough();
  });

  it("should allow create NoteSequence for FunctionSequence and instrument", function(){
    var seq = new MUSIC.NoteSequence(fakeFunSeq);
    expect(seq.push).toEqual(jasmine.any(Function));
  })

  describe("when instantiated", function() {
    var noteseq;
    beforeEach(function() {
      noteSeq = new MUSIC.NoteSequence(fakeFunSeq);
    });

    describe("when called makePlayable", function() {
      var playable;
      beforeEach(function() {
        playable = noteSeq.makePlayable(fakeInstrument);
      });

      it("should be playable", function() {
        expect(playable.play).toEqual(jasmine.any(Function));
      });

      describe("when called play", function(){
        var playing;
        beforeEach(function() {
          playing = playable.play();
        });

        it("should be stoppable", function() {
          expect(playing.stop).toEqual(jasmine.any(Function));
        });

        it("should call funseq.start", function() {
          expect(fakeFunSeq.start).toHaveBeenCalled();
        });

        it("should call funseq.start with NoteSequence context", function() {
          expect(fakeFunSeq.start.calls.argsFor(0)[0]).toBeNoteSequenceContext();
        });

        describe("when called stop", function(){
          beforeEach(function() {
            playing.stop();
          });

          it("should call funseq.start(...).stop", function() {
            expect(runningFunSeq.stop).toHaveBeenCalled();
          });
        });
      });

    });

    var testSingleNote = function(noteNum, startTime, duration) {

      describe("when added a note ("+noteNum+") at " + startTime + " with duration " + duration, function() {
        var baseContext;
        beforeEach(function(){
          noteSeq.push([noteNum,startTime,duration]); // noteNum, startTime, duration
          baseContext = MUSIC.NoteSequence.context(fakeInstrument);

        });

        var endTime = startTime + duration;

        it("should output to funseq start event at " + startTime, function(){
          expect(fakeFunSeq.push.calls.argsFor(0)[0].t).toEqual(startTime);
        });

        it("should output to funseq end event at " + endTime, function(){
          expect(fakeFunSeq.push.calls.argsFor(1)[0].t).toEqual(endTime);
        });

        it("should output to funseq start event a function", function(){
          expect(fakeFunSeq.push.calls.argsFor(0)[0].f).toEqual(jasmine.any(Function));
        });

        it("should output to funseq end event a function", function(){
          expect(fakeFunSeq.push.calls.argsFor(1)[0].f).toEqual(jasmine.any(Function));
        });

        it("should output to funseq start calling function to call instrument.note", function(){
          fakeFunSeq.push.calls.argsFor(0)[0].f(baseContext);
          expect(fakeInstrument.note).toHaveBeenCalled();
        });

        it("should output to funseq start calling function to call instrument.note with notenum " + noteNum, function(){
          fakeFunSeq.push.calls.argsFor(0)[0].f(baseContext);
          expect(fakeInstrument.note).toHaveBeenCalledWith(noteNum);
        });

        describe("when start event is called",function() {
          var playable = {
            play: jasmine.createSpy("instrument.note().play")
          };
          beforeEach(function() {
            fakeInstrument.note = function() {
              return playable;
            };
          });
          it("should output to funseq start calling function to call play on object returned by instrument.note", function(){
            fakeFunSeq.push.calls.argsFor(0)[0].f(baseContext);
            expect(playable.play).toHaveBeenCalled();
          });
        });

        describe("when end event is called",function() {
          var playing = {
            stop: jasmine.createSpy("instrument.note(...).stop")
          };

          var playable = {
            play: function() { return playing; } 
          };

          beforeEach(function() {
            fakeInstrument.note = function() {
              return playable;
            };
            fakeFunSeq.push.calls.argsFor(0)[0].f(baseContext);
          });

          it("should output to funseq end calling function to call stop on object returned by instrument.note(...).play", function(){
            fakeFunSeq.push.calls.argsFor(1)[0].f(baseContext);
            expect(playing.stop).toHaveBeenCalled();
          });
        });

        describe("when using two contexts", function() {
          var ctx1;
          var ctx2;
          var i;
          var note1;
          var playableNote;
          var playing1;
          var playing2;

          beforeEach(function() {
            fakeInstrument = {
              note: function() {
                i++;
                return playableNote[i];
              }
            };

            ctx1 = MUSIC.NoteSequence.context(fakeInstrument);
            ctx2 = MUSIC.NoteSequence.context(fakeInstrument);
            i = -1;
            playing1 = {
              stop: jasmine.createSpy("note1.stop")
            };
            playing2 = {
              stop: jasmine.createSpy("note2.stop")
            };

            note1 = {
              play: function(){
                return playing1;
              }
            };
            note2 = {
              play: function(){
                return playing2;
              }
            };
            playableNote = [ note1, note2 ];

          });

          describe("when calling two starting functions", function() {
            beforeEach(function() {
              fakeFunSeq.push.calls.argsFor(0)[0].f(ctx1);
              fakeFunSeq.push.calls.argsFor(0)[0].f(ctx2);
            });

            describe("when calling end function for context 1", function() {
              beforeEach(function() {
                fakeFunSeq.push.calls.argsFor(1)[0].f(ctx1);
              });

              it("should call stop for playing1 returned from note1.play", function() {
                expect(playing1.stop).toHaveBeenCalled();
              });

              it("should NOT call stop for playing2 returned from note1.play", function() {
                expect(playing2.stop).not.toHaveBeenCalled();
              });
            });

            describe("when calling end function for context 2", function() {
              beforeEach(function() {
                fakeFunSeq.push.calls.argsFor(1)[0].f(ctx2);
              });

              it("should NOT call stop for playing1 returned from note1.play", function() {
                expect(playing1.stop).not.toHaveBeenCalled();
              });

              it("should call stop for playing2 returned from note1.play", function() {
                expect(playing2.stop).toHaveBeenCalled();
              });
            });
          });

        });

      });
    };

    [0,1,2,3,4,5,12,30].forEach(function(noteNum) {
      [10,100,200,321,94].forEach(function(duration) {
        [10,100,200,3000, 5411, 10000, 1000000].forEach(function(startTime) {
          testSingleNote(noteNum,startTime,duration);
        });
      });
    });
  });
});
