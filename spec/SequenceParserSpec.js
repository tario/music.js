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
    "A#": 10,
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

  var testSingleNote = function(str, expectedDuration, expectedNoteNum) {
    describe("when parsed string '" + str + "'", function() {
      beforeEach(function(){
        MUSIC.SequenceParser.parse(str, noteSeq);
      });

      it("should call push on noteSeq", function(){
        expect(noteSeq.push).toHaveBeenCalled();
      });

      it("should call push on noteSeq ONLY one time", function(){
        expect(noteSeq.push.calls.count()).toEqual(1);
      });

      it("should call push on noteSeq with note on semitone " + expectedNoteNum + " and duration " + expectedDuration, function(){
        expect(noteSeq.push).toHaveBeenCalledWith([expectedNoteNum,0,expectedDuration]);
      });      
    });
  };


  for (var note in notes) {
    for (var octaveNum = 0; octaveNum < 3; octaveNum++) {
      testSingleNote(note + octaveNum, note.length + 1, notes[note] + octaveNum*12);
    };

    testSingleNote(note, note.length, notes[note]);
    testSingleNote(note + "===.", note.length + 3, notes[note]);

    for (var note2 in notes) {
      var silenceCharacterTest = function(chr) {
        describe("when parsed string '" + note + chr + note2 + "'", function() {
          var noteString = note+chr+note2;
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
      };

      silenceCharacterTest(" ");
      silenceCharacterTest(".");


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

  var theSame = function(first, second, numNotes) {
    var noteseq1;
    var noteseq2;
    beforeEach(function(){
      noteSeq1 = {
        push: jasmine.createSpy("noteSeq.push")
      };
      noteSeq2 = {
        push: jasmine.createSpy("noteSeq.push")
      };
      MUSIC.SequenceParser.parse(first, noteSeq1);
      MUSIC.SequenceParser.parse(second, noteSeq2);
    });

    describe("when parsed '" + first + "' and '" + second + "'", function() {
      for (var i = 0; i < numNotes; i++) {
        (function(){
          var index = i;
          it("should output the same note number " + index, function() {
            expect(noteSeq1.push.calls.argsFor(index)[0]).toEqual(noteSeq2.push.calls.argsFor(index)[0]);
          });
        })();
      }
    });
  };

  describe("when there is pipes among notes" , function() {
    theSame("AAAA", "AA|AA", 4);
    theSame("AC", "|AC|", 2);
    theSame("ABCD", "ABCD|", 4);
    theSame("D#", "||||D#", 1);
    theSame("D#3", "||D#3||", 1);
    theSame("A=D#3", "A=||D#3||", 2);
  });
});
