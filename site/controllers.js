var musicShowCaseApp = angular.module("MusicShowCaseApp");

musicShowCaseApp.filter("instrument_name", function() {
  return function(instrumentId, instrumentMap) {
    return instrumentMap[instrumentId] && instrumentMap[instrumentId] ? instrumentMap[instrumentId].name : instrumentId;
  };
});

musicShowCaseApp.filter("block_name", function() {
  return function(block, indexMap) {
    return indexMap[block.id] && indexMap[block.id].index ? indexMap[block.id].index.name : block.id;
  };
});

musicShowCaseApp.filter("block_length", ["Pattern", function(Pattern) {
  return function(block, indexMap, measure) {
    if (!block.id) return 1;
    if (!indexMap[block.id]) return 1;
    if (!indexMap[block.id].contents) return 1;

    return Pattern.computeMeasureCount(indexMap[block.id].contents, measure);
  };
}]);

musicShowCaseApp.controller("recordOptionsCtrl", ["$scope", "$uibModalInstance", "Recipe", function($scope, $uibModalInstance, Recipe) {
  $scope.numChannels = 2;
  $scope.encoding = "wav";
  $scope.recipe = Recipe.start;

  $scope.cancel = function() {
    $uibModalInstance.dismiss();
  };

  $scope.start = function() {
    $scope.recipe.raise("song_rec_confirm");

    $uibModalInstance.close({
      encoding: $scope.encoding,
      numChannels: $scope.numChannels
    });
  };
}]);

musicShowCaseApp.controller("DashboardController", ["$scope", function($scope) {
  $scope.$emit('switchProject', "default");
}]);

musicShowCaseApp.controller("ProjectDashboardController", ["$scope", "$routeParams", function($scope, $routeParams) {
  $scope.$emit('switchProject', $routeParams.project);
}]);

