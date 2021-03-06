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

  var fakeTime = MUSIC.Math.ticksToTime({
    bpm: 60,
    ticks_per_beat: 1000,
    bpm_events: [],
    start: 0
  });

  it("should allow create NoteSequence for FunctionSequence and instrument", function(){
    var seq = new MUSIC.NoteSequence(fakeFunSeq, {time: fakeTime});
    expect(seq.push).toEqual(jasmine.any(Function));
  })

  describe("when instantiated", function() {
    var noteseq;
    beforeEach(function() {
      noteSeq = new MUSIC.NoteSequence(fakeFunSeq, {time: fakeTime});
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

        describe("when added one note to funseq", function() {
          beforeEach(function(){
            noteSeq.push([12,0,100]); // noteNum, startTime, duration
            baseContext = MUSIC.NoteSequence.context(fakeInstrument);
          });

          describe("when called stop after first note",function() {
            var notePlaying
            var notePlayable;
            var playing;

            beforeEach(function() {
              playable = new MUSIC.NoteSequence.Playable(noteSeq, fakeInstrument);

              fakeInstrument.note = function() {
                return notePlayable;
              };
              
              notePlayable = {
                play: function() { return notePlaying; }
              };
              notePlaying = {
                stop: jasmine.createSpy("instrument.note(...).stop")
              };

              playing = playable.play();
              playing._context = baseContext;
              fakeFunSeq.push.calls.argsFor(0)[0].f(baseContext);
            });

            it("should output to funseq end calling function to call stop on object returned by instrument.note(...).play", function(){
              playing.stop();
              expect(notePlaying.stop).toHaveBeenCalled();
            });          
          });
        });

        describe("when added two simultaneous notes to funseq", function() {
          var playing12, playing14;
          var playableNoteSeq;
          beforeEach(function(){
            playing12 = {
              stop: jasmine.createSpy("note(12).play().stop()")
            };
            playing14 = {
              stop: jasmine.createSpy("note(14).play().stop()")
            };
            var play12 = {
              play: function() { return playing12; }
            };
            var play14 = {
              play: function() { return playing14; }
            };
            fakeInstrument = {
              note: function(n) {
                if (n===12) return play12;
                if (n===14) return play14;
              }
            };
            noteSeq.push([12,0,100]); // noteNum, startTime, duration
            noteSeq.push([14,0,100]); // noteNum, startTime, duration
            baseContext = MUSIC.NoteSequence.context(fakeInstrument);
            playableNoteSeq = noteSeq.makePlayable(fakeInstrument);
          });

          describe("when called start event on both", function() {
            var playing;
            beforeEach(function() {
              playing = playableNoteSeq.play();
              playing._context = baseContext;

              fakeFunSeq.push.calls.argsFor(0)[0].f(baseContext);
              fakeFunSeq.push.calls.argsFor(2)[0].f(baseContext);
            });

            describe("when called stop on noteseq", function() {
              beforeEach(function() {
                playing.stop();
              });

              it("should stop first playing note", function() {
                expect(playing12.stop).toHaveBeenCalled();
              });

              it("should stop second playing note", function() {
                expect(playing14.stop).toHaveBeenCalled();
              });              
            });

            describe("when called end event of first", function() {
              beforeEach(function() {
                fakeFunSeq.push.calls.argsFor(1)[0].f(baseContext);
              });

              it("should stop first playing note", function() {
                expect(playing12.stop).toHaveBeenCalled();
              });

              it("should NOT stop second playing note", function() {
                expect(playing14.stop).not.toHaveBeenCalled();
              });
            });

            describe("when called end event of second", function() {
              beforeEach(function() {
                fakeFunSeq.push.calls.argsFor(3)[0].f(baseContext);
              });

              it("should NOT stop first playing note", function() {
                expect(playing12.stop).not.toHaveBeenCalled();
              });

              it("should stop second playing note", function() {
                expect(playing14.stop).toHaveBeenCalled();
              });
            });

            describe("when called end event of both", function() {
              beforeEach(function() {
                fakeFunSeq.push.calls.argsFor(1)[0].f(baseContext);
                fakeFunSeq.push.calls.argsFor(3)[0].f(baseContext);
              });

              it("should stop first playing note", function() {
                expect(playing12.stop).toHaveBeenCalled();
              });

              it("should stop second playing note", function() {
                expect(playing14.stop).toHaveBeenCalled();
              });
            });
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
          expect(fakeInstrument.note).toHaveBeenCalledWith(noteNum, undefined /* options */);
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
          it("should NOT raise an exception", function(){
            expect(function() {
              fakeFunSeq.push.calls.argsFor(1)[0].f(baseContext);
            }).not.toThrow();
          });          
        });

        describe("when end event is called after start event",function() {
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
