var musicShowCaseApp = angular.module("MusicShowCaseApp");

musicShowCaseApp.factory("MusicObjectFactory", ["MusicContext", "$q", "TypeService", "pruneWrapper", "sfxBaseOneEntryCacheWrapper", function(MusicContext, $q, TypeService, pruneWrapper, sfxBaseOneEntryCacheWrapper) {
  var nextId = 0;
  var getConstructor = function(descriptor) {
      return TypeService.getType(descriptor.type)
        .then(function(type) {
          return function(subobjects) {
            if (!descriptor.last_type||descriptor.last_type === descriptor.type) {
              if (subobjects.length === 1) {
                if (descriptor.__cache && descriptor.__cache[subobjects[0].id]) {
                  return descriptor.__cache[subobjects[0].id]
                          .update(descriptor.data);
                }
              } else if (subobjects.length === 0) {
                if (descriptor.__cache && descriptor.__cache.noid) {
                  return descriptor.__cache.noid
                          .update(descriptor.data);
                }
              }
            }
            descriptor.last_type = descriptor.type;

            var ret = sfxBaseOneEntryCacheWrapper(type.constructor(descriptor.data, subobjects));
            nextId++;
            ret.id = nextId;

            if (subobjects.length === 1) {
              descriptor.__cache = descriptor.__cache || {};
              descriptor.__cache[subobjects[0].id] = ret;
            } else if (subobjects.length === 0) {
              descriptor.__cache = descriptor.__cache || {};
              descriptor.__cache.noid = ret;
            }

            return ret;
          };
        });
  };

  var create = function(descriptor) {
    if (descriptor.type === "stack") {
      return $q.all(descriptor.data.array.map(getConstructor))
        .then(function(constuctors) {
          var lastObj;
          constuctors.reverse().forEach(function(constructor) {
            if (lastObj) {
              lastObj = constructor([lastObj])
            } else {
              lastObj = constructor([])
            }
          });

          return MusicContext.runFcn(function(music) {
            return lastObj(music);
          });
        })
    } else {
      return getConstructor(descriptor)
        .then(function(constructor) {
          return constructor([]); 
        });
    }
  };

  return create;
}]);

musicShowCaseApp.service("MusicContext", function() {
  var music;

  var Recordable = function(music, playable, name) {
    this._playable = playable;
    this._music = music;
    this._name = name;
  };

  Recordable.prototype.record = function() {
    var playable = this._playable;
    var recording = music.record();
    var recordFileName = this._name;
    var playing = playable.play();

    MUSIC.Utils.FunctionSeq.preciseTimeout(function(){
      recording.stop();
      recording.exportWAV(function(blob) {
        var a = document.createElement("a");
        document.body.appendChild(a);
        a.style = "display: none";

        var url  = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = recordFileName + ".wav";
        a.click();
        window.URL.revokeObjectURL(url);
      });
    }, playable.duration());
  };

  return {
    runFcn: function(f) {
      if (!music) music = new MUSIC.Context().sfxBase();
      return f(music);
    },

    run: function(code) {
      if (music) {
        music.prune();
      }
      music = new MUSIC.Context().sfxBase();

      try {
        return {object: eval("(function() {\n" + code + "\n})")()};
      } catch(e) {
        return {error: e.toString()};
      }
    }
  };
});

musicShowCaseApp.service("TypeService", ["$http", "$q", "pruneWrapper", "sfxBaseOneEntryCacheWrapper", function($http, $q, pruneWrapper, sfxBaseOneEntryCacheWrapper) {
  var make_mutable = function(fcn) {
    return function(object, subobjects) {
      var current = fcn(object, subobjects);
      if (current.update) {
        return current;
      }

      current = sfxBaseOneEntryCacheWrapper(pruneWrapper(current));

      var ret = function(music) {
        var r;
        var wrapped = {};
        var lastCurrent = current;
        var proxy = function(name) {
          wrapped[name] = function() {
            if (lastCurrent != current) update();
            return r[name].apply(r, arguments);
          };
        };

        var update = function() {
            var newr = current(music);
            if (newr !== r && r && r.dispose) r.dispose();
            r = newr;
            lastCurrent = current;
            for (var k in r) proxy(k);
        };

        update();

        return wrapped;
      };

      var lastObjData;
      ret.update = function(newobject) {
        if (JSON.stringify(newobject) === lastObjData) return ret;
        lastObjData = JSON.stringify(newobject);
        current = sfxBaseOneEntryCacheWrapper(pruneWrapper(fcn(newobject, subobjects)));
        return ret;
      };

      return ret;
    };
  };


  var plugins = ["core"];
  var types = [];
  var m = function(pluginName) {
    return {
      type: function(typeName, options, constructor) {
        types.push({
          templateUrl: "site/plugin/" + pluginName + "/" + options.template + ".html",
          parameters: options.parameters,
          constructor: make_mutable(constructor),
          name: typeName,
          composition: options.composition,
          description: options.description
        })
      }
    };
  };

  var loadPlugin = function(pluginName) {
    return $http.get("site/plugin/" + pluginName + "/index.js")
      .then(function(result) {
        var runnerCode = result.data;
        var module = {export: function(){}};
        eval(runnerCode);

        module.export(m(pluginName));
      });
  };

  var pluginsLoaded = $q.all(plugins.map(loadPlugin));

  var getTypes = function(keyword) {
      var hasKeyword = function() {
        return true;
      };

      if (keyword) {
        keyword = keyword.toLowerCase();
        hasKeyword = function(x) {
          return x.name.toLowerCase().indexOf(keyword) !== -1;
        };
      }

      return pluginsLoaded.then(function() {
        return types.filter(hasKeyword);
      });
  };

  var getType = function(typeName, callback) {
    return pluginsLoaded
      .then(function() {
        var ret = types.filter(function(type) { return type.name === typeName; })[0]; 
        if (callback) callback(ret);
        return ret;
      });
  };

  return {
    getTypes: getTypes,
    getType: getType
  };

}]);

