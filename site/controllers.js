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
  var defaultL = 200;
  
  $scope.beatWidth = 10;

  $scope.indexChanged = function() {
    FileRepository.updateIndex(id, $scope.fileIndex);
  };

  var updateGrid = function() {
    $scope.mainGridStyle = {"background-size": ($scope.file.measure*$scope.beatWidth) + "px 120px"};
  };

  $scope.fileChanged = fn.debounce(function() {
    FileRepository.updateFile(id, $scope.file);
    $timeout(updateGrid);
  });

  var lastPlaying;
  $scope.mouseUp = function(event) {
    if (lastPlaying) lastPlaying.stop();
    lastPlaying = null;
    $scope.mouseMove = function() {};
  };

  $scope.mouseLeave = function() {
    if (lastPlaying) lastPlaying.stop();
    lastPlaying = null;
    $scope.mouseMove = function() {};
  };

  var moveEvent = function(evt) {
    return function(event) {
      if (!event.target.classList.contains("event-list")) return;
      evt.s = Math.floor(event.offsetX / $scope.beatWidth) * 100;

      if (evt.s < 0) evt.s = 0;

      var oldN = evt.n;
      evt.n = Math.floor(100 - event.offsetY / 10);
      $scope.fileChanged();

      if (oldN !== evt.n){
        if (lastPlaying) lastPlaying.stop();
        if ($scope.instrument[0]) lastPlaying = $scope.instrument[0].note(evt.n).play();
      }
    };
  };

  var cancelMove = function() {
    if (lastPlaying) lastPlaying.stop();
    lastPlaying = null;

    $scope.mouseMove = function(){};
    $scope.mouseLeave = function(){};
  };

  $scope.mouseDown = function(event) {
    if (!event.target.classList.contains("event-list")) return;
    var newEvt = {
      n: Math.floor(100 - event.offsetY / 10),
      s: Math.floor(event.offsetX / $scope.beatWidth) * 100,
      l: defaultL
    };

    $scope.selected = newEvt;

    $scope.file.track[0].events.push(newEvt);
    $scope.fileChanged();

    if (lastPlaying) lastPlaying.stop();
    lastPlaying = null;
    if ($scope.instrument[0]) lastPlaying = $scope.instrument[0].note(newEvt.n).play();

    $scope.mouseMove = moveEvent(newEvt);
    $scope.mouseLeave = function() {
      if (lastPlaying) lastPlaying.stop();
      lastPlaying = null;

      $scope.file.track[0].events = $scope.file.track[0].events.filter(function(e) { return e !== newEvt; });

      cancelMove();
    };

    $scope.mouseUpResizeEvent = cancelMove;
    $scope.mouseUpEvent = cancelMove;
    $scope.mouseUp = cancelMove;
  };

  $scope.mouseDownEvent = function(evt, trackId, event) {
    event.preventDefault();

    $scope.selected = evt;
    if (lastPlaying) lastPlaying.stop();
    if ($scope.instrument[0]) lastPlaying = $scope.instrument[0].note(evt.n).play();

    $scope.mouseMove = moveEvent(evt);
    $scope.mouseLeave = function() {
      if (lastPlaying) lastPlaying.stop();
      lastPlaying = null;

      $scope.file.track[0].events = $scope.file.track[0].events.filter(function(e) { return e !== evt; });

      cancelMove();
    };

    $scope.mouseUpResizeEvent = cancelMove;
    $scope.mouseUpEvent = cancelMove;
    $scope.mouseUp = cancelMove;
  };

  $scope.mouseDownResizeEvent = function(evt, trackId, event) {
    event.preventDefault();

    $scope.selected = evt;
    if (lastPlaying) lastPlaying.stop();
    if ($scope.instrument[0]) lastPlaying = $scope.instrument[0].note(evt.n).play();

    $scope.mouseMove = function(event) {
      if (!event.target.classList.contains("event-list")) return;
      evt.refs = Math.floor(event.offsetX / $scope.beatWidth) * 100;
      evt.l = evt.refs - evt.s;
      if (evt.l<100) evt.l=100;

      defaultL = evt.l;
      $scope.fileChanged();
    };

    $scope.mouseUpResizeEvent = cancelMove;
    $scope.mouseUpEvent = cancelMove;
    $scope.mouseUp = cancelMove;
  };

  $scope.instrument = [];
  $scope.updateInstrument = function() {
    if (!$scope.file.track[0]) return;
    if (!$scope.file.track[0].instrument) return;

    var instrumentId = $scope.file.track[0].instrument.id;
    FileRepository.getFile(instrumentId)
      .then(function(file) {
        return MusicObjectFactory(file.contents);
      })
      .then(function(musicObject) {
        $scope.instrument[0] = musicObject;
        var playing = musicObject.note(24).play();
        setTimeout(playing.stop.bind(playing),100);
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

      updateGrid();
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

