var musicShowCaseApp = angular.module("MusicShowCaseApp");
musicShowCaseApp.factory("Index", ['$q', '$timeout', 'localforage', function($q, $timeout, localforage) {

  return function(indexName) {
    var storageIndex;
    var reload = function() {
      // load stoargeIndex
      storageIndex = localforage.getItem(indexName);
      return storageIndex;
    };

    var removeEntry = function(id) {
      return storageIndex
        .then(function(index) {
          if (!index) return;
          index = index.filter(function(x) { return x.id !== id; });
          return localforage.setItem(indexName, index);
        })
        .then(reload);
    };

    var getEntry = function(id) {
      return storageIndex
        .then(function(index) {
          if (!index) return null;
          return index.filter(function(x) { return x.id === id; })[0];
        });
    };

    var createEntry = function(data) {
      return storageIndex
        .then(function(index) {
          index = index || [];
          index.push(data);
          return localforage.setItem(indexName, index);
        })
        .then(reload);
    };

    var updateEntry = function(id, attributes) {
      return storageIndex
        .then(function(index) {
          var localFile = index.filter(function(x) { return x.id === id; })[0];
          localFile.name = attributes.name;
          return localforage.setItem(indexName, index);
        })
        .then(reload);
    };

    var getAll = function() {
      return storageIndex;
    };

    reload();

    return {
      reload: reload,
      removeEntry: removeEntry,
      getEntry: getEntry,
      createEntry: createEntry,
      updateEntry: updateEntry,
      getAll: getAll
    };
  };
}]);
