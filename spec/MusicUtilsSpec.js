describe("Music.Utils", function() {

  describe("Scale", function() {
    var noteNumToSemitone = function(scaleName, scaleNum, semitone1, noteNum, semitoneResult) {
      it(scaleName + " scale should get semitone " + semitoneResult + " from adding " + noteNum + " notes to semitone " + semitone1 , function() {
        var scale = MUSIC.Utils.Scale(scaleNum);
        expect(scale.add(semitone1, noteNum)).toBe(semitoneResult);
      });
    };

    noteNumToSemitone("C#", 0, 0, 0, 0);
  });
});
