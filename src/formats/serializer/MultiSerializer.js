MUSIC = MUSIC ||{};
MUSIC.Formats = MUSIC.Formats||{};
MUSIC.Formats.MultiSerializer = {};
(function() {

var serializerArray = [];

MUSIC.Formats.MultiSerializer.selector = function() {
 // TODO
};

MUSIC.Formats.MultiSerializer.serialize = function(type, obj) {
  return MUSIC.Formats.MultiSerializer.selector(
    serializerArray.map(function(s) {
      return s.base.concat(s.serializer.serialize(type, obj));
    })
  );
};

MUSIC.Formats.MultiSerializer.deserialize = function(type, obj) {
  for (var i=0;i<serializerArray.length;i++) {
    if (obj[0]===serializerArray[i].base) return serializerArray[i].serializer.deserialize(type, obj.slice(1));
  }

  throw new Error("Unsupported format");
};

MUSIC.Formats.MultiSerializer.setSerializers = function(array) {
  serializerArray = array;
};

})();
