var musicShowCaseApp = angular.module("MusicShowCaseApp");

musicShowCaseApp.filter("block_name", function() {
  return function(block, indexMap) {
    if (block.id) {
      return indexMap[block.id] && indexMap[block.id].index ? indexMap[block.id].index.name : block.id;
    } else {
      return "Drop pattern here";
    }
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

musicShowCaseApp.controller("SongEditorController", ["$scope", "$uibModal", "$q", "$timeout", "$routeParams", "$http", "MusicContext", "FileRepository", "InstrumentSet", "Pattern", function($scope, $uibModal, $q, $timeout, $routeParams, $http, MusicContext, FileRepository, InstrumentSet, Pattern) {
  $scope.indexMap = {};
  var music = new MUSIC.Context();

  var id = $routeParams.id;

  var instSet = InstrumentSet(music);

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
      $scope.currentRec = music.record({
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

        var createPattern = function(id) {
          if (!id) return null;
          if (patterns[id]) return patterns[id];

          var pattern = $scope.indexMap[id].contents;
          var changedBpm = Object.create(pattern);
          changedBpm.bpm = $scope.file.bpm;

          patterns[id] = Pattern.patternCompose(changedBpm, instruments, function() {});

          return patterns[id];
        };        

        var scale = 600 / $scope.file.bpm;
        var measure = 100 * $scope.file.measure * scale;
        var song = new MUSIC.Song(
          $scope.file.tracks.map(function(track) {
            return track.blocks.map(function(block) {
              return createPattern(block.id);
            });
          })
        , {measure: measure});

        playing = song.play({
          onStop: function() {
            $scope.recipe.raise("song_play_stopped");
            playing = null;
            if ($scope.currentRec) $scope.currentRec.stop();
            $scope.currentRec = null;
            $timeout(function() {});
          }
        });

      });


  };

  $scope.patternPlay = function(block) {
    var pattern = $scope.indexMap[block.id].contents;
    var doNothing = function() {};

    var loader = {};

    pattern.tracks.forEach(function(track) {
      if (track.instrument) loader[track.instrument.id] = instSet.load(track.instrument.id);
    });
    $q.all(loader)
      .then(function(instruments) {
        $scope.stop();

        var changedBpm = Object.create(pattern);
        changedBpm.bpm = $scope.file.bpm;

        playing = Pattern.patternCompose(changedBpm, instruments, function() {
          playing = null;
        }).play();
      });
  };

  $scope.indexChanged = function() {
    FileRepository.updateIndex(id, $scope.fileIndex);
  };

  $scope.fileChanged = fn.debounce(function() {
    FileRepository.updateFile(id, $scope.file);
  },100);;

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

    if ($scope.file.tracks.length < maxTrackIndex+2) {
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

  $scope.onDropComplete = function($data,$event,block) {
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
        f.contents.tracks.forEach(function(track) {
          if (track.instrument) instSet.load(track.instrument.id);
        });

        $scope.indexMap[$data.id] = f;
        checkPayload();
        $scope.fileChanged();

        $scope.recipe.raise('song_pattern_dropped');
      });
    
  };

  var updateFromRepo = function() {
    var block_ids = {};

    FileRepository.getFile(id).then(function(file) {
      if (file) {
        file.contents.tracks.forEach(function(track) {
          track.blocks.forEach(function(block){
            if (block && block.id) {
              if (!block_ids[block.id]){
                block_ids[block.id] = FileRepository.getFile(block.id);
              }
            }
          })
        });
      };

      return $q.all(block_ids)
        .then(function(indexMap) {
          $scope.indexMap = indexMap;

          for (var blockId in indexMap) {
            var pattern = indexMap[blockId].contents;
            pattern.tracks.forEach(function(track) {
              if (track.instrument) instSet.load(track.instrument.id);
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

  updateFromRepo();

  var keyDownHandler = function(evt) {
    if (evt.keyCode === 90 && evt.ctrlKey) {
      FileRepository.undo(id);
      updateFromRepo();
    }

    if (evt.keyCode === 89 && evt.ctrlKey) {
      FileRepository.redo(id);
      updateFromRepo();
    }
  };

  $(document).bind("keydown", keyDownHandler);
  $scope.$on("$destroy", function() {
    $(document).unbind("keydown", keyDownHandler);
    instSet.dispose();
  });  
}]);

musicShowCaseApp.controller("PatternEditorController", ["$scope", "$timeout", "$routeParams", "$http", "MusicContext", "FileRepository", "Pattern", "InstrumentSet", function($scope, $timeout, $routeParams, $http, MusicContext, FileRepository, Pattern, InstrumentSet) {
  var id = $routeParams.id;
  
  $scope.beatWidth = 10;
  $scope.zoomLevel = 8;
  $scope.selectedTrack = 0;

  var playing = null;
  var instSet = InstrumentSet();


  $scope.removeTrack = function(trackIdx) {
    $scope.file.tracks = 
      $scope.file.tracks.slice(0, trackIdx)
        .concat($scope.file.tracks.slice(trackIdx+1));

    $scope.file.selectedTrack = $scope.file.selectedTrack % $scope.file.tracks.length;

    $scope.fileChanged();
  };

  $scope.addTrack = function() {
    $scope.file.tracks.push({
      events: [],
      scroll: 1000
    });

    $scope.file.selectedTrack = $scope.file.tracks.length - 1;
    $scope.fileChanged();
  };

  $scope.stop = function() {
    if (playing) playing.stop();
    $scope.recipe.raise("pattern_play_stopped");
    playing = null;
  };

  $scope.play = function() {
    var instruments = {};
    $scope.file.tracks.forEach(function(track) {
      if (track.instrument) {
        instruments[track.instrument.id] = instrument.get(track);
      }
    });

    playing = Pattern.patternCompose($scope.file, instruments, function() {
      $scope.recipe.raise("pattern_play_stopped");
      playing = null;
    }).play();
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
    FileRepository.updateIndex(id, $scope.fileIndex);
  };

  $scope.fileChanged = fn.debounce(function() {
    FileRepository.updateFile(id, $scope.file);
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
  $scope.$on("eventChanged", function(evt, data) {
    computeMeasureCount();

    if (data.oldevt.n !== data.evt.n) beep(instrument.get(data.track), data.evt.n);
  });

  $scope.$on("eventSelected", function(evt, data) {
    beep(instrument.get(data.track), data.evt.n);
  });

  $scope.$watch("file.measure", computeMeasureCount);

  var instrument = new WeakMap();
  $scope.updateInstrument = function(trackNo) {
    if (!$scope.file.tracks[trackNo]) return;
    if (!$scope.file.tracks[trackNo].instrument) return;

    return instSet.load($scope.file.tracks[trackNo].instrument.id)
      .then(function(musicObject) {
        instrument.set($scope.file.tracks[trackNo], musicObject);
        return musicObject;
      });
  };

  $scope.onDropComplete = function(instrument,event) {
    if (instrument.type !== 'instrument') return;

    var trackNo = $scope.file.selectedTrack;

    $scope.file.tracks = $scope.file.tracks || [];
    $scope.file.tracks[trackNo] = $scope.file.tracks[trackNo] || {};
    $scope.file.tracks[trackNo].instrument = instrument;

    FileRepository.updateFile(id, $scope.file);
    $scope.updateInstrument(trackNo)
      .then(function(musicObject) {
        beep(musicObject, 36);
      });
  };

  var updateFromRepo = function() {
    FileRepository.getFile(id).then(function(file) {
      $timeout(function() {
        var outputFile = {};
        $scope.fileIndex = file.index;
        $scope.file = file.contents;
        if (!$scope.file.tracks) $scope.file.tracks=[{}];

        $scope.file.tracks.forEach(function(track, idx) {
          track.events = track.events || [];
          $scope.updateInstrument(idx);
        });
      });
    });
  };

  updateFromRepo();

  // undo & redo

  var keyDownHandler = function(evt) {
    if (evt.keyCode === 90 && evt.ctrlKey) {
      FileRepository.undo(id);
      updateFromRepo();
    }

    if (evt.keyCode === 89 && evt.ctrlKey) {
      FileRepository.redo(id);
      updateFromRepo();
    }
  };

  $(document).bind("keydown", keyDownHandler);
  $scope.$on("$destroy", function() {
    $(document).unbind("keydown", keyDownHandler);
    instSet.dispose();
  });


}]);

musicShowCaseApp.controller("EditorController", ["$scope", "$timeout", "$routeParams", "$http", "MusicContext", "FileRepository", "MusicObjectFactory", function($scope, $timeout, $routeParams, $http, MusicContext, FileRepository, MusicObjectFactory) {
  var id = $routeParams.id;

  var lastObj;
  var fileChanged = fn.debounce(function(newFile) {
    if (!$scope.file) return;
    
    MusicObjectFactory($scope.file)
      .then(function(obj) {
          if (!obj) {
            $scope.instruments = [];
            $scope.playables = [];
            console.log("removed");
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

          FileRepository.updateFile(id, $scope.file);
          lastObj = obj;
      });
  }, 50);
  $scope.$watch('file', fileChanged, true);

  $scope.export = function() {
    var a = document.createElement("a");
    document.body.appendChild(a);
    a.style = "display: none";

    var blob = new Blob([JSON.stringify($scope.file,"\n","  ")]);
    var url  = window.URL.createObjectURL(blob);
    a.href = url;
    a.download = $scope.fileIndex.name + ".json";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  $scope.indexChanged = function() {
    FileRepository.updateIndex(id, $scope.fileIndex);
  };

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

  $scope.$on("$destroy", function() {
    $scope.instruments.forEach(function(instrument) {
      if (instrument.dispose) instrument.dispose();
    });
  });

/*  $scope.$on("addFx", function(evt, args) {
    $scope.file.data.array = [{
      type: args.fx.name,
      data: {}
    }].concat($scope.file.data.array);
  });*/

  $scope.$on("$destroy", function() {
    $scope.playables.forEach(function(playable) {
      $scope.stopPlay(playable);
    });
  });

  $scope.startPlay = function(playable) {
    playable.playing = playable.play();
  };

  $scope.stopPlay = function(playable) {
    if (!playable.playing) return;
    playable.playing.stop();
    playable.playing = undefined;
  };

}]);

musicShowCaseApp.controller("MainController", ["$scope", "$timeout", "$uibModal", "MusicContext", "FileRepository", "Recipe", "WelcomeMessage", function($scope, $timeout, $uibModal, MusicContext, FileRepository, Recipe, WelcomeMessage) {
  var music;

  $scope.welcome = function() {
    // show welcome modal
    var modalIns = $uibModal.open({
      templateUrl: "site/templates/modal/welcome.html",
      controller: "welcomeModalCtrl"
    });
  };

  if (!WelcomeMessage.skip()) $scope.welcome();

  var currentObserver = FileRepository.search().observe(function(files) {
    $timeout(function() {
      $scope.filesTotal = files.total;
      $scope.files = files.results;
    });
  });

  $scope.recipe = Recipe.start;

  $scope.activate = function(example) {
    if (example.type === "instrument"||example.type === "song"||example.type === "pattern") {
      document.location = "#/editor/"+example.type+"/"+example.id;
    }
  };

  $scope.$watch("searchKeyword", fn.debounce(function() {
    if (currentObserver) currentObserver.close();
    currentObserver = FileRepository.search($scope.searchKeyword).observe(function(files) {
      $scope.filesTotal = files.total;
      $scope.files = files.results;
    });
  },200));

  $scope.iconForType = function(type) {
    if (type === "instrument") return "keyboard-o";
    if (type === "song") return "th";
    if (type === "pattern") return "music";
    if (type === "fx") return "magic";
    return "question";
  }

  $scope.newInstrument = function() {
    FileRepository.createFile({type: "instrument", name: "New Instrument"})
      .then(function(id) {
        document.location = "#/editor/instrument/"+id;
      });
  };

  $scope.newSong = function() {
    FileRepository.createFile({type: "song", name: "New Song"})
      .then(function(id) {
        document.location = "#/editor/song/"+id;
      });
  };

  $scope.newPattern = function() {
    FileRepository.createFile({type: "pattern", name: "New Pattern"})
      .then(function(id) {
        document.location = "#/editor/pattern/"+id;
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

