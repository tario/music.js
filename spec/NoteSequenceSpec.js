describe("Music.NoteSequence", function() {
  var fakeFunSeq;
  var fakeInstrument;
  beforeEach(function() {
    fakeFunSeq = {};
    fakeFunSeq.start = jasmine.createSpy("FunSeq.start");
    fakeFunSeq.push = jasmine.createSpy("FunSeq.start");

    fakeInstrument = {};
    fakeInstrument = jasmine.createSpy("instrument.note");
  });

  it("should allow create NoteSequence for FunctionSequence and instrument", function(){
    var seq = new MUSIC.NoteSequence(fakeFunSeq, fakeInstrument);
    expect(seq.push).toEqual(jasmine.any(Function));
  })

  describe("when instantiated", function() {
    var noteseq;
    beforeEach(function() {
      noteSeq = new MUSIC.NoteSequence(fakeFunSeq, fakeInstrument);
    });

    describe("when added a note at 0 with duration 100", function() {
      beforeEach(function(){
        noteSeq.push([0,0,100]); // noteNum, startTime, duration
      });

      it("should output to funseq start event at 0", function(){
        expect(fakeFunSeq.push.calls.argsFor(0)[0].t).toEqual(0);
      });

      it("should output to funseq end event at 100", function(){
        expect(fakeFunSeq.push.calls.argsFor(1)[0].t).toEqual(100);
      });
    });
  });
});
