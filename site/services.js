var musicShowCaseApp = angular.module("MusicShowCaseApp");

musicShowCaseApp.factory("MusicObjectFactory", ["MusicContext", "$q", "TypeService", "pruneWrapper", "sfxBaseOneEntryCacheWrapper", function(MusicContext, $q, TypeService, pruneWrapper, sfxBaseOneEntryCacheWrapper) {
  var nextId = 0;
  var getConstructor = function(descriptor) {
      return TypeService.getType(descriptor.type)
        .then(function(type) {
          return function(subobjects) {
            var buildComponents = [];

            if (type.components) {
              type.components.forEach(function(componentName) {
                var value = descriptor.data.modulation[componentName];
                if (!value) return;
                if (!value.data) return;
                if (!value.data.array) return;
                if (value.data.array.length === 0) return;

                buildComponents.push(
                  createParametric(value)
                    .then(function(obj) {
                      return {
                        name: componentName,
                        obj: obj
                      };
                    })
                );

              });
            }

            return $q.all(buildComponents)
              .then(function(objs) {

                var components = {};
                objs.forEach(function(obj) {
                  components[obj.name] = obj.obj;
                });

                if (!descriptor.last_type||descriptor.last_type === descriptor.type) {
                  if (subobjects.length === 1) {
                    if (descriptor.__cache && descriptor.__cache[subobjects[0].id]) {
                      return $q(function(resolve) {
                        resolve(descriptor.__cache[subobjects[0].id]
                              .update(descriptor.data, components));
                      });
                    }
                  } else if (subobjects.length === 0) {
                    if (descriptor.__cache && descriptor.__cache.noid) {
                      return $q(function(resolve) {
                        resolve(descriptor.__cache.noid
                              .update(descriptor.data, components));
                      });
                    }
                  }
                }

                descriptor.last_type = descriptor.type;


                var ret = sfxBaseOneEntryCacheWrapper(type.constructor(descriptor.data, subobjects, components));
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

              })
          };
        });
  };

  var createParametric = function(descriptor) {
    if (descriptor.type === "stack") {
      return $q.all(descriptor.data.array.map(getConstructor))
        .then(function(constuctors) {

          if (constuctors.length === 0) {
            return null;
          }

          var proms;
          constuctors.reverse().forEach(function(constructor) {
            if (proms) {
              proms = proms.then(function(lastObj) {
                return constructor([lastObj]);
              });
            } else {
              proms = constructor([]);
            }
          });

          return proms;
        })
    } else {
      return getConstructor(descriptor)
        .then(function(constructor) {
          return constructor([]); 
        });
    }
  };

  var create = function(descriptor) {
    return createParametric(descriptor)
      .then(function(fcn) {
        if (!fcn) return;

        return MusicContext.runFcn(function(music) {
          return fcn(music);
        });
      });
/*


    if (descriptor.type === "stack") {
      return $q.all(descriptor.data.array.map(getConstructor))
        .then(function(constuctors) {

          if (constuctors.length === 0) return null;

          var proms;
          constuctors.reverse().forEach(function(constructor) {
            if (proms) {
              proms = proms.then(function(lastObj) {
                return constructor([lastObj]);
              });
            } else {
              proms = constructor([]);
            }
          });

          return proms.then(function(lastObj) {
            return MusicContext.runFcn(function(music) {
              return lastObj(music);
            });
          });
        })
    } else {
      return getConstructor(descriptor)
        .then(function(constructor) {
          return constructor([]); 
        });
    }*/
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
    return function(object, subobjects, components) {
      var current = fcn(object, subobjects, components);
      if (current.update) {
        return current;
      }

      current = sfxBaseOneEntryCacheWrapper(pruneWrapper(current));

      var ret = function(music, options) {
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
            var newr = current(music, options);
            if (newr !== r && r && r.dispose) r.dispose();
            r = newr;
            lastCurrent = current;
            for (var k in r) proxy(k);
        };

        update();

        return wrapped;
      };

      var lastObjData;
      ret.update = function(newobject, _components) {
        components = _components
        if (JSON.stringify(newobject) === lastObjData) return ret;
        lastObjData = JSON.stringify(newobject);
        current = sfxBaseOneEntryCacheWrapper(pruneWrapper(fcn(newobject, subobjects, components)));
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
          components: options.components,
          description: options.description,
          _default: options._default
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

musicShowCaseApp.service("Historial", [function() {
  return function() {
    var array = [];
    var currentVersion = 0;

    var undo = function() {
      if (currentVersion > 0) currentVersion--;
      return array[currentVersion];
    };

    var redo = function() {
      if (currentVersion < array.length-1) currentVersion++;
      return array[currentVersion];
    };

    var registerVersion = function(data) {
      array = array.slice(0, currentVersion+1);
      array.push(data);
      if (array.length > 128) array = array.slice(1);
      currentVersion = array.length-1;
    };

    return {
      registerVersion: registerVersion,
      undo: undo,
      redo: redo
    };
  };
}]);

musicShowCaseApp.service("Pattern", ["MUSIC", function(MUSIC) {
  var noteseq = function(file, track, onStop) {
    var noteseq = new MUSIC.NoteSequence();
    var events = track.events.sort(function(e1, e2) { return e1.s - e2.s; });
    var scale = 600 / file.bpm;

    for (var i=0; i<events.length; i++) {
      var evt = track.events[i];
      noteseq.push([evt.n, evt.s * scale, evt.l * scale]);
    }

    noteseq.paddingTo(100 * file.measureCount * file.measure * scale);
    noteseq.pushCallback([100*file.measureCount * file.measure * scale, onStop]);

    return noteseq;
  };

  return {
    noteseq: noteseq
  };
}]);


musicShowCaseApp.service("InstrumentSet", ["FileRepository", "MusicObjectFactory", function(FileRepository, MusicObjectFactory) {
  return function() {
    var set = {};
    var load = function(id) {
      if (!set[id]) {
        set[id] = FileRepository.getFile(id)
          .then(function(file) {
            return MusicObjectFactory(file.contents);
          });
      } 

      return set[id];
    };
    return {
      load: load
    };
  };
}]);

musicShowCaseApp.service("FileRepository", ["$http", "$q", "TypeService", "Historial", function($http, $q, TypeService, Historial) {
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

  var defaultFile = {
    instrument: {
      type: "stack",
      data: {
        array: []
      }
    },
    song: {
      measure: 8,
      bpm: 100,
      tracks: [
        {blocks: [{},{},{}]},
        {blocks: [{},{},{}]}
      ]
    },
    pattern: {
      measure: 8,
      measureCount: 1,
      bpm: 100
    }
  };

  var hist = new WeakMap();

  return {
    undo: function(id) {
      var oldVer = hist[id].undo();
      if (!oldVer) return;

      createdFiles[id] = JSON.parse(oldVer);
    },
    redo: function(id) {
      var nextVer = hist[id].redo();
      if (!nextVer) return;

      createdFiles[id] = JSON.parse(nextVer);
    },
    createFile: function(options) {
      genericStateEmmiter.emit("changed");

      var newid = createId();

      createdFilesIndex.push({"type": options.type, "name": options.name, "id": newid});
      createdFiles[newid] = defaultFile[options.type] ||{};

      hist[newid] = Historial();
      hist[newid].registerVersion(JSON.stringify(createdFiles[newid]));

      return $q.resolve(newid);
    },
    updateIndex: function(id, attributes) {
      var localFile =  createdFilesIndex.filter(function(x){ return x.id === id})[0];
      if (!localFile) return;

      localFile.name = attributes.name;
    },
    getIndex: function(id) {
      return $q.resolve(createdFilesIndex.filter(function(x){ return x.id === id})[0]);
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
      hist[id].registerVersion(JSON.stringify(obj));

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
      fcn._wrapper = function(music, modWrapper) {
        var sfxBase = music.sfxBase();
        var obj = fcn(sfxBase, modWrapper);
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
      var ret = function(music, options) {
        options = options ||{};

        if (!options.nowrap) {
          if (_lastmusic && _lastmusic === music) {
            return _lastinstance;
          }
        }

        _lastmusic = music;
        _lastinstance = fcn(music, options);

        return _lastinstance;
      };

      ret.update = function() {
        fcn.update.bind(fcn).apply(null, arguments);
        return ret;
      };
      return ret;
    };
});
