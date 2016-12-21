MUSIC = MUSIC ||{};
MUSIC.Formats = MUSIC.Formats||{};
MUSIC.Formats.MultiSerializer = {};
(function() {

var serializerArray = [];

MUSIC.Formats.MultiSerializer.serialize = function(type, obj) {
  var output = serializerArray[0].serializer.serialize(type, obj)
  return serializerArray[0].base.concat(output);
};

MUSIC.Formats.MultiSerializer.setSerializers = function(array) {
  serializerArray = array;
};

})();
