var musicShowCaseApp = angular.module("MusicShowCaseApp");

musicShowCaseApp.controller("SongEditorController", ["$scope", "$timeout", "$routeParams", "$http", "MusicContext", "FileRepository", "MusicObjectFactory", function($scope, $timeout, $routeParams, $http, MusicContext, FileRepository, MusicObjectFactory) {
  var id = $routeParams.id;
  $scope.indexChanged = function() {
    FileRepository.updateIndex(id, $scope.fileIndex);
  };

  FileRepository.getFile(id).then(function(file) {
    $timeout(function() {
      var outputFile = {};
      $scope.fileIndex = file.index;
    });
  });
}]);

musicShowCaseApp.controller("PatternEditorController", ["$scope", "$timeout", "$routeParams", "$http", "MusicContext", "FileRepository", "MusicObjectFactory", function($scope, $timeout, $routeParams, $http, MusicContext, FileRepository, MusicObjectFactory) {
  var id = $routeParams.id;
  
  $scope.beatWidth = 10;
  $scope.zoomLevel = 4;

  var playing = null;

  $scope.stop = function() {
    if (playing) playing.stop();
    playing = null;
  };

  var noteseqFromTrack = function(track) {
    var noteseq = new MUSIC.NoteSequence();

    for (var i=0; i<track.events.length; i++) {
      var evt = track.events[i];
      noteseq.push([evt.n, evt.s, evt.l]);
    }

    noteseq.paddingTo(100 * $scope.file.measureCount * $scope.file.measure);
    noteseq.pushCallback([100*$scope.file.measureCount * $scope.file.measure, function() {
      playing = null;
    }]);

    return noteseq.makePlayable(instrument.get(track));
  };

  $scope.play = function() {
    if (playing) return;
    if (!instrument) return;

    var inst = instrument.get($scope.file.track[0]);
    if (!inst) return;
    playing = noteseqFromTrack($scope.file.track[0]).play();
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
  });

  $scope.$on("trackChanged", function(track) {
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
    if (!$scope.file.track[0]) return;

    var endTime = $scope.file.track[0].events.map(function(evt) {
      return evt.s + evt.l;
    }).reduce(function(a,b) {
      return a>b ? a : b;
    }, 0);

    var measureLength = $scope.file.measure * 100;

    $scope.file.measureCount = Math.floor((endTime-1)/measureLength) + 1;
    if ($scope.file.measureCount<1) $scope.file.measureCount=1;
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
  $scope.updateInstrument = function() {
    if (!$scope.file.track[0]) return;
    if (!$scope.file.track[0].instrument) return;

    var instrumentId = $scope.file.track[0].instrument.id;
    FileRepository.getFile(instrumentId)
      .then(function(file) {
        return MusicObjectFactory(file.contents);
      })
      .then(function(musicObject) {
        instrument.set($scope.file.track[0], musicObject);
        beep(musicObject, 36);
      });
  };


  $scope.onDropComplete = function(instrument,event) {
    $scope.file.track = $scope.file.track || [];
    $scope.file.track[0] = $scope.file.track[0] || {};
    $scope.file.track[0].instrument = instrument;

    FileRepository.updateFile(id, $scope.file);
    $scope.updateInstrument();
  };

  FileRepository.getFile(id).then(function(file) {
    $timeout(function() {
      var outputFile = {};
      $scope.fileIndex = file.index;
      $scope.file = file.contents;
      if (!$scope.file.track) $scope.file.track=[{}];
      $scope.file.track[0].events = $scope.file.track[0].events || [];
      $scope.updateInstrument();
    });
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

musicShowCaseApp.controller("MainController", ["$scope", "$timeout", "$uibModal", "MusicContext", "FileRepository", function($scope, $timeout, $uibModal, MusicContext, FileRepository) {
  var music;

  var currentObserver = FileRepository.search().observe(function(files) {
    $timeout(function() {
      $scope.filesTotal = files.total;
      $scope.files = files.results;
    });
  });

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

  $scope.todo = function() {
    $uibModal.open({
      templateUrl: "todoModal.html",
      controller: "todoModalCtrl"
    });
  }
}]);

musicShowCaseApp.controller("todoModalCtrl", ["$scope", "$uibModalInstance", function($scope, $uibModalInstance) {
  $scope.dismiss = function() {
    $uibModalInstance.dismiss();
  };
}]);

