describe("Music.SequenceParser", function() {

  var notes = {
    "Cb": -1,
    "C": 0,
    "C#": 1,
    "Db": 1,
    "D": 2,
    "D#": 3,
    "Eb": 3,
    "E": 4,
    "E#": 5,
    "Fb": 4,
    "F": 5,
    "F#": 6,
    "Gb": 6,
    "G": 7,
    "G#": 8,
    "Ab": 8,
    "A": 9,
    "A#": 9,
    "Bb": 10,
    "B": 11,
    "B#": 12
  };

  var noteSeq;
  beforeEach(function() {
    noteSeq = {
      push: jasmine.createSpy("noteSeq.push")
    };
  });

  var pushNotShouldBeCalled =  function(){
    expect(noteSeq.push).not.toHaveBeenCalled();
  };

  describe("when empty string is parsed", function() {
    beforeEach(function(){
      MUSIC.SequenceParser.parse("", noteSeq);
    });

    it("should NOT empty any note to noteSeq", pushNotShouldBeCalled);
  });

  for (var i = 1; i < 10; i++) {
    describe("when string with " + i + " spaces is parsed", function() {
      beforeEach(function(){
        MUSIC.SequenceParser.parse(Array(i+1).join(" "), noteSeq);
      });

      it("should NOT empty any note to noteSeq", pushNotShouldBeCalled);
    });

    describe("when string with " + i + " spaces and C note is parsed", function() {
      (function() {
        var index = i;
        beforeEach(function(){
          MUSIC.SequenceParser.parse(Array(index+1).join(" ") + "C", noteSeq);
        });

        it("should empty a note at time " + index, function() {
          expect(noteSeq.push).toHaveBeenCalledWith([0,index,1]);       
        });
      })();
    });
  };


  for (var note in notes) {
    describe("when parsed note '" + note + "'", function() {
      beforeEach(function(){
        MUSIC.SequenceParser.parse(note, noteSeq);
      });

      it("should call push on noteSeq", function(){
        expect(noteSeq.push).toHaveBeenCalled();
      });

      it("should call push on noteSeq with note on semitone " + notes[note], function(){
        expect(noteSeq.push).toHaveBeenCalledWith([notes[note],0,1]);
      });

      it("should call push on noteSeq ONLY one time", function(){
        expect(noteSeq.push.calls.count()).toEqual(1);
      });
    });
  };
});
