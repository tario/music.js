MUSIC = MUSIC ||{};
MUSIC.Formats = MUSIC.Formats||{};
MUSIC.Formats.JSONSerializer = {};

MUSIC.Formats.JSONSerializer.serialize = function(type, obj) {
  return JSON.stringify(obj);
};