musicShowCaseApp.controller("SongEditorController", ["$scope", "$uibModal", "$q", "$timeout", "$routeParams", "$http", "MusicContext", "FileRepository", "InstrumentSet", "Pattern", "Export", "TICKS_PER_BEAT", "SONG_MAX_TRACKS", 
    function($scope, $uibModal, $q, $timeout, $routeParams, $http, MusicContext, FileRepository, InstrumentSet, Pattern, Export, TICKS_PER_BEAT, SONG_MAX_TRACKS) {

  $scope.indexMap = {};
  var id = $routeParams.id;
  var instSet = InstrumentSet();

  $scope.$emit('switchProject', $routeParams.project);

  $scope.exportItem = function() {
    Export.exportFile($scope.fileIndex.name, $scope.fileIndex.id);
  };

  $scope.removeItem = function() {
    if ($scope.fileIndex.builtIn) {
      $scope.file = null;
      $scope.fileIndex = null;
      FileRepository.destroyFile(id)
        .then(function() {
          reloadFromRepo();
        });
      return;
    }

    FileRepository.moveToRecycleBin(id)
      .then(function() {
        document.location = "#/editor/" + $routeParams.project;
      });
  };

  $scope.remove = function(block) {
    delete block.id;
    checkPayload();
    $scope.fileChanged();
  };

  $scope.currentRec = null;

  $scope.record = function() {
    $scope.stop();

    var modalIns = $uibModal.open({
      templateUrl: "site/templates/modal/recordOptions.html",
      controller: "recordOptionsCtrl"
    });

    modalIns.result.then(function(encodingOptions) {
      $scope.currentRec = MusicContext.record({
        encoding: encodingOptions.encoding, 
        numChannels: encodingOptions.numChannels
      }, function(blob) {
        var a = document.createElement("a");
        document.body.appendChild(a);
        a.style = "display: none";

        var url  = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = $scope.fileIndex.name + "." + encodingOptions.encoding;
        a.click();
        window.URL.revokeObjectURL(url);

        $scope.recipe.raise('song_rec_stop');
      });

      $scope.play();
    });
  };

  $scope.stop = function() {
    $scope.$broadcast("stopClock");
    $scope.$broadcast("resetClock");

    if (playing) playing.stop();
    $scope.recipe.raise("song_play_stopped");
    playing = null;
  };

  var playing = null;

  $scope.play = function() {
    $scope.stop();
    $q.all(instSet.all)
      .then(function(instruments){
        var patterns = {};

        var createPattern = function(id, songTrackIdx) {
          if (!id) return null;
          if (patterns[id]) return patterns[id];

          var pattern = $scope.indexMap[id].contents;
          var changedBpm = Object.create(pattern);
          changedBpm.bpm = $scope.file.bpm;

          patterns[id] = Pattern.patternCompose(changedBpm, instruments, songTrackIdx*SONG_MAX_TRACKS, function() {});

          return patterns[id];
        };        

        var scale = 60000 / $scope.file.bpm / TICKS_PER_BEAT;
        var measure = TICKS_PER_BEAT * $scope.file.measure * scale;
        var song = new MUSIC.Song(
          $scope.file.tracks.map(function(track, songTrackIdx) {
            return track.blocks.map(function(block) {
              return createPattern(block.id, songTrackIdx);
            });
          })
        , {measure: measure});

        $scope.$broadcast("startClock", window.performance.now());
        playing = song.play({
          onStop: function() {
            $scope.$broadcast("stopClock");
            $scope.$broadcast("resetClock");

            $scope.recipe.raise("song_play_stopped");
            playing = null;
            if ($scope.currentRec) $scope.currentRec.stop();
            $scope.currentRec = null;
            $timeout(function() {});
          }
        });

      });


  };

  $scope.patternPlay = function(block, songTrackIdx) {
    var pattern = $scope.indexMap[block.id].contents;
    var doNothing = function() {};

    pattern.tracks.forEach(function(track, idx) {
      instSet.load(track.instrument, songTrackIdx*SONG_MAX_TRACKS + idx);
    });

    block.playing = true;
    var playDone = function() {
      $timeout(function() {
        block.playing = false;
      });
    };

    $q.all(instSet.all)
      .then(function(instruments) {
        $scope.stop();

        var changedBpm = Object.create(pattern);
        changedBpm.bpm = $scope.file.bpm;

        playing = Pattern.patternCompose(changedBpm, instruments, songTrackIdx*SONG_MAX_TRACKS, function() {
          playing = null;
          playDone();
        }).play();

        var stop = playing.stop.bind(playing);
        playing.stop = function() {
          playDone();
          stop();
        };
      });
  };

  $scope.indexChanged = function() {
    $scope.fileIndex.ref = FileRepository.getRefs("song", $scope.file);
    FileRepository.updateIndex(id, $scope.fileIndex);
  };

  $scope.fileChanged = fn.debounce(function() {
    FileRepository.updateFile(id, $scope.file)
      .then(function() {
        $scope.indexChanged();
      });
  },100);

  var checkPayload = function() {
    var maxblocks = 0;
    var maxTrackIndex = 0;

    if (!$scope.file) return;
    if (!$scope.file.tracks) return;

    $scope.file.tracks.forEach(function(track, trackIndex) {
      for (var i=0;i<track.blocks.length;i++) {
        if (track.blocks[i].id){
          var mCount = Pattern.computeMeasureCount($scope.indexMap[track.blocks[i].id].contents, $scope.file.measure);
          if (i+mCount>maxblocks) maxblocks=i+mCount;
          if (trackIndex > maxTrackIndex) maxTrackIndex = trackIndex;
        }
      }
    });

    if ($scope.file.tracks.length < maxTrackIndex+2 && $scope.file.tracks.length < SONG_MAX_TRACKS) {
      $scope.file.tracks.push({
        blocks: $scope.file.tracks[0].blocks.map(function() {return {};})
      });
    } else {
      $scope.file.tracks = $scope.file.tracks.slice(0,maxTrackIndex+2);
    }

    var target = maxblocks + 1;
    $scope.file.tracks.forEach(function(track) {
      if (target > track.blocks.length) {
        var payload = target-track.blocks.length;
        for (var i=0;i<payload;i++) {
          track.blocks.push({});
        }
      } else {
        track.blocks = track.blocks.slice(0, target);
      }
    });
    $scope.fileChanged();
  };
  $scope.$watch("file.measure", checkPayload);

  $scope.onDropComplete = function($data,$event,block,songTrackIdx) {
    if ($data.fromBlock) {

      var swapId = block.id;
      block.id = $data.fromBlock.id;
      $data.fromBlock.id = swapId;

      checkPayload();
      return;
    }
    if ($data.type !== 'pattern') return;

    block.id = $data.id;
    FileRepository.getFile($data.id)
      .then(function(f) {
        f.contents.tracks.forEach(function(track, idx) {
          if (track.instrument) instSet.load(track.instrument, songTrackIdx*SONG_MAX_TRACKS + idx);
        });

        $scope.indexMap[$data.id] = f;
        checkPayload();
        $scope.fileChanged();

        $scope.recipe.raise('song_pattern_dropped');
      });
    
  };

  var reloadFromRepo = function() {
    var block_ids = {};

    FileRepository.getFile(id).then(function(file) {
      if (file) {
        file.contents.tracks.forEach(function(track, idx) {
          track.blocks.forEach(function(block){
            if (block && block.id) {
              if (!block_ids[block.id]){
                block_ids[block.id] = FileRepository.getFile(block.id)
                  .then(function(file) {
                    return {
                      file: file,
                      idx: idx
                    };
                  });
              }
            }
          })
        });
      };

      return $q.all(block_ids)
        .then(function(indexMap) {
          $scope.indexMap = {};

          for (var blockId in indexMap) {
            var pattern = indexMap[blockId].file.contents;
            var songTrackIdx = indexMap[blockId].idx;

            $scope.indexMap[blockId] = indexMap[blockId].file;
            pattern.tracks.forEach(function(track, idx) {
              if (track.instrument) instSet.load(track.instrument, songTrackIdx*SONG_MAX_TRACKS + idx);
            });
          }
        })
        .then(function() {
          $timeout(function() {
            var outputFile = {};
            $scope.fileIndex = file.index;
            $scope.file = file.contents;
          });
        });
    });
  };

  reloadFromRepo();

  var keyDownHandler = function(evt) {
    if (document.activeElement.tagName.toLowerCase() === "input") return;
    
    if (evt.keyCode === 90 && evt.ctrlKey) {
      FileRepository.undo(id).then(reloadFromRepo);
    }

    if (evt.keyCode === 89 && evt.ctrlKey) {
      FileRepository.redo(id).then(reloadFromRepo);
    }
  };

  $(document).bind("keydown", keyDownHandler);
  $scope.$on("$destroy", function() {
    $(document).unbind("keydown", keyDownHandler);
    instSet.dispose();
  });  
}]);

