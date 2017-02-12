MUSIC = MUSIC ||{};
MUSIC.Formats = MUSIC.Formats||{};
MUSIC.Formats.CachedSerializer = function(innerSerializer) {
  var lastOutput;
  var lastInput;
  var lastType;

  return {
    serialize: function(type, input) {
      if (lastType && lastInput) {
        if (lastType === type && lastInput === input) return lastOutput;
      }

      lastType = type;
      lastInput = input;
      lastOutput = innerSerializer.serialize(type, input);
      return lastOutput;
    },

    deserialize: innerSerializer.deserialize.bind(innerSerializer)
  };
};
