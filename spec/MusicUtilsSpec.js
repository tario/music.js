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

    var cmajor = scaleTest("C major", 0); // [0|2|4][5|7|9|11] think of piano keys for all scales
    var dmajor = scaleTest("D major", 2); // [0|2|4][5|7|9|11] think of piano keys for all scales
    var emajor = scaleTest("E major", 4); // [0|2|4][5|7|9|11] think of piano keys for all scales
    var multiScaleTest = function(semitone1, noteNum, semitoneResult) {
      cmajor(semitone1, noteNum, semitoneResult);
      dmajor(semitone1+2, noteNum, semitoneResult+2);
      emajor(semitone1+4, noteNum, semitoneResult+4);
    };

    for (var x = 0; x<4; x++) {
      describe("Octave " + x, function() {
        [0,2,4,5,7,9,11].forEach(function(semitone, index) {
          multiScaleTest(x*12, index, semitone + x*12);
          multiScaleTest(x*12, index+7, semitone + (x+1)*12);
          multiScaleTest(x*12, index+14, semitone + (x+2)*12);
        });

        [2,4,5,7,9,11,12].forEach(function(semitone, index) {
          multiScaleTest(x*12+2, index, semitone + x*12);
        });
      });
    }
  });
});
