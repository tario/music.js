var musicShowCaseApp = angular.module("MusicShowCaseApp");
musicShowCaseApp.factory("Export", ['$q', 'FileRepository', function($q, FileRepository) {
  var exportContents = function(name, contents) {
    var a = document.createElement("a");
    document.body.appendChild(a);
    a.style = "display: none";

    var blob = new Blob([JSON.stringify(contents, null,"  ")]);
    var url  = window.URL.createObjectURL(blob);
    a.href = url;
    a.download = name + ".json";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  var getRelatedIds = function(file) {
    if (file.index.type === 'pattern') {
      var related = {};
      file.contents.tracks.forEach(function(track) {
        related[track.instrument] = 1;
      });
      return Object.keys(related);
    } else if (file.index.type === 'song') {
      var related = {};
      file.contents.tracks.forEach(function(track) {
        track.blocks.forEach(function(block) {
          related[block.id] = 1;
        });
      });
      return Object.keys(related);
    }

    return [];
  };

  var getFileWithRelated = function(id) {
    var ret = [];
    return FileRepository.getFile(id)
      .then(function(file) {
        if (!file) return [];

        ret.push({
          name: file.index.name,
          type: file.index.type,
          id: file.index.id,
          contents: file.contents
        });

        return $q.all(getRelatedIds(file).map(getFileWithRelated))
          .then(function(relarray) {
            relarray.forEach(function(rel) {
              ret = ret.concat(rel);
            });
            return ret;
          });
      });
  };

  var exportFile = function(name, id) {
    return getFileWithRelated(id)
      .then(function(array) {
        exportContents(name, array);
      });
  };

  var importFile = function(contents) {
    var importItem = function(item) {
      return function() {
        return FileRepository.destroyFile(item.id)
          .then(function() {
            return FileRepository.createFile({
              id: item.id,
              contents: item.contents,
              type: item.type,
              name: item.name
            });
          });
      };
    };

    var p = null;
    var parsed = JSON.parse(contents);
    var firstItem = parsed[0];

    parsed.forEach(function(item) {
      if (p) {
        p = p.then(importItem(item));
      } else {
        p = importItem(item)();
      }
    });

    return p.then(function() {
      return {id: firstItem.id, type: firstItem.type};
    });
  };

  return {
    exportContents: exportContents,
    exportFile: exportFile,
    importFile: importFile
  };
}]);
