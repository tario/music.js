var musicShowCaseApp = angular.module("MusicShowCaseApp", ['ui.codemirror', 'ngRoute', 'ui.bootstrap', 'ngDraggable', 'ngCookies', 'pascalprecht.translate']);

musicShowCaseApp.constant("MUSIC", MUSIC);
musicShowCaseApp.constant("TICKS_PER_BEAT", 96);
musicShowCaseApp.constant("localforage", localforage);
