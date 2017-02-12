describe("PackedJSONSerializerB", function() {
  var patterns = [];
  var track1 = {"scroll":1000,"instrument": "8a3bcf2aadc59f6ee6d983d31d461a87", "events":[{"n":66,"s":48,"l":96},{"n":64,"s":216,"l":96}], "muted": true};
  var track2 = {"scroll":1000,"instrument": "8a3bcf2aadc59f6ee6d983d31d461a87", "events":[{"n":66,"s":48,"l":96},{"n":64,"s":216,"l":96}], "muted": false};
  var track3 = {"scroll":1000,"instrument": "8a3bcf2aadc59f6ee6d983d31d461a87", "events":[{"n":66,"s":48,"l":96},{"n":64,"s":216,"l":96}]};
  patterns.push({"measure":5,"measureCount":1,"bpm":140,"selectedTrack":0,"tracks":[track1],"scrollLeft":0});
  patterns.push({"measure":5,"measureCount":1,"bpm":140,"selectedTrack":0,"tracks":[track2],"scrollLeft":0});
  patterns.push({"measure":5,"measureCount":1,"bpm":140,"selectedTrack":0,"tracks":[track3],"scrollLeft":0});

  DeserializerTest.test(SerializerOracle.PackedJSONB.serialize, MUSIC.Formats.PackedJSONSerializerB.deserialize, {
    patterns: patterns
  });
});