musicShowCaseApp.controller("PatternEditorController", ["$q", "$translate", "$scope", "$timeout", "$routeParams", "$http", "TICKS_PER_BEAT", "MusicContext", "FileRepository", "Pattern", "InstrumentSet", 'Export', 'ErrMessage',
  function($q, $translate, $scope, $timeout, $routeParams, $http, TICKS_PER_BEAT, MusicContext, FileRepository, Pattern, InstrumentSet, Export, ErrMessage) {
  var id = $routeParams.id;

  $scope.exportItem = function() {
    Export.exportFile($scope.fileIndex.name, $scope.fileIndex.id);
  };

  $scope.$emit('switchProject', $routeParams.project); 

  $scope.instrumentMap = {};
  $scope.beatWidth = 10;
  $scope.zoomLevel = 8;
  $scope.selectedTrack = 0;
  $scope.mutedState = [];

  var playing = null;
  var instSet = InstrumentSet();

  $scope.updateMuted = function() {
    $scope.mutedState = Pattern.getMutedState($scope.file);
    $scope.fileChanged();
  };

  $scope.removeItem = function() {
    if ($scope.fileIndex.builtIn) {
      $scope.file = null;
      $scope.fileIndex = null;
      FileRepository.destroyFile(id)
        .then(function() {
          reloadFromRepo();
        });
      return;
    }

    FileRepository.moveToRecycleBin(id)
      .then(function() {
        document.location = "#/editor/" + $routeParams.project;
      })
      .catch(function(err) {
        if (err.type && err.type === 'cantremove') {
          ErrMessage('common.error_title', 'common.cantremove_error');
        } else {
          throw err;
        }
      });
  };

  $scope.removeTrack = function(trackIdx) {
    $scope.file.tracks = 
      $scope.file.tracks.slice(0, trackIdx)
        .concat($scope.file.tracks.slice(trackIdx+1));

    $scope.file.selectedTrack = $scope.file.selectedTrack % $scope.file.tracks.length;

    $scope.updateMuted();
    $scope.fileChanged();
  };

  $scope.addTrack = function() {
    $scope.file.tracks.push({
      events: [],
      scroll: 1000
    });

    $scope.file.selectedTrack = $scope.file.tracks.length - 1;
    $scope.updateMuted();
    $scope.fileChanged();
  };

  $scope.stop = function() {
    $scope.$broadcast("stopClock");
    $scope.$broadcast("resetClock");
    if (playing) playing.stop();
    $scope.recipe.raise("pattern_play_stopped");
    playing = null;
  };

  $scope.play = function() {
    var playingLine = $(".playing-line");

    $q.all(instSet.all)
      .then(function(instruments) {
        if (playing) playing.stop();

        var onStop = function() {
          $scope.$broadcast("stopClock");
          $scope.$broadcast("resetClock");
          $scope.recipe.raise("pattern_play_stopped");
          playing = null;
        };

        playing = Pattern.patternCompose($scope.file, instruments, 0, onStop).play();

        $scope.$broadcast("startClock", window.performance.now());
      });
  };

  $scope.zoomIn = function() {
    $scope.zoomLevel = $scope.zoomLevel * 2;
    if ($scope.zoomLevel > 32) $scope.zoomLevel = 32;
  };

  $scope.zoomOut = function() {
    $scope.zoomLevel = $scope.zoomLevel / 2;
    if ($scope.zoomLevel < 1) $scope.zoomLevel = 1;
  };

  $scope.indexChanged = function() {
    $scope.fileIndex.ref = FileRepository.getRefs("pattern", $scope.file);
    FileRepository.updateIndex(id, $scope.fileIndex);
  };

  $scope.fileChanged = fn.debounce(function() {
    FileRepository.updateFile(id, $scope.file)
      .then($scope.indexChanged);
  },100);

  $scope.$on("trackChanged", function(track) {
    computeMeasureCount();
    $scope.fileChanged();
  });

  var beep = function(instrument, n) {
      if (!instrument) return;
      if (lastPlaying) lastPlaying.stop();
      lastPlaying = instrument.note(n).play();

      setTimeout(function(){
        if (lastPlaying) lastPlaying.stop();
        lastPlaying = null;
      },50);
  };

  var computeMeasureCount = function() {
    if (!$scope.file) return;
    if (!$scope.file.tracks[0]) return;

    $scope.file.measureCount = Pattern.computeMeasureCount($scope.file, $scope.file.measure);
  };

  var lastPlaying;
  var trackMuted = function(track) {
    return $scope.mutedState[$scope.file.tracks.indexOf(track)];
  };

  $scope.$on("eventChanged", function(evt, data) {
    computeMeasureCount();

    if (data.oldevt.n !== data.evt.n && !trackMuted(data.track)) beep(instrument.get(data.track), data.evt.n);

    $scope.fileChanged();
  });

  $scope.$on("eventSelected", function(evt, data) {
    if (!trackMuted(data.track)) beep(instrument.get(data.track), data.evt.n);
  });

  $scope.$watch("file.measure", computeMeasureCount);

  var instrument = new WeakMap();
  $scope.updateInstrument = function(trackNo) {
    if (!$scope.file.tracks[trackNo]) return;
    if (!$scope.file.tracks[trackNo].instrument) return;
    return $q.all({
      musicObject: instSet.load($scope.file.tracks[trackNo].instrument, trackNo),
      index: FileRepository.getIndex($scope.file.tracks[trackNo].instrument)
    }).then(function(result) {
        $scope.instrumentMap[$scope.file.tracks[trackNo].instrument] = result.index;
        instrument.set($scope.file.tracks[trackNo], result.musicObject);
        return result.musicObject;
    });
  };

  $scope.onDropComplete = function(instrument,event) {
    if (instrument.type !== 'instrument') return;

    var trackNo = $scope.file.selectedTrack;

    $scope.file.tracks = $scope.file.tracks || [];
    $scope.file.tracks[trackNo] = $scope.file.tracks[trackNo] || {};
    $scope.file.tracks[trackNo].instrument = instrument.id;

    FileRepository.updateFile(id, $scope.file);
    $scope.updateInstrument(trackNo)
      .then(function(musicObject) {
        $scope.updateMuted();
        if (!$scope.mutedState[trackNo]) beep(musicObject, 36);
      });
  };

  var reloadFromRepo = function() {
    FileRepository.getFile(id).then(function(file) {
      $timeout(function() {
        var outputFile = {};
        $scope.fileIndex = file.index;
        $scope.file = file.contents;
        $scope.mutedState = Pattern.getMutedState($scope.file);
        if (!$scope.file.tracks) $scope.file.tracks=[{}];

        $scope.file.tracks.forEach(function(track, idx) {
          track.events = track.events || [];
          $scope.updateInstrument(idx);
        });
      });
    });
  };

  reloadFromRepo();

  // undo & redo

  var keyDownHandler = function(evt) {
    if (document.activeElement.tagName.toLowerCase() === "input") return;

    if (evt.keyCode === 90 && evt.ctrlKey) {
      FileRepository.undo(id).then(reloadFromRepo);
    }

    if (evt.keyCode === 89 && evt.ctrlKey) {
      FileRepository.redo(id).then(reloadFromRepo);
    }
  };

  $(document).bind("keydown", keyDownHandler);
  $scope.$on("$destroy", function() {
    $(document).unbind("keydown", keyDownHandler);

    instSet.dispose();
  });

  $scope.$on("enableTrack", function(evt, track) {
    $scope.file.selectedTrack = $scope.file.tracks.indexOf(track);
  });

  $scope.$on("patternSelectEvent", function(evt, event) {
    $timeout(function() {
      $scope.$broadcast("trackSelectEvent", event);
    });
  });
}]);

