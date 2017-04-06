var musicShowCaseApp = angular.module("MusicShowCaseApp");
musicShowCaseApp.factory("Index", ['$q', '$timeout', '_localforage', function($q, $timeout, localforage) {
  var Sync = function() {
    var promise = $q.when();
    this.sync = function(f) {
      return function() {
        var _args = arguments;
        var _self = this;
        var defer = $q.defer();

        promise = promise.then(function() {
          return f.apply(_self, _args)
            .then(function(value) {
              defer.resolve(value);
            })
            .catch(function(err) {
              defer.reject(err);
            });
        });
        return defer.promise;
      };
    };
  };

  var IndexFactory = function(indexName) {
    var entryChange = new Sync();

    var storageIndex;
    var reload = function() {
      // load stoargeIndex
      storageIndex = localforage.getItem(indexName);
      return storageIndex;
    };

    var clearItem = function(data) {
      var ret = {id: data.id, name: data.name, type: data.type, project: data.project, ref: data.ref};
      if (data.c) ret.c=data.c;
      return ret;
    };

    var removeEntry = function(id) {
      return storageIndex
        .then(function(index) {
          if (!index) return;
          index = index.filter(function(x) { return x.id !== id; });
          return localforage.setItem(indexName, index.map(clearItem));
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

    var createEntry = entryChange.sync(function(data) {
      return storageIndex
        .then(function(index) {
          index = index || [];

          if (IndexFactory.isolatedContext) {
            data.c = IndexFactory.isolatedContext;
          }

          index.push(data);
          return localforage.setItem(indexName, index.map(clearItem));
        })
        .then(reload);
    });

    var updateEntry = entryChange.sync(function(id, attributes) {
      return storageIndex
        .then(function(index) {
          var localFile = index.filter(function(x) { return x.id === id; })[0];
          localFile.name = attributes.name;
          localFile.ref = attributes.ref;

          if (IndexFactory.isolatedContext) {
            localFile.c = IndexFactory.isolatedContext;
          }

          return localforage.setItem(indexName, index.map(clearItem));
        })
        .then(reload);
    });

    var getAll = function() {
      return storageIndex
        .then(function(index) {
          var ic = IndexFactory.isolatedContext;
          if (ic) {
            return index.filter(function(entry) {return entry.c === ic; });
          }
          return index;
        });
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

  return IndexFactory;
}]);
