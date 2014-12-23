describe("Music.SequenceParser", function() {

  var notes = {
    "C": 0,
    "D": 2,
    "E": 4,
    "F": 5,
    "G": 7,
    "A": 9,
    "B": 11
  };

  var noteSeq;
  beforeEach(function() {
    noteSeq = {
      push: jasmine.createSpy("noteSeq.push")
    };
  });

  for (var note in notes) {
    describe("when parsed note '" + note + "'", function() {
      beforeEach(function(){
        MUSIC.SequenceParser.parse(note, noteSeq);
      });

      it("should call push on noteSeq", function(){
        expect(noteSeq.push).toHaveBeenCalled();
      });

      it("should call push on noteSeq with note on semitone " + notes[note], function(){
        expect(noteSeq.push).toHaveBeenCalledWith(notes[note],0,1);
      });

      it("should call push on noteSeq ONLY one time", function(){
        expect(noteSeq.push.calls.count()).toEqual(1);
      });
    });
  };
});