musicShowCaseApp.controller("EditorController", ["$scope", "$q", "$timeout", "$routeParams", "$http", "MusicContext", "FileRepository", "MusicObjectFactory", "Export", function($scope, $q, $timeout, $routeParams, $http, MusicContext, FileRepository, MusicObjectFactory, Export) {
  var id = $routeParams.id;
  $scope.$emit('switchProject', $routeParams.project);

  $scope.exportItem = function() {
    Export.exportFile($scope.fileIndex.name, $scope.fileIndex.id);
  };

  $scope.removeItem = function() {
    destroyAll();

    if ($scope.fileIndex.builtIn) {
      $scope.file = null;
      $scope.fileIndex = null;
      FileRepository.destroyFile(id)
        .then(function() {
          reloadFromRepo();
        });
      return;
    } else {
      FileRepository.moveToRecycleBin(id)
        .then(function() {
          document.location = "#/editor/" + $routeParams.project;
        })
        .catch(function(err) {
          if (err.type && err.type === 'cantremove') {
            ErrMessage('common.error_title', 'common.cantremove_error');
          } else {
            throw err;
          }
        });
    }
  };

  var lastObj;
  var musicObjectFactory = MusicObjectFactory({monitor: true});

  var destroyAll = function() {
    ($scope.instruments||[]).forEach(function(instrument) {
      if (instrument.dispose) instrument.dispose();
    });

    ($scope.playables||[]).forEach(function(playable) {
      $scope.stopPlay(playable);
    });    

    return musicObjectFactory.destroyAll();
  };

  var lazyLoadInstrument = function(f) {
    var callStop = function(p) { return p.stop(); };
    var callPlay = function(p) { return p.play(); };

    var instrumentPromise;
    var innerInstrument;

    var note = function(n) {
      if (innerInstrument) return innerInstrument.note(n);
      var innerNote;

      if (!instrumentPromise) {
        instrumentPromise = f();
      }

      innerNote = instrumentPromise.then(function(inst) {
        innerInstrument = inst;
        return inst.note(n);
      });

      var play = function() {
        var playing = innerNote.then(callPlay);

        var stop = function() {
          return playing.then(callStop);
        };

        return {stop: stop};
      };

      return {play: play};
    };

    return MUSIC.instrumentExtend({
      note: note
    }).stopDelay(10);
  };

  var createInstrumentFromFile = function() {
    return musicObjectFactory.create($scope.file);
  };

  var fileChanged = fn.debounce(function(newFile, oldFile) {
    if (!$scope.file) return;
   
    $q.when(null)
      .then(function() {
        return destroyAll();
      })
      .then(function() {
        return lazyLoadInstrument(createInstrumentFromFile);
      })    
      .then(function(obj) {
          if (!obj) {
            $scope.instruments = [];
            $scope.playables = [];
            return;
          }

          if (obj !== lastObj) {
            $scope.instruments = [];
            $scope.playables = [];
            if (obj.note) {
              // instrument
              $scope.instruments.push(obj);
            } else if (obj.play) {
              $scope.playables.push(obj);
            }
          }

          if (oldFile) {
            FileRepository.updateFile(id, $scope.file);
            $scope.fileIndex.updated = true;
          }
          lastObj = obj;
      });
  }, 250);
  $scope.$watch('file', fileChanged, true);

  $scope.indexChanged = function() {
    FileRepository.updateIndex(id, $scope.fileIndex);
  };

  var reloadFromRepo = function() {
    FileRepository.getFile(id).then(function(file) {
      $timeout(function() {
        var outputFile = {};

        $scope.outputFile = outputFile;
        $scope.file = file.contents;
        $scope.fileIndex = file.index;
        $scope.observer = {};

        $scope.observer.notify = function() {
          $timeout(function() {
            $scope.instruments = [];
            $scope.playables = [];
          });
        };

      });
    });
  };

  reloadFromRepo();

  $scope.$on("stackChanged", function() {
    $scope.resetStack = true;
    fileChanged();
  });

  $scope.$on("$destroy", destroyAll);

  $scope.startPlay = function(playable) {
    playable.playing = playable.play();
  };

  $scope.stopPlay = function(playable) {
    if (!playable.playing) return;
    playable.playing.stop();
    playable.playing = undefined;
  };

}]);

