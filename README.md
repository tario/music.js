music.js
========

Javascript library to make music

Goals of the project
====================

The goal of music.js is to cover all the layers needed between HTML5 Web Audio API provided by browsers and fully usable music composition application similar to known ones like FL Studio

| Music Composition Application |
| ------------- |
| music.js  |
| WebAudio API provided by Browser  |

Running this software on browsers gives us several advantages:
- Potential portability among browsers and OSs where Web Audio API is supported
- Access to other resources available on browsers, for example:
  - WebSockets or even simple ajax to exchange data with server and make collaborative music composition
  - WebRTC to make streaming of sound
  - Standard UI design tools like HTML and CSS would make easier to design and implement UI
  - Canvas 2D drawing or even WebGL may be useful for visualizations,etc...
- NO installation needed
  
Although, these desirable features for music composition app are out of scope of music.js.

Music.js will cover:
- <a href="http://en.wikipedia.org/wiki/Domain-specific_language">DSL</a>
  - To easily create sound processing pipelines and effects
  - To easily create virtual instruments from sounds, and from composing other virtual instruments
  - To easily create sequences of musical notes, events of an score, etc...
- Library of sound effects usable from sound pipelines
  - Using webaudio capabilities, for example, the lowpass effect (via <a href="https://developer.mozilla.org/en-US/docs/Web/API/BiquadFilterNode">audioContext.createBiquadFilter</a>)
  - Composed effects, for example *stopCurve* or *echo* effects
  - Effects imported from other libraries, for example *reverb* effect from Timbre.js 

Installation
============

Sorry, for the moment there is no stable or single-file downloadable version for use. The status of this project is proof of concept

But, you can test the software at http://tario.github.io/music.js/ through examples. If you need to run it on your computer (e.g. to modify the code, etc...) the only thing you need to do is cloning the repo and host the static files (apache, iis, http-server from node.js, whatever), there is no server-side component needed to run music.js


Browser Compatibility
=====================

For the moment this proof of concept library was only tested on Chrome latests versions (39), so, may or not may work in others browsers then chrome. If you found compatibility errors you can report it if you want, but cross-browser compatibility is not the priority for now


Contents of repository
======================

For convenience, the repository is organized toward the static website showing the examples (this could change in the future), being the components of music.js in and directory. Also, there is no single-file downloadable version of music.js yet

- src: all the source of music.js library
- site: all Angular.js components of the site, these includes for now controllers.js and services.js
- spec: Automatic tests for music.js library
- examples: code examples of using music.js. Be advice these examples were written to run in the main app, so you will found them listed on the main page
- css: CSS files for the site
- lib: all external libraries needed for the site and music.js including Angular.js and plugins, codemirror, timbre.js and jazmine.js for tests


Contribution
============

Any kind of contribution is welcome on this project, but, since this is proof of concept I need certain things before others:
- Testing of features (find missing features, for example, you can't set change curves for frequences of custom oscillators)
- Ideas for new features (including, "if X software or library can do X, why music.js can't do it too?")
- New awesome effects and/or interesting waveforms or instruments
- Songs made using music.js would be awesome too
- Documentation and/or more examples

