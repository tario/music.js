MUSIC = MUSIC ||{};
MUSIC.Formats = MUSIC.Formats||{};
MUSIC.Formats.MultiSerializer = {};
(function() {

var serializerArray = [];

MUSIC.Formats.MultiSerializer.match = function(a, b) {
  return JSON.stringify(a)===JSON.stringify(b);
};

MUSIC.Formats.MultiSerializer.wrapSerializer = function(serializer) {
  return {
    serialize: function(type, obj) {
      try {
        var output = serializer.serialize(type, obj);
        var recoveredInput = serializer.deserialize(type, output);
        return MUSIC.Formats.MultiSerializer.match(obj, recoveredInput) ? output : null;
      }catch(e) {
        return null; // failed serializations are discarded
      }
    },
    deserialize: serializer.deserialize
  };
};

var smallest = function(a, b) {
  return a.length < b.length ? a : b;
};

var truthy = function(a) { return !!a };

MUSIC.Formats.MultiSerializer.selector = function(array) {
  array = array.filter(truthy);
  if (array.length) return array.filter(truthy).reduce(smallest);

  throw new Error("serialization not found");
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
  serializerArray = array.map(function(entry) {
    return {
      serializer: MUSIC.Formats.MultiSerializer.wrapSerializer(entry.serializer),
      base: entry.base
    };
  });
};

})();