musicShowCaseApp.controller("MainController", 
  ["$q", "$scope", "$timeout", "$uibModal", "$translate", "MusicContext", "FileRepository", "Recipe", "WelcomeMessage", "localforage", "Export", "ErrMessage",
  function($q, $scope, $timeout, $uibModal, $translate, MusicContext, FileRepository, Recipe, WelcomeMessage, localforage, Export, ErrMessage) {
  var music;

  $scope.$on("switchProject", function(evt, id) {
    switchProject(id);
  });

  var concat = function(a, b) {
    return a.concat(b);
  };

  var switchProject = function(projectId) {
    var pFilter = [projectId];

    return FileRepository.getFile(projectId).then(function(file) {
      $scope.project = file;

      return (file.index.ref||[]).concat([projectId]);
    }).then(function(filter) {
      $scope.projectFilter = filter.concat(['core']);
      if (filter.indexOf('default') !== -1) $scope.projectFilter.push(undefined);
    })
    .then(updateSearch)
    .catch(function() {
      document.location = "#";
    });
  };

  var updateSearch = fn.debounce(function() {
    if (currentObserver) currentObserver.close();
    currentObserver = FileRepository.search(null, {
      project: $scope.projectFilter, type: ['instrument', 'pattern', 'song', 'fx']
    }).observe(function(files) {
      $timeout(function() {
        $scope.filesTotal = files.total;
        $scope.files = files.results;
      }); 
    });
  },100);

  var currentObserver;
  $scope.fileInputClick = function() {
    $timeout(function() {
      $(".choose-file-import-container input[type=file]").click();
    });
  };

  $scope.fileImport = function(files) {
    var readTextFile = function(file) {
      return $q(function(resolve, reject) {
        var fileReader = new FileReader();
        fileReader.onload = function(e) {
          resolve(e.target.result);
        };

        fileReader.onerror = function(err) {
          reject(err);
        };

        fileReader.readAsText(file);
      });
    };

    var nextLocation;
    var importFile = function(file) {
      return function(options) {
        return readTextFile(file)
          .then(function(json) {
            return Export.importFile(json)
              .then(function(file) {
                if (options && options.first) {
                  if (file.type === 'project') {
                    nextLocation = "#/editor/"+ file.id;
                  } else {
                    nextLocation = "#/editor/"+ file.project + "/"+ file.type + "/" +file.id;
                  }
                }
              });
          });
      };
    };

    var p = null;
    for (var i=0; i<files.length; i++) {
      if (p) {
        p = p.then(importFile(files[i]));
      } else {
        p = importFile(files[i])({first: true});
      }
    }

    if (p) {
      p.then(function(index) {
        if (nextLocation) document.location = nextLocation;
      }).catch(function(err) {
        var modalIns = $uibModal.open({
          templateUrl: "site/templates/modal/error.html",
          controller: "errorModalCtrl",
          windowClass: 'error',
          resolve: {
            text: function() {
              return $translate('common.loader_error');
            },
            title: function() {
              return $translate('common.error_title');
            }
          }
        });
      });
    }
  };

  $scope.changeLanguage = function (langKey) {
    localforage.setItem('lang', langKey);
    $translate.use(langKey);
  };

  localforage.getItem("lang")
    .then(function(currentLanguage) {
      if (currentLanguage) $scope.changeLanguage(currentLanguage);

      $timeout(function() {
        $scope.langLoaded = true;
      });
    });

  $scope.welcome = function() {
    // show welcome modal
    var modalIns = $uibModal.open({
      templateUrl: "site/templates/modal/welcome.html",
      controller: "welcomeModalCtrl",
      resolve: {
        dontshowagain: ["WelcomeMessage", function(WelcomeMessage) {
          return WelcomeMessage.skip();
        }]
      }
    });
  };
     
  $scope.openRecycleBin = function() {
    // show recycle bin modal
    var modalIns = $uibModal.open({
      templateUrl: "site/templates/modal/recycleBin.html",
      controller: "recycleBinModalCtrl"
    });
  };


  WelcomeMessage.skip()
    .then(function(skip) {
      if (!skip) $scope.welcome();
    });

  $scope.recipe = Recipe.start;

  $scope.activate = function(example) {
    if (example.type === "instrument"||example.type === "song"||example.type === "pattern") {
      document.location = "#/editor/" + $scope.project.index.id + "/" +example.type+"/"+example.id;
    }
    if (example.type === "project") {
      document.location = "#/editor/" + example.id;
    }
  };

  $scope.keywordUpdated = fn.debounce(function() {
    if (currentObserver) currentObserver.close();
    currentObserver = FileRepository.search($scope.searchKeyword, {
      project: $scope.projectFilter, type: ['instrument', 'pattern', 'song', 'fx']
    }).observe(function(files) {
      $scope.filesTotal = files.total;
      $scope.files = files.results;
    });
  },200);

  $scope.iconForType = function(type) {
    if (type === "instrument") return "keyboard-o";
    if (type === "song") return "th";
    if (type === "pattern") return "music";
    if (type === "fx") return "magic";
    if (type === "project") return "folder-o";
    return "question";
  }

  $scope.removeProject = function() {
    FileRepository.moveToRecycleBin($scope.project.index.id)
      .then(function() {
        document.location = "#";
      })
      .catch(function(err) {
        if (err.type && err.type === 'cantremove') {
          ErrMessage('common.error_title', 'common.cantremove_project_error');
        } else {
          throw err;
        }
      });
  };

  $scope.exportProject = function() {
    Export.exportProject($scope.project.index.name, $scope.project.index.id);
  };

  $scope.projectSettings = function() {
    $uibModal.open({
      templateUrl: "site/templates/modal/projectSettings.html",
      controller: "projectSettingsModalCtrl",
      resolve: {
        project: {
          name: $scope.project.index.name,
          ref: $scope.project.index.ref
        },
        buttonText: function() { return 'common.ok'; }
      }
    }).result.then(function(project) {
      $scope.project.index.name = project.name;
      FileRepository.updateIndex($scope.project.index.id, {
        type: 'project', 
        name: project.name,
        ref: project.ref
      })
      .then(function() {
        switchProject($scope.project.index.id);
      });
    });
  };

  $scope.newProject = function() {
    // open "project settings" modal
    $translate('project.new').then(function(projectName) {
      $uibModal.open({
        templateUrl: "site/templates/modal/projectSettings.html",
        controller: "projectSettingsModalCtrl",
        resolve: {
          project: {name: projectName},
          buttonText: function() { return 'common.create'; }
        }
      }).result.then(function(project) {
        FileRepository.createFile({type: 'project', name: project.name, ref: project.ref})
          .then(function(id) {
            document.location="#/editor/" + id;
          });
      });
    });
  };

  $scope.openProject = function() {
    $uibModal.open({
      templateUrl: "site/templates/modal/openProject.html",
      controller: "openProjectModalCtrl"
    }).result.then(function(id) {
      var moreImportant = function(file1, file2) {
        if (file1.type !== file2.type) {
          if (file1.type==='song') return file1;
          if (file2.type==='song') return file2;

          if (file1.type==='pattern') return file1;
          if (file2.type==='pattern') return file2;
        } else {
          return (file1.ref||[]).length > (file2.ref||[]).length ? file1 : file2;
        }

        return file2;
      };

      // switch to main object
      return FileRepository.getProjectFiles(id)
        .then(function(files) {
          if (files.length > 0) {
            var better = files.reduce(moreImportant, files[0]);
            if (better && better.type !== 'project') {
              document.location = "#/editor/" + id + "/" + better.type+"/"+better.id;
            } else {
              document.location = "#/editor/" + id;
            }
          } else {
            document.location = "#/editor/" + id;
          }
        });
    });
  };

  $scope.newInstrument = function() {
    $translate("common.new_instrument")
      .then(function(name) {
        return FileRepository.createFile({
          type: "instrument",
          name: name,
          project: $scope.project.index.id
        });
      })
      .then(function(id) {
        document.location = "#/editor/" + $scope.project.index.id + "/instrument/" + id;
      })
      .catch(function(err) {
        debugger;
      });
  };

  $scope.newSong = function() {
    $translate("common.new_song")
      .then(function(name) {
        return FileRepository.createFile({
          type: "song", 
          name: name,
          project: $scope.project.index.id
        });
      })
      .then(function(id) {
        document.location = "#/editor/" + $scope.project.index.id + "/song/"+id;
      });
  };

  $scope.newPattern = function() {
    $translate("common.new_pattern")
      .then(function(name) {
        return FileRepository.createFile({
          type: "pattern",
          name: name,
          project: $scope.project.index.id
        });
      })
      .then(function(id) {
        document.location = "#/editor/" + $scope.project.index.id + "/pattern/"+id;
      });
  };


  $scope.about = function() {
    $uibModal.open({
      templateUrl: "site/templates/modal/about.html",
      controller: "infoModalCtrl"
    });
  };

  $scope.help = function() {
    $uibModal.open({
      templateUrl: "site/templates/modal/help.html",
      controller: "infoModalCtrl"
    });
  };

  $scope.todo = function() {
    $uibModal.open({
      templateUrl: "todoModal.html",
      controller: "todoModalCtrl"
    });
  };
}]);

musicShowCaseApp.controller("todoModalCtrl", ["$scope", "$uibModalInstance", function($scope, $uibModalInstance) {
  $scope.dismiss = function() {
    $uibModalInstance.dismiss();
  };
}]);

