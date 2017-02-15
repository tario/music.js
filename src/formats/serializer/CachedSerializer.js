MUSIC = MUSIC ||{};
MUSIC.Formats = MUSIC.Formats||{};
MUSIC.Formats.CachedSerializer = function(innerSerializer) {
  var lastOutput;
  var lastInput;
  var lastType;

  return {
    serialize: function(type, input) {
      var jsonCurrentInput;
      if (lastType && lastInput) {
        jsonCurrentInput = JSON.stringify(input)
        if (lastType === type && lastInput === jsonCurrentInput) return lastOutput;
      }

      lastType = type;
      lastInput = jsonCurrentInput || JSON.stringify(input);
      lastOutput = innerSerializer.serialize(type, input);
      return lastOutput;
    },

    deserialize: innerSerializer.deserialize.bind(innerSerializer)
  };
};
