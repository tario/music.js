var musicShowCaseApp = angular.module("MusicShowCaseApp");
musicShowCaseApp.factory("_localforage", ['$q', 'localforage', function($q, localforage) {
  var getItem = localforage.getItem.bind(localforage);

  var releaseWithIndex = function(index, bytes) {
    if (index.length === 0) return $q.when(index);
    if (bytes <= 0) return $q.when(index);

    var nextEntry = index.shift();
    return localforage.getItem(nextEntry.id)
      .then(function(value) {
        return localforage.removeItem(nextEntry.id)
          .then(function() {
             return releaseWithIndex(index, bytes - (value ? value.length : 0));
          });
      });
  };

  var clearItem = function(data) {
    return {id: data.id, name: data.name, type: data.type};
  };

  var release = function(bytes) {
    return localforage.getItem("recycle")
      .then(function(index) {
        return releaseWithIndex(index, bytes);
      })
      .then(function(newIndex) {
        return localforage.setItem("recycle", newIndex.map(clearItem));
      });
  };

  var setItem = function(key, object, isretry) {
    return localforage.setItem(key, object)
      .catch(function(err) {
        if (!isretry) {
          return release(object.length)
            .then(function() {
              return setItem(key, object, true);
            });
        }

        throw err;
      });
  };


  var removeItem = localforage.removeItem.bind(localforage);

  return {
    getItem: getItem,
    setItem: setItem,
    removeItem: removeItem
  };
}]);
