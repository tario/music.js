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
    var seq = MUSIC.NoteSequence(fakeFunSeq, fakeInstrument);
  })
});
