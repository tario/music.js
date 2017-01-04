MUSIC = MUSIC ||{};
MUSIC.Formats = MUSIC.Formats||{};
MUSIC.Formats.MultiSerializer = {};
(function() {

var serializerArray = [];

var match = function(a, b) {
  if (typeof a !== typeof b) return false;

  if (Array.isArray(a) && !Array.isArray(b)) return false;
  if (Array.isArray(b) && !Array.isArray(a)) return false;

  if (Array.isArray(a)) {
    if (a.length !== b.length) return false;
    for (var i=0; i<a.length; i++) {
      if (!match(a[i], b[i])) return false;
    }
    return true;
  } else if (typeof a === 'object') {
    return Object.keys(a).every(function(key) {
      return match(a[key], b[key]);
    });
  } else {
    return a === b;
  }
};

MUSIC.Formats.MultiSerializer.match = match;

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
      var serialized = s.serializer.serialize(type, obj);
      if (!serialized) return serialized;
      return s.base.concat(serialized);
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
