describe("Music.NoteSequence", function() {
  var fakeFunSeq;
  var fakeInstrument;
  var fakeInstrumentSpy;

  beforeEach(function() {
    fakeFunSeq = {};
    fakeFunSeq.start = jasmine.createSpy("FunSeq.start");
    fakeFunSeq.push = jasmine.createSpy("FunSeq.start");

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
      });

    });

    var testSingleNote = function(noteNum, startTime, duration) {

      describe("when added a note ("+noteNum+") at " + startTime + " with duration " + duration, function() {
        beforeEach(function(){
          noteSeq.push([noteNum,startTime,duration]); // noteNum, startTime, duration
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
          fakeFunSeq.push.calls.argsFor(0)[0].f(MUSIC.NoteSequence.context(fakeInstrument));
          expect(fakeInstrument.note).toHaveBeenCalled();
        });

        it("should output to funseq start calling function to call instrument.note with notenum " + noteNum, function(){
          fakeFunSeq.push.calls.argsFor(0)[0].f(MUSIC.NoteSequence.context(fakeInstrument));
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
            fakeFunSeq.push.calls.argsFor(0)[0].f(MUSIC.NoteSequence.context(fakeInstrument));
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
            fakeFunSeq.push.calls.argsFor(0)[0].f(MUSIC.NoteSequence.context(fakeInstrument));
          });

          it("should output to funseq end calling function to call stop on object returned by instrument.note(...).play", function(){
            fakeFunSeq.push.calls.argsFor(1)[0].f(MUSIC.NoteSequence.context(fakeInstrument));
            expect(playing.stop).toHaveBeenCalled();
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
