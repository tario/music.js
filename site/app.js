var musicShowCaseApp = angular.module("MusicShowCaseApp", ['ngRaven', 'ui.codemirror', 'ngRoute', 'ui.bootstrap', 'ngDraggable', 'ngCookies', 'pascalprecht.translate']);

musicShowCaseApp.constant("MUSIC", MUSIC);
musicShowCaseApp.constant("TICKS_PER_BEAT", 96);
musicShowCaseApp.constant("SONG_MAX_TRACKS", 32);
musicShowCaseApp.constant("localforage", localforage);