musicShowCaseApp.service("FileRepository", ["$http", "$q", "TypeService", function($http, $q, TypeService) {
  var exampleList = $http.get("exampleList.json");

  var createId = function() {
    var array = [];
    for (var i = 0; i < 32; i++) {
      var value = [0,1,2,3,4,5,6,7,8,9,'a','b','c','d','e','f'][Math.floor(Math.random()*16)];
      array.push(value);
    }

    return array.join("");
  };

  var createdFilesIndex = [];
  var createdFiles = {};

  var genericStateEmmiter = new EventEmitter();

  return {
    createFile: function() {
      genericStateEmmiter.emit("changed");

      var newid = createId();

      createdFilesIndex.push({"type": "instrument", "name": "New Instrument", "id": newid});
      createdFiles[newid] = {
        type: "stack",
        data: {
          array: []
        }
      };

      return $q.resolve(newid);
    },
    updateIndex: function(id, attributes) {
      var localFile =  createdFilesIndex.filter(function(x){ return x.id === id})[0];
      if (!localFile) return;

      localFile.name = attributes.name;
    },
    updateFile: function(id, contents) {
      var obj = JSON.parse(JSON.stringify(contents));

      if (obj && obj.data && obj.data.array) {
        obj.data.array.forEach(function(elem) {
          delete elem.$$hashKey; // TODO prevent this tmp variables on music object factory service
          delete elem.__cache;
          delete elem.last_type;
        });
      }

      createdFiles[id] = obj;

      return $q.resolve();
    },
    getFile: function(id) {

      var localFile = createdFilesIndex.filter(function(x){ return x.id === id})[0];
      if (localFile) {
        return $q.resolve({
          index: {name: localFile.name, id: localFile.id},
          contents: JSON.parse(JSON.stringify(createdFiles[id]))
        });
      };

      return exampleList
        .then(function(examples) {
          localFile = examples.data.filter(function(x){ return x.id === id})[0];
          var uri = localFile.uri;
          return $http.get(uri).then(function(r) {
            return {
              index:  {name: localFile.name, id: localFile.id},
              contents: {
                type: "stack",
                data: {
                  array: [{
                    type: "script",
                    data: {
                      code: r.data.replace(/\r\n/g, "\n")
                    }
                  }]
                }
              }
            };
          });
        });
    },

    search: function(keyword) {

      var hasKeyword = function() { return true };
      if (keyword && keyword.length > 0) {
        keyword = keyword.toLowerCase();
        hasKeyword = function(x) { return x.name.toLowerCase().indexOf(keyword) !== -1 };
      }

      var ee = new EventEmitter();
      var updateSearch = function() {
        $q.all([
          createdFilesIndex,
          exampleList,
          TypeService.getTypes(keyword)
        ]).then(function(result) {
          var res = result[0];
          res = res.concat(result[1].data);
          res = res.concat(result[2].map(convertType));
          res = res.filter(hasKeyword);

          ee.emit("changed", {
            results: res.slice(0,15),
            total: res.length
          });
        });
      };


      return {
        observe: function(cb) {
          ee.addListener("changed", cb);
          genericStateEmmiter.addListener("changed", updateSearch);
          updateSearch();

          return {
            close: function() {
              ee.removeListener("changed", cb);
              genericStateEmmiter.removeListener("changed", updateSearch);
            }
          };
        }
      };
    }
  };
}]);

var convertType = function(type) {
  return {
    type: "fx",
    name: type.name,
    id: "type"+ type.name
  };
};

musicShowCaseApp.factory("pruneWrapper", function() {
  return function(fcn) {
    if (!fcn._wrapper) {
      fcn._wrapper = function(music) {
        var sfxBase = music.sfxBase();
        var obj = fcn(sfxBase);
        obj.dispose = function() {
          sfxBase.prune();
        };
        return obj;
      };
    }
    return fcn._wrapper;
  };
});

musicShowCaseApp.factory("sfxBaseOneEntryCacheWrapper", function() {
    return function(fcn){
      var _lastmusic;
      var _lastinstance;
      var ret = function(music) {
        if (_lastmusic && _lastmusic === music) {
          return _lastinstance;
        }

        _lastmusic = music;
        _lastinstance = fcn(music);

        return _lastinstance;
      };

      ret.update = function(data) {
        fcn.update(data)
        return ret;
      };
      return ret;
    };
});
