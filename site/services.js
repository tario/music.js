var musicShowCaseApp = angular.module("MusicShowCaseApp");

musicShowCaseApp.factory("MusicObjectFactory", ["MusicContext", "$q", "TypeService", "pruneWrapper", function(MusicContext, $q, TypeService, pruneWrapper) {
  var fileOutputMap = new WeakMap();

  return function(options) {
    var nextId = 0;

    var _last_type = {};
    var ___cache = {};

    var monitor = options && options.monitor;

    var getConstructor = function(descriptor, channel) {
        return TypeService.getType(descriptor.type)
          .then(function(type) {
            if (type.monitor && !monitor) {
              return function(subobjects) {
                var wrapped = subobjects[0];
                return function(music) {
                  return wrapped(music);
                };
              };
            }

            var ret = function(subobjects) {
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

                  _last_type[channel] = _last_type[channel] || new WeakMap();
                  ___cache[channel] = ___cache[channel] || new WeakMap();
                  var last_type = _last_type[channel];
                  var __cache = ___cache[channel];

/*>                  if (!last_type.has(descriptor)||last_type.get(descriptor) === descriptor.type) {
                    if (subobjects.length === 1) {
                      if (__cache.has(descriptor) && __cache.get(descriptor)[subobjects[0].id]) {
                        return $q(function(resolve) {
                          resolve(__cache.get(descriptor)[subobjects[0].id]
                                .update(descriptor.data, components));
                        });
                      }
                    } else if (subobjects.length === 0) {
                      if (__cache.has(descriptor) && __cache.get(descriptor).noid) {
                        return $q(function(resolve) {
                          resolve(__cache.get(descriptor).noid
                                .update(descriptor.data, components));
                        });
                      }
                    }
                  }*/

                  last_type.set(descriptor, descriptor.type);

                  var ret = type.constructor(descriptor.data, subobjects, components);
                  nextId++;
                  ret.id = nextId;

                  if (subobjects.length === 1) {
                    if (!__cache.has(descriptor)) __cache.set(descriptor, {});
                    __cache.get(descriptor)[subobjects[0].id] = ret;
                  } else if (subobjects.length === 0) {
                    if (!__cache.has(descriptor)) __cache.set(descriptor, {});
                    __cache.get(descriptor).noid = ret;
                  }

                  return ret;

                })
            };

            ret.subobjects = type.subobjects;

            return ret;
          });
    };

    var createParametricFromStack = function(array, idx, channel) {
      if (array.length === 0) return $q.when(null);

      var descriptor = array[idx];
      channel = channel || 0;

      return getConstructor(descriptor, channel)
        .then(function(constructor) {
          if (constructor.subobjects) {
            var getObject = function(d, index) {
              var newArray = d.data.array.concat(array.slice(idx+1));
              return createParametricFromStack(newArray, 0, channel*16 + index);
            };

            return $q.all(descriptor.data.subobjects.map(getObject))
              .then(function(objs) {
                return constructor(objs);
              });
          }

          if (array.length === 1) {
            return constructor([]);
          }

          return createParametricFromStack(array.slice(idx+1), 0, channel)
            .then(function(obj) {
              return constructor([obj]);
            });
        })
        .then(function(obj) {
          if (obj && obj.dataLink) {
            obj.dataLink(notifyChangeFor(descriptor));
          }
          return obj;
        });
    };

    var notifyChangeFor = function(descriptor) {
      return function(output) {
        if (fileOutputMap.has(descriptor)) {
          var ee = fileOutputMap.get(descriptor);
          ee.emit('changed', output);
        }
      };
    };

    var createParametric = function(descriptor) {
      if (descriptor.type === "stack") {
        return createParametricFromStack(descriptor.data.array, 0)
      } else {
        return getConstructor(descriptor, 0)
          .then(function(constructor) {
            return constructor([]); 
          });
      }
    };

    var destroyAll = function(obj) {
      for (var channel in _last_type) {
        _last_type[channel] = new WeakMap();
      }
      for (var channel in ___cache) {
        ___cache[channel] = new WeakMap(); 
      }

      bases.forEach(function(base) {
        base.prune();
      });

      bases = [];

      return $q.when(null);
    };

    var bases = [];
    var create = function(descriptor, music) {
      return createParametric(descriptor)
        .then(function(fcn) {
          if (!fcn) return;

          if (music) {
            var base= music.sfxBase();
            bases.push(base);
            return fcn(base);
          }
          return MusicContext.runFcn(function(music) {
            var base = music.sfxBase();
            bases.push(base);
            return fcn(base);
          });
        });
    };

    var observeOutput = function(file, listener) {
      var ee;

      if (fileOutputMap.has(file)) {
        ee = fileOutputMap.get(file);
      } else {
        ee = new EventEmitter();
        fileOutputMap.set(file, ee)
      }

      ee.on('changed', listener);

      return {
        destroy: function() {
          ee.removeListener('changed', listener);
        }
      }
    };

    return {
      create: create,
      destroyAll: destroyAll,
      observeOutput: observeOutput
    };
  };
}]);

