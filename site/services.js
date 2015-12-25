var musicShowCaseApp = angular.module("MusicShowCaseApp", ['ui.codemirror', 'ngRoute', 'ui.bootstrap']);

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
              lastObj = constructor([pruneWrapper(lastObj)])
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

musicShowCaseApp.service("KeyboardFactory", function() {
  return {
    keyboard: function(instrument) {
      var notes = {};
      var keyCodeToNote = {
              90: 'C', 83: 'C#', 88: 'D',  68: 'D#', 67: 'E',
              86: 'F', 71: 'F#', 66: 'G', 72: 'G#', 78: 'A', 
              74: 'A#', 77: 'B'};

      return {
        name: "Keyboard",
        keyUp: function(keyCode) {
          var n = notes[keyCode];
          if (!n) return;
          notes[keyCode] = undefined;
          n.stop();
        },

        keyDown: function(keyCode) {
          var n = notes[keyCode];
          var noteName;
          if (n) return;

          noteName = keyCodeToNote[keyCode];
          
          // depends on music.js
          var note = instrument.note(MUSIC.noteToNoteNum(noteName)+36);
          if (note == undefined) return;
          notes[keyCode] = note.play();
        }
      };
    }
  };
});

musicShowCaseApp.service("TypeService", function($http, $q) {
  var make_mutable = function(fcn) {
    return function(object, subobjects) {
      var instances = [];

      var current = fcn(object, subobjects);
      if (ret.update) {
        debugger;
        return ret;
      }

      var ret = function(music) {
        var r = current(music);
        var wrapped = {
          note: function(n) {
            return r.note(n);
          },

          update: function(object) {
            r = current(music);
          }
        };

        instances.push(wrapped);
        return wrapped;
      };

      ret.update = function(newobject) {
        current = fcn(newobject, subobjects);
        instances.forEach(function(ins) {
          ins.update(object);
        });

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

  var getTypes = function() {
      return pluginsLoaded.then(function() {
        return types;
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

});

musicShowCaseApp.service("CodeRepository", function($http, $q) {
  return {
    getExample: function(uri) {
      return $http.get(uri).then(function(r) {
        return {
          type: "stack",
          data: {
            array: [{
              type: "script",
              data: {
                code: r.data
              }
            }]
          }
        };
      });
    },

    getExampleList: function() {
      return $http.get("exampleList.json").then(function(r) {
        return r.data;
      });
    }
  };
});

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
