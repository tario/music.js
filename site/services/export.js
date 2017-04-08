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
    if (file.index.type === 'project') {
      return (file.index.ref||[]);
    } else {
      var ret = FileRepository.getRefs(file.index.type, file.contents);
      if (file.index.project) ret.push(file.index.project);
      return ret;
    }
  };

  var concat = function(x, y) {return x.concat(y); };
  var getFileWithRelated = function(id) {
    var ret = [];
    return FileRepository.getFile(id)
      .then(function(file) {
        if (!file) return [];

        ret.push({
          name: file.index.name,
          type: file.index.type,
          id: file.index.id,
          contents: file.contents,
          project: file.index.project,
          ref: file.index.ref
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

  var uniq = function(array) {
    var files = {};
    array.forEach(function(file) {
      files[file.id] = file;
    });

    return Object.keys(files).map(function(id) {
      return files[id];
    });
  };

  var exportProject = function(name, id) {
    var getId = function(x) { return x.id; };

    FileRepository.getProjectFiles(id)
      .then(function(files) {
        return $q.all(files.map(getId).map(getFileWithRelated));
      })
      .then(function(array){
        array = array.reduce(concat, []);
        exportContents(name, uniq(array));
      });
  };

  var exportFile = function(name, id) {
    return getFileWithRelated(id)
      .then(function(array) {
        exportContents(name, uniq(array));
      });
  };

  var importFile = function(contents) {
    var importItem = function(item) {
      return function() {
        return FileRepository.getIndex(item.id)
          .then(function(index) {
            if (index) {
              return FileRepository.updateFile(item.id, item.contents)
                .then(function() {
                  return FileRepository.updateIndex(item.id, {
                    name: item.name,
                    project: item.project
                  });
                });
            } else {
              return FileRepository.purgeFromRecycleBin(item.id)
                .then(function() {
                  return FileRepository.createFile({
                    id: item.id,
                    contents: item.contents,
                    type: item.type,
                    name: item.name,
                    project: item.project,
                    ref: item.ref
                  });
                });
            }
          });
      };
    };

    return $q.when()
      .then(function() {
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
          return {id: firstItem.id, type: firstItem.type, project: firstItem.project};
        });
      });
  };

  return {
    exportContents: exportContents,
    exportFile: exportFile,
    exportProject: exportProject,
    importFile: importFile
  };
}]);
