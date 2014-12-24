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
      var index = i;
      beforeEach(function(){
        MUSIC.SequenceParser.parse(Array(index+1).join(" ") + "C", noteSeq);
      });

      it("should empty a note at time " + index, function() {
        expect(noteSeq.push).toHaveBeenCalledWith([0,index,1]);       
      });
    });
  };


  for (var note in notes) {
    describe("when parsed note '" + note + "'", function() {
      var noteString = note;
      beforeEach(function(){
        MUSIC.SequenceParser.parse(noteString, noteSeq);
      });

      it("should call push on noteSeq", function(){
        expect(noteSeq.push).toHaveBeenCalled();
      });

      it("should call push on noteSeq with note on semitone " + notes[noteString], function(){
        expect(noteSeq.push).toHaveBeenCalledWith([notes[noteString],0,noteString.length]);
      });

      it("should call push on noteSeq ONLY one time", function(){
        expect(noteSeq.push.calls.count()).toEqual(1);
      });
    });

    for (var note2 in notes) {
      describe("when parsed string '" + note + " " + note2 + "'", function() {
        var noteString = note+" "+note2;
        var strNote1 = note;
        var strNote2 = note2;

        beforeEach(function(){
          MUSIC.SequenceParser.parse(noteString, noteSeq);
        });

        it("should call push on noteSeq", function(){
          expect(noteSeq.push).toHaveBeenCalled();
        });

        it("should call push on noteSeq two times", function(){
          expect(noteSeq.push.calls.count()).toEqual(2);
        });

        it("should call noteSeq.push first time with notenum " + notes[strNote1], function(){
          expect(noteSeq.push.calls.argsFor(0)[0][0]).toEqual(notes[strNote1]);
        });

        it("should call noteSeq.push first time with startTime 0", function(){
          expect(noteSeq.push.calls.argsFor(0)[0][1]).toEqual(0);
        });

        it("should call noteSeq.push first time with duration " + note.length, function(){
          expect(noteSeq.push.calls.argsFor(0)[0][2]).toEqual(strNote1.length);
        });

        it("should call noteSeq.push second time with notenum " + notes[strNote2], function(){
          expect(noteSeq.push.calls.argsFor(1)[0][0]).toEqual(notes[strNote2]);
        });

        it("should call noteSeq.push second time with startTime " + (note.length+1), function(){
          expect(noteSeq.push.calls.argsFor(1)[0][1]).toEqual(strNote1.length+1);
        });

        it("should call noteSeq.push second time with duration " + note2.length, function(){
          expect(noteSeq.push.calls.argsFor(1)[0][2]).toEqual(strNote2.length);
        });

      });

      describe("when parsed string '" + note + note2 + "'", function() {
        var noteString = note+note2;
        var strNote1 = note;
        var strNote2 = note2;
        beforeEach(function(){
          MUSIC.SequenceParser.parse(noteString, noteSeq);
        });

        it("should call push on noteSeq", function(){
          expect(noteSeq.push).toHaveBeenCalled();
        });

        it("should call push on noteSeq two times", function(){
          expect(noteSeq.push.calls.count()).toEqual(2);
        });

        it("should call noteSeq.push first time with notenum " + notes[strNote1], function(){
          expect(noteSeq.push.calls.argsFor(0)[0][0]).toEqual(notes[strNote1]);
        });

        it("should call noteSeq.push first time with startTime 0", function(){
          expect(noteSeq.push.calls.argsFor(0)[0][1]).toEqual(0);
        });

        it("should call noteSeq.push first time with duration " + note.length, function(){
          expect(noteSeq.push.calls.argsFor(0)[0][2]).toEqual(strNote1.length);
        });

        it("should call noteSeq.push second time with notenum " + notes[strNote2], function(){
          expect(noteSeq.push.calls.argsFor(1)[0][0]).toEqual(notes[strNote2]);
        });

        it("should call noteSeq.push second time with startTime " + note.length, function(){
          expect(noteSeq.push.calls.argsFor(1)[0][1]).toEqual(strNote1.length);
        });

        it("should call noteSeq.push second time with duration " + note2.length, function(){
          expect(noteSeq.push.calls.argsFor(1)[0][2]).toEqual(strNote2.length);
        });


      });
    }
  };
});
