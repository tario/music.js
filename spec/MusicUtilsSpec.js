describe("Music.Utils", function() {

  describe("Scale", function() {
    var scaleTest = function(scaleName, scaleNum) {
      return function(semitone1, noteNum, semitoneResult) {
        it(scaleName + " scale should get semitone " + semitoneResult + " from adding " + noteNum + " notes to semitone " + semitone1 , function() {
          var scale = MUSIC.Utils.Scale(scaleNum);
          expect(scale.add(semitone1, noteNum)).toBe(semitoneResult);
        });
      };
    };

    var s = scaleTest("C major", 0); // [0|2|4][5|7|9|11] think of piano keys for all scales
    [0,2,4,5,7,9,11].forEach(function(semitone, index) {
      s(0, index, semitone);
    });
  });
});