musicShowCaseApp.service("MusicContext", function() {
  var music;
  var context;

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
      if (!music) {
        context = new MUSIC.Context();
        music = context.sfxBase(); 
      }
      return f(music);
    },

    record: function(options, callback) {
      return this.runFcn(function(){
        return context.record(options, callback);
      });
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

musicShowCaseApp.service("Pattern", ["MUSIC", 'TICKS_PER_BEAT', function(MUSIC, TICKS_PER_BEAT) {

  var schedule = function(noteseq, file, track, eventPreprocessor, onStop, ctx) {
    var events = track.events.sort(function(e1, e2) { return e1.s - e2.s; });
    var scale = 60000 / file.bpm / TICKS_PER_BEAT;

    for (var i=0; i<events.length; i++) {
      var evt = track.events[i];
      noteseq.push(eventPreprocessor([evt.n, evt.s * scale, evt.l * scale]), ctx);
    }

    noteseq.paddingTo(TICKS_PER_BEAT * file.measureCount * file.measure * scale);
    noteseq.pushCallback([TICKS_PER_BEAT*file.measureCount * file.measure * scale, onStop]);
  };

  var noteseq = function(file, track, eventPreprocessor, onStop) {
    var noteseq = new MUSIC.NoteSequence();
    schedule(noteseq, file, track, eventPreprocessor, onStop);
    return noteseq;
  };

  var patternCompose = function(file, instruments, base, onStop) {
    var noteseq = new MUSIC.NoteSequence();
    var mutedState = getMutedState(file);

    file.tracks.forEach(function(track, idx) {
      idx = base + idx;
      if (mutedState[idx]) return null;

      var instrument = instruments[track.instrument + '_' + idx];
      var eventPreprocessor = instrument.eventPreprocessor || function(x){ return x; };
      
      var context = MUSIC.NoteSequence.context(instrument);
      schedule(noteseq, file, track, eventPreprocessor, onStop, context);
    });

    var ret = noteseq.makePlayable(null);
    ret.schedule = function(noteSequence) {
      var contexts = [];

      file.tracks.forEach(function(track, idx) {
        idx = base + idx;
        if (mutedState[idx]) return null;

        var instrument = instruments[track.instrument + '_' + idx];
        var eventPreprocessor = instrument.eventPreprocessor || function(x){ return x; };
        var context = MUSIC.NoteSequence.context(instrument)

        contexts.push(context);
        schedule(noteSequence, file, track, eventPreprocessor, onStop, context);
      });

      return contexts;
    };

    return ret;
  };

  var higher = function(a,b) {
    return a>b ? a : b;
  };

  var computeMeasureCount = function(file, measure) {
    if (measure<1) measure=1;
    var endTime = file.tracks.map(function(track) {
      return track.events.map(function(evt) {
        return evt.s + evt.l;
      }).reduce(higher, 0)
    }).reduce(higher,0);

    var measureLength = measure * TICKS_PER_BEAT;
    var measureCount = Math.floor((endTime-1)/measureLength) + 1;
    if (measureCount<1) return 1;
    return measureCount;
  };

  var getMutedState = function(file) {
    var someSolo = file.tracks.some(function(t) {return t.solo; });
    return file.tracks.map(function(t) {
      if (someSolo) {
        return t.muted || !t.solo;
      } else {
        return t.muted || !t.instrument;
      }
    });
  };

  var findClipS = function(track, self, s) {
    var nearest = function(c1, c2) {
      return Math.abs(self.s - c1) < Math.abs(self.s - c2) ? c1 : c2;
    };

    var allEvents = track.events.filter(function(evt) {
      return evt !== self;
    });

    if (allEvents.length === 0) return 0;

    var clips = allEvents.map(function(evt) {
      return evt.s + evt.l;
    }).concat(allEvents.map(function(evt) {
      return evt.s - self.l;
    }));

    return clips.reduce(nearest);
  };       

  var findClipL = function(track, self, s) {
    var nearest = function(c1, c2) {
      return Math.abs(self.s + self.l - c1) < Math.abs(self.s + self.l - c2) ? c1 : c2;
    };

    var allEvents = track.events.filter(function(evt) {
      return evt !== self;
    });

    if (allEvents.length === 0) return 0;
    var clips = allEvents.map(function(evt) {
      return evt.s;
    });

    return clips.reduce(nearest) - self.s;
  }; 


  return {
    noteseq: noteseq,
    patternCompose: patternCompose,
    computeMeasureCount: computeMeasureCount,
    getMutedState: getMutedState,
    findClipL: findClipL,
    findClipS: findClipS
  };
}]);


musicShowCaseApp.service("InstrumentSet", ["FileRepository", "MusicObjectFactory", function(FileRepository, MusicObjectFactory) {
  return function(music) {

    var musicObjectFactory;

    var set = {};
    var created = [];
    var load = function(id, trackNo) {
      trackNo = trackNo || 0;
      var _id = id + "_" + trackNo;
      if (!set[_id]) {
        set[_id] = FileRepository.getFile(id)
          .then(function(file) {
            if (!musicObjectFactory) musicObjectFactory = MusicObjectFactory();
            return musicObjectFactory.create(file.contents, music);
          })
          .then(function(obj){
            created.push(obj);
            return obj;
          });
      } 

      return set[_id];
    };

    var dispose = function() {
      created.forEach(function(instrument){
        if (instrument.dispose) {
          instrument.dispose();
        }
      });

      if (musicObjectFactory) {
        return musicObjectFactory.destroyAll();
      }
    };

    return {
      load: load,
      all: set,
      dispose: dispose
    };
  };
}]);

musicShowCaseApp.service("FileRepository", ["$http", "$q", "TypeService", "Historial", "Index", "_localforage", function($http, $q, TypeService, Historial, Index, localforage) {
  var createdFilesIndex = [];
  var createdFiles = {};

  var builtIns = [
    "site/builtin/defaultProject.json",
    "site/builtin/samples.json",
    "site/builtin/smb-underworld.json",
    "site/builtin/smb-overworld.json"
  ];

  var loadBuiltIn = function(uri) {
    return $http.get(uri)
      .then(function(r) {
        r.data.forEach(function(obj) {
          var objectId = obj.id;

          createdFiles[objectId] = obj.contents;

          createdFilesIndex.push({
            project: obj.project,
            type: obj.type,
            name: obj.name,
            id: objectId,
            ref: obj.ref,
            builtIn: true
          });
        });
      });
  };
  var builtInLoaded = $q.all(builtIns.map(loadBuiltIn));

  var createId = function() {
    var array = [];
    for (var i = 0; i < 32; i++) {
      var value = [0,1,2,3,4,5,6,7,8,9,'a','b','c','d','e','f'][Math.floor(Math.random()*16)];
      array.push(value);
    }

    return array.join("");
  };

  var genericStateEmmiter = new EventEmitter();
  var recycledEmmiter = new EventEmitter();

  var defaultFile = {
    instrument: {
      type: "stack",
      data: {
        array: []
      }
    },
    song: {
      measure: 4,
      bpm: 140,
      tracks: [
        {blocks: [{},{},{}]},
        {blocks: [{},{},{}]}
      ]
    },
    pattern: {
      measure: 4,
      measureCount: 1,
      bpm: 140,
      selectedTrack: 0,
      tracks:[
        {scroll: 1000, events: []}
      ],
      scrollLeft: 0
    }
  };

  var hist = new WeakMap();

  var updateFile = function(id, contents, options) {
    return $q.when()
      .then(function() {
        var localFile = createdFilesIndex.filter(function(x) {return x.id === id; })[0];
        if (localFile) return localFile;

        return storageIndex.getEntry(id);
      })
      .then(function(localFile) {
        if (localFile) {
          var serialized = MUSIC.Formats.MultiSerializer.serialize(localFile.type, contents);

          if (!options || !options.noHistory) {
            hist[id] = hist[id] || Historial();
            hist[id].registerVersion(JSON.stringify(contents));
          }

          return localforage.setItem(id, serialized);
        }
      })
      .then(function() {
        return recycleIndex.reload();
      })
      .then(function() {
        recycledEmmiter.emit("changed");
      });
  };

  var destroyFile = function(id) {
    return localforage.removeItem(id)
      .then(function() {
        return $q.all({r: recycleIndex.removeEntry(id), l: storageIndex.removeEntry(id)});
      })
  };

  var purgeFromRecycleBin = function(id) {
    return recycleIndex.removeEntry(id);
  };

  var restoreFromRecycleBin = function(id) {
    return _restoreFromRecycleBin(id)
      .then(function() {
        genericStateEmmiter.emit("changed");
        recycledEmmiter.emit("changed");
      });
  };

  var _restoreFromRecycleBin = function(id) {
    return recycleIndex.getEntry(id)
      .then(function(localFile) {
        if (localFile) {
          return recycleIndex.removeEntry(id)
            .then(function() {
              return storageIndex.createEntry(localFile);
            })
            .then(function() {
              var refs = (localFile.ref||[])
              if (localFile.project) refs.push(localFile.project);

              return $q.all(refs.map(_restoreFromRecycleBin));
            });
        }
      });
  };

  var moveToRecycleBin = function(id) {
    return _moveToRecycleBin(id)
      .then(function() {
        genericStateEmmiter.emit("changed");
        recycledEmmiter.emit("changed");
      })
  };

  var _moveToRecycleBin = function(id) {
    var getId = function(x){ return x.id; };
    return storageIndex.willRemove(id)
      .then(function() {
        return storageIndex.getEntry(id)
          .then(function(localFile) {
            if (localFile) {
              return recycleIndex.getAll()
                .then(function(idx) {
                  if (idx && idx.length >= 100) {
                    return recycleIndex.getFreeItems()
                      .then(function(idx) {
                        if (!idx[0]) return;

                        return recycleIndex.removeEntry(idx[0].id)
                          .then(function() {
                            return localforage.removeItem(id);
                          });
                      });
                  }
                })
                .then(function() {
                  return storageIndex.removeEntry(id);
                })
                .then(function() {
                  return recycleIndex.createEntry(localFile);
                });
            }
          });
      })
      .then(function() {
        return storageIndex.getOrphan(createdFilesIndex.map(getId));
      })
      .then(function(orphanFiles) {
        return $q.all(orphanFiles.map(getId).map(_moveToRecycleBin));
      });
  };

  var createFile = function(options) {
    var newid = options.id || createId();

    var contents = options.contents || defaultFile[options.type] || {};

    hist[newid] = hist[newid] || Historial();
    hist[newid].registerVersion(JSON.stringify(contents));

    var serialized = MUSIC.Formats.MultiSerializer.serialize(options.type, contents);
    return localforage.setItem(newid, serialized)
      .then(function() {
        return storageIndex.createEntry({
          type: options.type,
          name: options.name,
          project: options.project,
          id: newid,
          ref: options.ref
        });
      })
      .then(function() {
        return recycleIndex.reload();
      })
      .then(function() {
        genericStateEmmiter.emit("changed");
        recycledEmmiter.emit("changed");
        return newid;
      });
  };


  var s0 = MUSIC.Formats.JSONSerializer;
  var s1 = MUSIC.Formats.CachedSerializer(MUSIC.Formats.PackedJSONSerializer);
  var s2 = MUSIC.Formats.HuffmanSerializerWrapper(s0);
  var s3 = MUSIC.Formats.HuffmanSerializerWrapper(s1);
  var s4 = MUSIC.Formats.CachedSerializer(MUSIC.Formats.PackedJSONSerializerB);
  var s5 = MUSIC.Formats.HuffmanSerializerWrapper(s4);

  MUSIC.Formats.MultiSerializer.setSerializers([
    {serializer: s0, base: '0'},
    {serializer: s1, base: '1'},
    {serializer: s2, base: '2'},
    {serializer: s3, base: '3'},
    {serializer: s4, base: '4'},
    {serializer: s5, base: '5'}
  ]);

  var storageIndex = Index("index");
  var recycleIndex = Index("recycle");

  recycleIndex.getAll().then(function() {
    recycledEmmiter.emit("changed");
  });

  var changed = function() {
    genericStateEmmiter.emit("changed");
    recycledEmmiter.emit("changed");
  };

  var getRefs = function(type, contents) {
    var ref = [];
    if (type === 'song') {
      contents.tracks.forEach(function(track) {
        for (var i=0;i<track.blocks.length;i++) {
          var blockId = track.blocks[i].id;
          if (blockId && ref.indexOf(blockId) === -1) ref.push(blockId);
        }
      });
    } else if (type === 'pattern') {
      contents.tracks.forEach(function(track) {
        if (track.instrument && ref.indexOf(track.instrument) === -1) ref.push(track.instrument);
      });
    }

    return ref;
  };

  var getProjectFiles = function(projectId) {
    return storageIndex.getAll()
      .then(function(idx) {
        return idx.concat(createdFilesIndex).filter(function(file) {
          return file.project === projectId || file.id === projectId;
        });
      });
  };

  return {
    getRefs: getRefs,
    getProjectFiles: getProjectFiles,
    undo: function(id) {
      var oldVer = hist[id].undo();
      if (!oldVer) return;

      return updateFile(id, JSON.parse(oldVer), {noHistory: true});
    },
    redo: function(id) {
      var nextVer = hist[id].redo();
      if (!nextVer) return;

      return updateFile(id, JSON.parse(nextVer), {noHistory: true});
    },
    purgeFromRecycleBin: purgeFromRecycleBin,
    moveToRecycleBin: moveToRecycleBin,
    restoreFromRecycleBin: restoreFromRecycleBin,
    destroyFile: destroyFile,
    createFile: createFile,
    changed: changed,
    updateIndex: function(id, attributes) {
      var localFile = createdFilesIndex.filter(function(x) { return x.id === id; })[0];
      if (localFile) {
        localFile.name = attributes.name;
        genericStateEmmiter.emit("changed");
        return $q.when(localFile);
      }

      return storageIndex.updateEntry(id, attributes)
        .then(function() {
          genericStateEmmiter.emit("changed");
        });
    },
    getIndex: function(id) {
      var localFile = createdFilesIndex.filter(function(x) { return x.id === id; })[0];
      if (localFile) return $q.when(localFile);

      return storageIndex.getEntry(id);
    },
    updateFile: updateFile,
    getFile: function(id) {
      var builtIn = false;
      var changed = false;
      return builtInLoaded
        .then(function() {
          var localFile = createdFilesIndex.filter(function(x) {return x.id === id; })[0];
          if (localFile) {
            builtIn = true;
            return localFile;
          }

          return storageIndex.getEntry(id);
        })
        .then(function(localFile) {
          return localforage.getItem(id)
            .then(function(serialized) {
              if (serialized) {
                var contents = MUSIC.Formats.MultiSerializer.deserialize(localFile.type, serialized);
                return {
                  index: {
                    name: localFile.name,
                    id: localFile.id,
                    builtIn: builtIn,
                    type: localFile.type,
                    ref: localFile.ref||getRefs(localFile.type, contents),
                    updated: true,
                    project: localFile.project
                  },
                  contents: contents
                };
              } else {
                if (localFile) {
                  return {
                    index: {
                      name: localFile.name,
                      id: localFile.id,
                      builtIn: builtIn,
                      type: localFile.type,
                      ref: localFile.ref,
                      project: localFile.project
                    },
                    contents: JSON.parse(JSON.stringify(createdFiles[id]))
                  };
                };
              }
            });
        });
    },
    observeRecycled: function(callback) {
      recycleIndex.reload()
        .then(function() {
          recycledEmmiter.emit("changed");
        });

      recycledEmmiter.addListener("changed", callback);

      return {
        destroy: function() {
          recycledEmmiter.removeListener("changed", callback);
        }
      };
    },
    searchRecycled: function(keyword, options) {
      options = options || {};
      var limit = typeof options.limit === 'undefined' ? 10 : options.limit;
      var hasKeyword = function() { return true };
      if (keyword && keyword.length > 0) {
        keyword = keyword.toLowerCase();
        hasKeyword = function(x) { return x.name.toLowerCase().indexOf(keyword) !== -1 };
      }

      return recycleIndex.getAll().then(function(index) {
        var filtered = (index||[]).filter(hasKeyword).reverse();
        return {
          results: limit ? filtered.slice(0,limit) : filtered,
          total: filtered.length
        };
      });
    },
    search: function(keyword, options) {
      options = options || {};

      var hasKeyword = function() { return true };
      if (keyword && keyword.length > 0) {
        keyword = keyword.toLowerCase();
        hasKeyword = function(x) { return x.name.toLowerCase().indexOf(keyword) !== -1 };
      }

      var byProject = function() { return true };
      if (options.project) {
        byProject = function(x) {
          if (options.type) {
            if (options.type.indexOf(x.type) === -1) return false;
          }
          return options.project.indexOf(x.project) !== -1;
        };
      } else {
        if (options.type) {
          byProject = function(x) {
            if (options.type.indexOf(x.type) === -1) return false;
            return true
          };
        }
      }

      var ee = new EventEmitter();
      var updateSearch = function() {
        builtInLoaded
          .then(function() {
            $q.all([
              storageIndex.getAll(),
              createdFilesIndex,
              TypeService.getTypes(keyword)
            ]).then(function(result) {
              var notInRes = function(item) {
                return true;
//                return ids.indexOf(item.id) === -1;
              };

              var res = result[0]||[];
              var ids = res.map(function(x){ return x.id; });
              if (result[1]) res = res.concat(result[1].filter(notInRes));
              res = res.concat(result[2].map(convertType));
              res = res.filter(hasKeyword).filter(byProject);

              ee.emit("changed", {
                results: res.slice(0,15),
                total: res.length
              });
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
    id: "type"+ type.name,
    project: 'core'
  };
};

musicShowCaseApp.factory("pruneWrapper", function() {
  return function(fcn) {
    if (!fcn._wrapper) {
      fcn._wrapper = function(music, modWrapper) {
        var sfxBase = music.sfxBase();
        var obj = fcn(sfxBase, modWrapper);
        var originalDispose;

        if (obj.dispose) {
          originalDispose = obj.dispose.bind(obj); 
          obj.dispose = function() {
            originalDispose();
            sfxBase.prune();
          };
        } else {
          obj.dispose = function() {
            sfxBase.prune();
          };
        }

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
