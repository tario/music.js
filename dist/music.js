(function(window){

  var WORKER_PATH = 'recorderWorker.js';

  var Recorder = function(source, cfg){
    var config = cfg || {};
    var bufferLen = config.bufferLen || 4096;
    this.context = source.context;
    this.node = (this.context.createScriptProcessor ||
                 this.context.createJavaScriptNode).call(this.context,
                                                         bufferLen, 2, 2);
    var worker = new Worker(config.workerPath || WORKER_PATH);
    worker.postMessage({
      command: 'init',
      config: {
        sampleRate: this.context.sampleRate
      }
    });
    var recording = false,
      currCallback;

    this.node.onaudioprocess = function(e){
      if (!recording) return;
      worker.postMessage({
        command: 'record',
        buffer: [
          e.inputBuffer.getChannelData(0),
          e.inputBuffer.getChannelData(1)
        ]
      });
    }

    this.configure = function(cfg){
      for (var prop in cfg){
        if (cfg.hasOwnProperty(prop)){
          config[prop] = cfg[prop];
        }
      }
    }

    this.record = function(){
      recording = true;
    }

    this.stop = function(){
      recording = false;
    }

    this.clear = function(){
      worker.postMessage({ command: 'clear' });
    }

    this.getBuffer = function(cb) {
      currCallback = cb || config.callback;
      worker.postMessage({ command: 'getBuffer' })
    }

    this.exportWAV = function(cb, type){
      currCallback = cb || config.callback;
      type = type || config.type || 'audio/wav';
      if (!currCallback) throw new Error('Callback not set');
      worker.postMessage({
        command: 'exportWAV',
        type: type
      });
    }

    worker.onmessage = function(e){
      var blob = e.data;
      currCallback(blob);
    }

    source.connect(this.node);
    this.node.connect(this.context.destination);    //this should not be necessary
  };

  Recorder.forceDownload = function(blob, filename){
    var url = (window.URL || window.webkitURL).createObjectURL(blob);
    var link = window.document.createElement('a');
    link.href = url;
    link.download = filename || 'output.wav';
    var click = document.createEvent("Event");
    click.initEvent("click", true, true);
    link.dispatchEvent(click);
  }

  window.Recorder = Recorder;

})(window);

!function(a){"use strict";var b=function(){return r.apply(null,arguments)},c=Array.prototype.slice,d=0,e=1,f=2,g=3,h=[8e3,11025,12e3,16e3,22050,24e3,32e3,44100,48e3],i=[32,64,128,256],j="14.10.12",k=null,l={},m={},n="undefined"!=typeof window?"browser":"undefined"!=typeof module&&module.exports?"node":"unknown",o="browser"===n&&/(iPhone|iPad|iPod|Android)/i.test(navigator.userAgent),p=!1,q=120,r=function(){var b,d,e=c.call(arguments),f=e[0];switch(typeof f){case"string":l[f]?b=new l[f](e.slice(1)):m[f]?b=m[f](e.slice(1)):(d=/^(.+?)(?:\.(ar|kr))?$/.exec(f),d&&(f=d[1],l[f]?b=new l[f](e.slice(1)):m[f]&&(b=m[f](e.slice(1))),b&&d[2]&&b[d[2]]()));break;case"number":b=new D(e);break;case"boolean":b=new E(e);break;case"function":b=new F(e);break;case"object":if(null!==f){if(f instanceof A)return f;if(f.context instanceof A)return f.context;v(f)?b=new H(e):u(f)&&(b=new G(e))}}b===a&&(b=new C(e.slice(1)),console.warn('T("'+f+'") is not defined.'));var g=b._;return g.originkey=f,g.meta=s(b),g.emit("init"),b},s=function(a){for(var b,c,d=a._.meta,e=a;null!==e&&e.constructor!==Object;){b=Object.getOwnPropertyNames(e);for(var f=0,g=b.length;g>f;++f)d[b[f]]||(/^(constructor$|process$|_)/.test(b[f])?d[b[f]]="ignore":(c=Object.getOwnPropertyDescriptor(e,b[f]),"function"==typeof c.value?d[b[f]]="function":(c.get||c.set)&&(d[b[f]]="property")));e=Object.getPrototypeOf(e)}return d};Object.defineProperties(b,{version:{value:j},envtype:{value:n},envmobile:{value:o},env:{get:function(){return k.impl.env}},samplerate:{get:function(){return k.samplerate}},channels:{get:function(){return k.channels}},cellsize:{get:function(){return k.cellsize}},currentTime:{get:function(){return k.currentTime}},isPlaying:{get:function(){return k.status===e}},isRecording:{get:function(){return k.status===g}},amp:{set:function(a){"number"==typeof a&&(k.amp=a)},get:function(){return k.amp}},bpm:{set:function(a){"number"==typeof a&&a>=5&&300>=a&&(q=a)},get:function(){return q}}}),b.bind=function(a,c){return k.bind(a,c),b},b.setup=function(a){return k.setup(a),b},b.play=function(){return k.play(),b},b.pause=function(){return k.pause(),b},b.reset=function(){return k.reset(),k.events.emit("reset"),b},b.on=b.addListener=function(a,c){return k.on(a,c),b},b.once=function(a,c){return k.once(a,c),b},b.off=b.removeListener=function(a,c){return k.off(a,c),b},b.removeAllListeners=function(a){return k.removeAllListeners(a),b},b.listeners=function(a){return k.listeners(a)},b.rec=function(){return k.rec.apply(k,arguments)},b.timevalue=function(){var a=function(a){var b,c=q;return(b=/^bpm(\d+(?:\.\d+)?)/i.exec(a))&&(c=Math.max(5,Math.min(300,+(b[1]||0)))),c};return function(c){var d,e,f;if(d=/^(\d+(?:\.\d+)?)Hz$/i.exec(c))return 0===+d[1]?0:1e3/+d[1];if(d=/L(\d+)?(\.*)$/i.exec(c))return e=60/a(c)*(4/(d[1]||4))*1e3,e*=[1,1.5,1.75,1.875][(d[2]||"").length]||1;if(d=/^(\d+(?:\.\d+)?|\.(?:\d+))(min|sec|m)s?$/i.exec(c))switch(d[2]){case"min":return 60*+(d[1]||0)*1e3;case"sec":return 1e3*+(d[1]||0);case"m":return+(d[1]||0)}return(d=/^(?:([0-5]?[0-9]):)?(?:([0-5]?[0-9]):)(?:([0-5]?[0-9]))(?:\.([0-9]{1,3}))?$/.exec(c))?(f=3600*(d[1]||0)+60*(d[2]||0)+(d[3]||0),f=1e3*f+(0|((d[4]||"")+"00").substr(0,3))):(d=/(\d+)\.(\d+)\.(\d+)$/i.exec(c))?(f=480*(4*d[1]+ +d[2])+ +d[3],60/a(c)*(f/480)*1e3):(d=/(\d+)ticks$/i.exec(c))?60/a(c)*(d[1]/480)*1e3:(d=/^(\d+)samples(?:\/(\d+)Hz)?$/i.exec(c))?1e3*d[1]/(d[2]||b.samplerate):0}}();var t=b.fn={SignalArray:Float32Array,currentTimeIncr:0,emptycell:null,FINISHED_STATE:d,PLAYING_STATE:e,UNSCHEDULED_STATE:f,SCHEDULED_STATE:g},u=t.isArray=Array.isArray,v=t.isDictionary=function(a){return"object"==typeof a&&a.constructor===Object};t.nop=function(){return this},t.isSignalArray=function(a){return a instanceof t.SignalArray?!0:Array.isArray(a)&&a.__klass&&2===a.__klass.type?!0:!1},t.extend=function(a,b){function c(){this.constructor=a}b=b||A;for(var d in b)b.hasOwnProperty(d)&&(a[d]=b[d]);return c.prototype=b.prototype,a.prototype=new c,a.__super__=b.prototype,a},t.constructorof=function(a,b){for(var c=a&&a.prototype;c;){if(c===b.prototype)return!0;c=Object.getPrototypeOf(c)}return!1},t.register=function(a,b){t.constructorof(b,A)?l[a]=b:m[a]=b},t.alias=function(a,b){l[b]?l[a]=l[b]:m[b]&&(m[a]=m[b])},t.getClass=function(a){return l[a]},t.pointer=function(a,b,c){return b=a.byteOffset+b*a.constructor.BYTES_PER_ELEMENT,"number"==typeof c?new a.constructor(a.buffer,b,c):new a.constructor(a.buffer,b)},t.nextTick=function(a){return k.nextTick(a),b},t.fixAR=function(a){a._.ar=!0,a._.aronly=!0},t.fixKR=function(a){a._.ar=!1,a._.kronly=!0},t.changeWithValue=function(){var a=this._,b=a.value*a.mul+a.add;isNaN(b)&&(b=0);for(var c=this.cells[0],d=0,e=c.length;e>d;++d)c[d]=b},t.changeWithValue.unremovable=!0,t.clone=function(a){var b=new a.constructor([]);return b._.ar=a._.ar,b._.mul=a._.mul,b._.add=a._.add,b._.bypassed=a._.bypassed,b},t.timer=function(){var a=function(a){return function(){-1===k.timers.indexOf(a)&&(k.timers.push(a),k.events.emit("addObject"),a._.emit("start"),t.buddies_start(a))}},b=function(a){return function(){var b=k.timers.indexOf(a);-1!==b&&(k.timers.splice(b,1),a._.emit("stop"),k.events.emit("removeObject"),t.buddies_stop(a))}};return function(c){var d=a(c),e=b(c);return c.nodeType=A.TIMER,c.start=function(){return k.nextTick(d),c},c.stop=function(){return k.nextTick(e),c},c}}(),t.listener=function(){var a=function(a){return function(){-1===k.listeners.indexOf(a)&&(k.listeners.push(a),k.events.emit("addObject"),a._.emit("listen"),t.buddies_start(a))}},b=function(a){return function(){var b=k.listeners.indexOf(a);-1!==b&&(k.listeners.splice(b,1),a._.emit("unlisten"),k.events.emit("removeObject"),t.buddies_stop(a))}};return function(c){var d=a(c),e=b(c);return c.nodeType=A.LISTENER,c.listen=function(){return arguments.length&&c.append.apply(c,arguments),c.nodes.length&&k.nextTick(d),c},c.unlisten=function(){return arguments.length&&c.remove.apply(c,arguments),c.nodes.length||k.nextTick(e),c},c}}(),t.make_onended=function(a,b){return function(){if(a.playbackState=d,"number"==typeof b)for(var c=a.cells[0],e=a.cells[1],f=a.cells[2],g=0,h=e.length;h>g;++g)c[0]=e[g]=f[g]=b;a._.emit("ended")}},t.inputSignalAR=function(a){var b,c,d,f,g,h,i=a.cells[0],j=a.cells[1],k=a.cells[2],l=a.nodes,m=l.length,n=i.length,o=a.tickID;if(2===a.numChannels){if(d=!0,0!==m){for(b=0;m>b;++b)if(l[b].playbackState===e){l[b].process(o),j.set(l[b].cells[1]),k.set(l[b].cells[2]),d=!1,++b;break}for(;m>b;++b)if(l[b].playbackState===e)for(l[b].process(o),g=l[b].cells[1],h=l[b].cells[2],c=n;c;)c-=8,j[c]+=g[c],k[c]+=h[c],j[c+1]+=g[c+1],k[c+1]+=h[c+1],j[c+2]+=g[c+2],k[c+2]+=h[c+2],j[c+3]+=g[c+3],k[c+3]+=h[c+3],j[c+4]+=g[c+4],k[c+4]+=h[c+4],j[c+5]+=g[c+5],k[c+5]+=h[c+5],j[c+6]+=g[c+6],k[c+6]+=h[c+6],j[c+7]+=g[c+7],k[c+7]+=h[c+7]}d&&(j.set(t.emptycell),k.set(t.emptycell))}else{if(d=!0,0!==m){for(b=0;m>b;++b)if(l[b].playbackState===e){l[b].process(o),i.set(l[b].cells[0]),d=!1,++b;break}for(;m>b;++b)if(l[b].playbackState===e)for(f=l[b].process(o).cells[0],c=n;c;)c-=8,i[c]+=f[c],i[c+1]+=f[c+1],i[c+2]+=f[c+2],i[c+3]+=f[c+3],i[c+4]+=f[c+4],i[c+5]+=f[c+5],i[c+6]+=f[c+6],i[c+7]+=f[c+7]}d&&i.set(t.emptycell)}},t.inputSignalKR=function(a){var b,c=a.nodes,d=c.length,f=a.tickID,g=0;for(b=0;d>b;++b)c[b].playbackState===e&&(g+=c[b].process(f).cells[0][0]);return g},t.outputSignalAR=function(a){var b,c=a.cells[0],d=a.cells[1],e=a.cells[2],f=a._.mul,g=a._.add;if(2===a.numChannels)for(b=c.length;b;)b-=8,d[b]=d[b]*f+g,e[b]=e[b]*f+g,d[b+1]=d[b+1]*f+g,e[b+1]=e[b+1]*f+g,d[b+2]=d[b+2]*f+g,e[b+2]=e[b+2]*f+g,d[b+3]=d[b+3]*f+g,e[b+3]=e[b+3]*f+g,d[b+4]=d[b+4]*f+g,e[b+4]=e[b+4]*f+g,d[b+5]=d[b+5]*f+g,e[b+5]=e[b+5]*f+g,d[b+6]=d[b+6]*f+g,e[b+6]=e[b+6]*f+g,d[b+7]=d[b+7]*f+g,e[b+7]=e[b+7]*f+g,c[b]=.5*(d[b]+e[b]),c[b+1]=.5*(d[b+1]+e[b+1]),c[b+2]=.5*(d[b+2]+e[b+2]),c[b+3]=.5*(d[b+3]+e[b+3]),c[b+4]=.5*(d[b+4]+e[b+4]),c[b+5]=.5*(d[b+5]+e[b+5]),c[b+6]=.5*(d[b+6]+e[b+6]),c[b+7]=.5*(d[b+7]+e[b+7]);else if(1!==f||0!==g)for(b=c.length;b;)b-=8,c[b]=c[b]*f+g,c[b+1]=c[b+1]*f+g,c[b+2]=c[b+2]*f+g,c[b+3]=c[b+3]*f+g,c[b+4]=c[b+4]*f+g,c[b+5]=c[b+5]*f+g,c[b+6]=c[b+6]*f+g,c[b+7]=c[b+7]*f+g},t.outputSignalKR=function(a){var b,c=a.cells[0],d=a.cells[1],e=a.cells[2],f=a._.mul,g=a._.add,h=c[0]*f+g;if(2===a.numChannels)for(b=c.length;b;)b-=8,c[b]=c[b+1]=c[b+2]=c[b+3]=c[b+4]=c[b+5]=c[b+6]=c[b+7]=d[b]=d[b+1]=d[b+2]=d[b+3]=d[b+4]=d[b+5]=d[b+6]=d[b+7]=e[b]=e[b+1]=e[b+2]=e[b+3]=e[b+4]=e[b+5]=e[b+6]=e[b+7]=h;else for(b=c.length;b;)b-=8,c[b]=c[b+1]=c[b+2]=c[b+3]=c[b+4]=c[b+5]=c[b+6]=c[b+7]=h},t.buddies_start=function(a){var b,c,d,e=a._.buddies;for(c=0,d=e.length;d>c;++c)switch(b=e[c],b.nodeType){case A.DSP:b.play();break;case A.TIMER:b.start();break;case A.LISTENER:b.listen()}},t.buddies_stop=function(a){var b,c,d,e=a._.buddies;for(c=0,d=e.length;d>c;++c)switch(b=e[c],b.nodeType){case A.DSP:b.pause();break;case A.TIMER:b.stop();break;case A.LISTENER:b.unlisten()}},t.fix_iOS6_1_problem=function(a){k.fix_iOS6_1_problem(a)};var w,x=b.modules={},y=x.EventEmitter=function(){function a(a){this.context=a,this.events={}}var b=a.prototype;return b.emit=function(a){var b=this.events[a];if(!b)return!1;var d;if("function"==typeof b){switch(arguments.length){case 1:b.call(this.context);break;case 2:b.call(this.context,arguments[1]);break;case 3:b.call(this.context,arguments[1],arguments[2]);break;default:d=c.call(arguments,1),b.apply(this.context,d)}return!0}if(u(b)){d=c.call(arguments,1);for(var e=b.slice(),f=0,g=e.length;g>f;++f)e[f]instanceof A?e[f].bang.apply(e[f],d):e[f].apply(this.context,d);return!0}return b instanceof A?(d=c.call(arguments,1),void b.bang.apply(b,d)):!1},b.on=function(a,b){if("function"!=typeof b&&!(b instanceof A))throw new Error("addListener takes instances of Function or timbre.Object");var c=this.events;return c[a]?u(c[a])?c[a].push(b):c[a]=[c[a],b]:c[a]=b,this},b.once=function(a,b){var c,d=this;if("function"==typeof b)c=function(){d.off(a,c),b.apply(d.context,arguments)};else{if(!(b instanceof A))throw new Error("once takes instances of Function or timbre.Object");c=function(){d.off(a,c),b.bang.apply(b,arguments)}}return c.listener=b,d.on(a,c),this},b.off=function(a,b){if("function"!=typeof b&&!(b instanceof A))throw new Error("removeListener takes instances of Function or timbre.Object");var c=this.events;if(!c[a])return this;var d=c[a];if(u(d)){for(var e=-1,f=0,g=d.length;g>f;++f)if(d[f]===b||d[f].listener&&d[f].listener===b){e=f;break}if(0>e)return this;d.splice(e,1),0===d.length&&(c[a]=null)}else(d===b||d.listener&&d.listener===b)&&(c[a]=null);return this},b.removeAllListeners=function(a){var b=this.events,c=!1,d=b[a];if(u(d))for(var e=d.length;e--;){var f=d[e];f.unremovable?c=!0:this.off(a,f)}else d&&(d.unremovable?c=!0:this.off(a,d));return c||(b[a]=null),this},b.listeners=function(a){var b,c=this.events;if(!c[a])return[];if(c=c[a],!u(c))return c.unremovable?[]:[c];c=c.slice(),b=[];for(var d=0,e=c.length;e>d;++d)c[d].unremovable||b.push(c[d]);return b},a}(),z=x.Deferred=function(){function a(a){this.context=a||this,this._state="pending",this._doneList=[],this._failList=[],this._promise=new b(this)}function b(a){this.context=a.context,this.then=a.then,this.done=function(){return a.done.apply(a,arguments),this},this.fail=function(){return a.fail.apply(a,arguments),this},this.pipe=function(){return a.pipe.apply(a,arguments)},this.always=function(){return a.always.apply(a,arguments),this},this.promise=function(){return this},this.isResolved=function(){return a.isResolved()},this.isRejected=function(){return a.isRejected()}}var d=a.prototype,e=function(a,b,c,d){if("pending"===this._state){this._state=a;for(var e=0,f=b.length;f>e;++e)b[e].apply(c,d);this._doneList=this._failList=null}},f=function(a){return a&&"function"==typeof a.promise};return d.resolve=function(){var a=c.call(arguments,0);return e.call(this,"resolved",this._doneList,this.context||this,a),this},d.resolveWith=function(a){var b=c.call(arguments,1);return e.call(this,"resolved",this._doneList,a,b),this},d.reject=function(){var a=c.call(arguments,0);return e.call(this,"rejected",this._failList,this.context||this,a),this},d.rejectWith=function(a){var b=c.call(arguments,1);return e.call(this,"rejected",this._failList,a,b),this},d.promise=function(){return this._promise},d.done=function(){for(var a=c.call(arguments),b="resolved"===this._state,d="pending"===this._state,e=this._doneList,f=0,g=a.length;g>f;++f)"function"==typeof a[f]&&(b?a[f]():d&&e.push(a[f]));return this},d.fail=function(){for(var a=c.call(arguments),b="rejected"===this._state,d="pending"===this._state,e=this._failList,f=0,g=a.length;g>f;++f)"function"==typeof a[f]&&(b?a[f]():d&&e.push(a[f]));return this},d.always=function(){return this.done.apply(this,arguments),this.fail.apply(this,arguments),this},d.then=function(a,b){return this.done(a).fail(b)},d.pipe=function(b,d){var e=this,g=new a(this.context);return this.done(function(){var a=b.apply(e.context,arguments);f(a)?a.then(function(){var b=c.call(arguments);g.resolveWith.apply(g,[a].concat(b))}):g.resolveWith(e,a)}),this.fail(function(){if("function"==typeof d){var a=d.apply(e.context,arguments);f(a)&&a.fail(function(){var b=c.call(arguments);g.rejectWith.apply(g,[a].concat(b))})}else g.reject.apply(g,arguments)}),g.promise()},d.isResolved=function(){return"resolved"===this._state},d.isRejected=function(){return"rejected"===this._state},d.state=function(){return this._state},a.when=function(b){var d=0,e=c.call(arguments),g=e.length,h=g;1!==g||f(b)||(h=0);var i=1===h?b:new a,j=function(a,b){return function(d){b[a]=arguments.length>1?c.call(arguments):d,--h||i.resolve.apply(i,b)}};if(g>1)for(var k=new Array(g),l=function(){i.reject()};g>d;++d)e[d]&&f(e[d])?e[d].promise().done(j(d,k)).fail(l):(k[d]=e[d],--h);return h||i.resolve.apply(i,e),i.promise()},a}(),A=b.Object=function(){function d(a,c){this._={};var f=this._.events=new y(this);if(this._.emit=function(){return f.emit.apply(f,arguments)},v(c[0])){var g=c.shift(),h=g["in"];this.once("init",function(){this.set(g),h&&(u(h)?this.append.apply(this,h):h instanceof d&&this.append(h))})}switch(this.tickID=-1,this.nodes=c.map(b),this.cells=[],this.numChannels=a,a){case 0:this.L=this.R=new B(null),this.cells[0]=this.cells[1]=this.cells[2]=this.L.cell;break;case 1:this.L=this.R=new B(this),this.cells[0]=this.cells[1]=this.cells[2]=this.L.cell;break;case 2:this.L=new B(this),this.R=new B(this),this.cells[0]=new t.SignalArray(k.cellsize),this.cells[1]=this.L.cell,this.cells[2]=this.R.cell}this.playbackState=e,this.nodeType=d.DSP,this._.ar=!0,this._.mul=1,this._.add=0,this._.dac=null,this._.bypassed=!1,this._.meta={},this._.samplerate=k.samplerate,this._.cellsize=k.cellsize,this._.buddies=[]}d.DSP=1,d.TIMER=2,d.LISTENER=3;var f=d.prototype;return Object.defineProperties(f,{isAr:{get:function(){return this._.ar}},isKr:{get:function(){return!this._.ar}},isBypassed:{get:function(){return this._.bypassed}},isEnded:{get:function(){return!(1&this.playbackState)}},mul:{set:function(a){"number"==typeof a&&(this._.mul=a,this._.emit("setMul",a))},get:function(){return this._.mul}},add:{set:function(a){"number"==typeof a&&(this._.add=a,this._.emit("setAdd",a))},get:function(){return this._.add}},buddies:{set:function(a){u(a)||(a=[a]),this._.buddies=a.filter(function(a){return a instanceof d})},get:function(){return this._.buddies}}}),f.toString=function(){return this.constructor.name},f.valueOf=function(){return k.tickID!==this.tickID&&this.process(k.tickID),this.cells[0][0]},f.append=function(){if(arguments.length>0){var a=c.call(arguments).map(b);this.nodes=this.nodes.concat(a),this._.emit("append",a)}return this},f.appendTo=function(a){return a.append(this),this},f.remove=function(){if(arguments.length>0){for(var a,b=this.nodes,c=[],d=0,e=arguments.length;e>d;++d)-1!==(a=b.indexOf(arguments[d]))&&(c.push(b[a]),b.splice(a,1));c.length>0&&this._.emit("remove",c)}return this},f.removeFrom=function(a){return a.remove(this),this},f.removeAll=function(){var a=this.nodes.slice();return this.nodes=[],a.length>0&&this._.emit("remove",a),this},f.removeAtIndex=function(a){var b=this.nodes[a];return b&&(this.nodes.splice(a,1),this._.emit("remove",[b])),this},f.postMessage=function(a){return this._.emit("message",a),this},f.to=function(a){if(a instanceof d)a.append(this);else{var b=c.call(arguments);v(b[1])?b.splice(2,0,this):b.splice(1,0,this),a=r.apply(null,b)}return a},f.splice=function(a,b,c){var e;return b?b instanceof d&&(e=b.nodes.indexOf(c),-1!==e&&b.nodes.splice(e,1),a instanceof d?(a.nodes.push(this),b.nodes.push(a)):b.nodes.push(this)):this._.dac&&(a instanceof d?c instanceof d?c._.dac&&(c._.dac._.node=a,a._.dac=c._.dac,c._.dac=null,a.nodes.push(this)):this._.dac&&(this._.dac._.node=a,a._.dac=this._.dac,this._.dac=null,a.nodes.push(this)):c instanceof d&&c._.dac&&(c._.dac._.node=this,this._.dac=c._.dac,c._.dac=null)),this},f.on=f.addListener=function(a,b){return this._.events.on(a,b),this},f.once=function(a,b){return this._.events.once(a,b),this},f.off=f.removeListener=function(a,b){return this._.events.off(a,b),this},f.removeAllListeners=function(a){return this._.events.removeAllListeners(a),this},f.listeners=function(a){return this._.events.listeners(a)},f.set=function(a,b){var c,d,e=this._.meta;switch(typeof a){case"string":switch(e[a]){case"property":this[a]=b;break;case"function":this[a](b);break;default:for(c=this;null!==c;)d=Object.getOwnPropertyDescriptor(c,a),d&&("function"==typeof d.value?(e[a]="function",this[a](b)):(d.get||d.set)&&(e[a]="property",this[a]=b)),c=Object.getPrototypeOf(c)}break;case"object":for(c in a)this.set(c,a[c])}return this},f.get=function(a){return"property"===this._.meta[a]?this[a]:void 0},f.bang=function(){return this._.emit.apply(this,["bang"].concat(c.call(arguments))),this},f.process=t.nop,f.bypass=function(){return this._.bypassed=0===arguments.length?!0:!!arguments[0],this},f.play=function(){var a=this._.dac;return null===a&&(a=this._.dac=new I(this)),a.play()&&this._.emit.apply(this,["play"].concat(c.call(arguments))),t.buddies_start(this),this},f.pause=function(){var a=this._.dac;return a&&a.playbackState===e&&(a.pause(),this._.dac=null,this._.emit("pause")),t.buddies_stop(this),this},f.start=f.stop=f.listen=f.unlisten=function(){return this},f.ar=function(){return(0===arguments.length?0:!arguments[0])?this.kr(!0):this._.kronly||(this._.ar=!0,this._.emit("ar",!0)),this},f.kr=function(){return(0===arguments.length?0:!arguments[0])?this.ar(!0):this._.aronly||(this._.ar=!1,this._.emit("ar",!1)),this},f.plot="browser"===n?function(b){var c=this._,d=b.target;if(!d)return this;var e,f=b.width||d.width||320,g=b.height||d.height||240,h=(b.x||0)+.5,i=b.y||0,j=d.getContext("2d");e=b.foreground!==a?b.foreground:c.plotForeground||"rgb(  0, 128, 255)";var k;k=b.background!==a?b.background:c.plotBackground||"rgb(255, 255, 255)";var l,m,n,o,p,q=b.lineWidth||c.plotLineWidth||1,r=!!c.plotCyclic,s=c.plotData||this.cells[0],t=b.range||c.plotRange||[-1.2,1.2],u=t[0],v=g/(t[1]-u),w=f/s.length,x=s.length;if(j.save(),j.rect(h,i,f,g),null!==k&&(j.fillStyle=k,j.fillRect(h,i,f,g)),c.plotBefore&&c.plotBefore.call(this,j,h,i,f,g),c.plotBarStyle)for(j.fillStyle=e,l=0,p=0;x>p;++p)n=(s[p]-u)*v,m=g-n,j.fillRect(l+h,m+i,w,n),l+=w;else{for(j.strokeStyle=e,j.lineWidth=q,j.beginPath(),l=0,o=g-(s[0]-u)*v,j.moveTo(l+h,o+i),p=1;x>p;++p)l+=w,m=g-(s[p]-u)*v,j.lineTo(l+h,m+i);r?j.lineTo(l+w+h,o+i):j.lineTo(l+w+h,m+i),j.stroke()}c.plotAfter&&c.plotAfter.call(this,j,h,i,f,g);var y=b.border||c.plotBorder;return y&&(j.strokeStyle="string"==typeof y?y:"#000",j.lineWidth=1,j.strokeRect(h,i,f,g)),j.restore(),this}:t.nop,d}(),B=b.ChannelObject=function(){function a(a){b.Object.call(this,-1,[]),t.fixAR(this),this._.parent=a,this.cell=new t.SignalArray(k.cellsize),this.L=this.R=this,this.cells[0]=this.cells[1]=this.cells[2]=this.cell,this.numChannels=1}return t.extend(a),a.prototype.process=function(a){return this.tickID!==a&&(this.tickID=a,this._.parent&&this._.parent.process(a)),this},a}(),C=function(){function a(a){A.call(this,2,a)}return t.extend(a),a.prototype.process=function(a){var b=this._;return this.tickID!==a&&(this.tickID=a,b.ar?(t.inputSignalAR(this),t.outputSignalAR(this)):(this.cells[0][0]=t.inputSignalKR(this),t.outputSignalKR(this))),this},t.register("+",a),a}(),D=function(){function a(a){if(A.call(this,1,[]),t.fixKR(this),this.value=a[0],v(a[1])){var b=a[1];this.once("init",function(){this.set(b)})}this.on("setAdd",t.changeWithValue),this.on("setMul",t.changeWithValue)}t.extend(a);var b=a.prototype;return Object.defineProperties(b,{value:{set:function(a){"number"==typeof a&&(this._.value=isNaN(a)?0:a,t.changeWithValue.call(this))},get:function(){return this._.value}}}),a}(),E=function(){function a(a){if(A.call(this,1,[]),t.fixKR(this),this.value=a[0],v(a[1])){var b=a[1];this.once("init",function(){this.set(b)})}this.on("setAdd",t.changeWithValue),this.on("setMul",t.changeWithValue)}t.extend(a);var b=a.prototype;return Object.defineProperties(b,{value:{set:function(a){this._.value=a?1:0,t.changeWithValue.call(this)},get:function(){return!!this._.value}}}),a}(),F=function(){function a(a){if(A.call(this,1,[]),t.fixKR(this),this.func=a[0],this._.value=0,v(a[1])){var b=a[1];this.once("init",function(){this.set(b)})}this.on("setAdd",t.changeWithValue),this.on("setMul",t.changeWithValue)}t.extend(a);var b=a.prototype;return Object.defineProperties(b,{func:{set:function(a){"function"==typeof a&&(this._.func=a)},get:function(){return this._.func}},args:{set:function(a){this._.args=u(a)?a:[a]},get:function(){return this._.args}}}),b.bang=function(){var a=this._,b=c.call(arguments).concat(a.args),d=a.func.apply(this,b);return"number"==typeof d&&(a.value=d,t.changeWithValue.call(this)),this._.emit("bang"),this},a}(),G=function(){function a(a){A.call(this,1,[]);var b,c;for(b=0,c=a[0].length;c>b;++b)this.append(a[0][b]);if(v(a[1])){var d=a[1];this.once("init",function(){this.set(d)})}}t.extend(a);var b=a.prototype;return Object.defineProperties(b,{}),b.bang=function(){var a,b,d=["bang"].concat(c.call(arguments)),e=this.nodes;for(a=0,b=e.length;b>a;++a)e[a].bang.apply(e[a],d);return this},b.postMessage=function(a){var b,c,d=this.nodes;for(b=0,c=d.length;c>b;++b)d[b].postMessage(a);return this},b.process=function(a){var b=this._;return this.tickID!==a&&(this.tickID=a,b.ar?(t.inputSignalAR(this),t.outputSignalAR(this)):(this.cells[0][0]=t.inputSignalKR(this),t.outputSignalKR(this))),this},a}(),H=function(){function a(a){if(A.call(this,1,[]),t.fixKR(this),v(a[1])){var b=a[1];this.once("init",function(){this.set(b)})}}t.extend(a);var b=a.prototype;return Object.defineProperties(b,{}),a}(),I=function(){function a(a){A.call(this,2,[]),this.playbackState=d;var e=this._;e.node=a,e.onplay=b(this),e.onpause=c(this)}t.extend(a);var b=function(a){return function(){-1===k.inlets.indexOf(a)&&(k.inlets.push(a),k.events.emit("addObject"),a.playbackState=e,a._.emit("play"))}},c=function(a){return function(){var b=k.inlets.indexOf(a);-1!==b&&(k.inlets.splice(b,1),a.playbackState=d,a._.emit("pause"),k.events.emit("removeObject"))}},f=a.prototype;return f.play=function(){return k.nextTick(this._.onplay),-1===k.inlets.indexOf(this)},f.pause=function(){k.nextTick(this._.onpause)},f.process=function(a){var b=this._.node;1&b.playbackState?(b.process(a),this.cells[1].set(b.cells[1]),this.cells[2].set(b.cells[2])):(this.cells[1].set(t.emptycell),this.cells[2].set(t.emptycell))},a}(),J=function(){function a(){this.context=this,this.tickID=0,this.impl=null,this.amp=.8,this.status=d,this.samplerate=44100,this.channels=2,this.cellsize=64,this.streammsec=20,this.streamsize=0,this.currentTime=0,this.nextTicks=[],this.inlets=[],this.timers=[],this.listeners=[],this.deferred=null,this.recStart=0,this.recBuffers=null,this.delayProcess=b(this),this.events=null,t.currentTimeIncr=1e3*this.cellsize/this.samplerate,t.emptycell=new t.SignalArray(this.cellsize),this.reset(!0)}var b=function(a){return function(){a.recStart=Date.now(),a.process()}},f=a.prototype;f.bind=function(a,b){if("function"==typeof a){var c=new a(this,b);this.impl=c,this.impl.defaultSamplerate&&(this.samplerate=this.impl.defaultSamplerate)}return this},f.setup=function(a){return"object"==typeof a&&(-1!==h.indexOf(a.samplerate)&&(this.samplerate=a.samplerate<=this.impl.maxSamplerate?a.samplerate:this.impl.maxSamplerate),-1!==i.indexOf(a.cellsize)&&(this.cellsize=a.cellsize),"undefined"!=typeof Float64Array&&"undefined"!=typeof a.f64&&(p=!!a.f64,t.SignalArray=p?Float64Array:Float32Array)),t.currentTimeIncr=1e3*this.cellsize/this.samplerate,t.emptycell=new t.SignalArray(this.cellsize),this},f.getAdjustSamples=function(a){var b,c;return a=a||this.samplerate,b=this.streammsec/1e3*a,c=Math.ceil(Math.log(b)*Math.LOG2E),c=8>c?8:c>14?14:c,1<<c},f.play=function(){return this.status===d&&(this.status=e,this.streamsize=this.getAdjustSamples(),this.strmL=new t.SignalArray(this.streamsize),this.strmR=new t.SignalArray(this.streamsize),this.impl.play(),this.events.emit("play")),this},f.pause=function(){return this.status===e&&(this.status=d,this.impl.pause(),this.events.emit("pause")),this},f.reset=function(a){return a&&(this.events=new y(this).on("addObject",function(){this.status===d&&this.play()}).on("removeObject",function(){this.status===e&&this.inlets.length+this.timers.length+this.listeners.length===0&&this.pause()})),this.currentTime=0,this.nextTicks=[],this.inlets=[],this.timers=[],this.listeners=[],this},f.process=function(){var a,b,c,d,e,f,h,i,j=this.tickID,k=this.strmL,l=this.strmR,m=this.amp,n=this.streamsize,o=0,p=this.cellsize,q=this.streamsize/this.cellsize,r=this.timers,s=this.inlets,u=this.listeners,v=t.currentTimeIncr;for(d=0;n>d;++d)k[d]=l[d]=0;for(;q--;){for(++j,e=0,f=r.length;f>e;++e)1&r[e].playbackState&&r[e].process(j);for(e=0,f=s.length;f>e;++e)if(a=s[e],a.process(j),1&a.playbackState)for(b=a.cells[1],c=a.cells[2],h=0,d=o;p>h;++h,++d)k[d]+=b[h],l[d]+=c[h];for(o+=p,e=0,f=u.length;f>e;++e)1&u[e].playbackState&&u[e].process(j);for(this.currentTime+=v,i=this.nextTicks.splice(0),e=0,f=i.length;f>e;++e)i[e]()}for(d=0;n>d;++d)a=k[d]*m,-1>a?a=-1:a>1&&(a=1),k[d]=a,a=l[d]*m,-1>a?a=-1:a>1&&(a=1),l[d]=a;this.tickID=j;var w=this.currentTime;if(this.status===g){if(2===this.recCh)this.recBuffers.push(new t.SignalArray(k)),this.recBuffers.push(new t.SignalArray(l));else{var x=new t.SignalArray(k.length);for(d=0,n=x.length;n>d;++d)x[d]=.5*(k[d]+l[d]);this.recBuffers.push(x)}if(w>=this.maxDuration)this.deferred.sub.reject();else if(w>=this.recDuration)this.deferred.sub.resolve();else{var y=Date.now();y-this.recStart>20?setTimeout(this.delayProcess,10):this.process()}}},f.nextTick=function(a){this.status===d?a():this.nextTicks.push(a)},f.rec=function(){t.fix_iOS6_1_problem(!0);var a=new z(this);if(this.deferred)return console.warn("rec deferred is exists??"),a.reject().promise();if(this.status!==d)return console.log("status is not none",this.status),a.reject().promise();var b=0,e=arguments,f=v(e[b])?e[b++]:{},h=e[b];if("function"!=typeof h)return console.warn("no function"),a.reject().promise();this.deferred=a,this.status=g,this.reset();var i=new r("+"),k=new z(this),l={done:function(){k.resolve.apply(k,c.call(arguments))},send:function(){i.append.apply(i,arguments)}},m=this;return k.then(j,function(){t.fix_iOS6_1_problem(!1),j.call(m,!0)}),this.deferred.sub=k,this.savedSamplerate=this.samplerate,this.samplerate=f.samplerate||this.samplerate,this.recDuration=f.recDuration||1/0,this.maxDuration=f.maxDuration||6e5,this.recCh=f.ch||1,2!==this.recCh&&(this.recCh=1),this.recBuffers=[],this.streamsize=this.getAdjustSamples(),this.strmL=new t.SignalArray(this.streamsize),this.strmR=new t.SignalArray(this.streamsize),this.inlets.push(i),h(l),setTimeout(this.delayProcess,10),a.promise()};var j=function(){this.status=d,this.reset();var a,b=this.recBuffers,c=this.samplerate,e=this.streamsize;this.samplerate=this.savedSamplerate,a=1/0!==this.recDuration?this.recDuration*c*.001|0:(b.length>>this.recCh-1)*e;var f,g,h=a/e|0,i=0,j=0,k=a;if(2===this.recCh){var l=new t.SignalArray(a),m=new t.SignalArray(a),n=new t.SignalArray(a);for(g=0;h>g;++g)if(l.set(b[i++],j),m.set(b[i++],j),j+=e,k-=e,k>0&&e>k){l.set(b[i++].subarray(0,k),j),m.set(b[i++].subarray(0,k),j);break}for(g=0,h=a;h>g;++g)n[g]=.5*(l[g]+m[g]);f={samplerate:c,channels:2,buffer:[n,l,m]}}else{var o=new t.SignalArray(a);for(g=0;h>g;++g)if(o.set(b[i++],j),j+=e,k-=e,k>0&&e>k){o.set(b[i++].subarray(0,k),j);break}f={samplerate:c,channels:1,buffer:[o]}}var p=[].concat.apply([f],arguments);this.deferred.resolve.apply(this.deferred,p),this.deferred=null};return f.on=function(a,b){this.events.on(a,b)},f.once=function(a,b){this.events.once(a,b)},f.off=function(a,b){this.events.off(a,b)},f.removeAllListeners=function(a){this.events.removeListeners(a)},f.listeners=function(a){return this.events.listeners(a)},f.fix_iOS6_1_problem=function(a){this.impl.fix_iOS6_1_problem&&this.impl.fix_iOS6_1_problem(a)},a}(),K=null;"undefined"!=typeof window&&(w=window.AudioContext||window.webkitAudioContext),K="undefined"!=typeof w?function(a){var b,c,d=new w;t._audioContext=d,this.maxSamplerate=d.sampleRate,this.defaultSamplerate=d.sampleRate,this.env="webkit";var e=navigator.userAgent;if(e.match(/linux/i)?a.streammsec*=8:e.match(/win(dows)?\s*(nt 5\.1|xp)/i)&&(a.streammsec*=4),this.play=function(){var e,f,g,h=a.getAdjustSamples(d.sampleRate),i=a.streamsize;a.samplerate===d.sampleRate?e=function(b){var c=b.outputBuffer;a.process(),c.getChannelData(0).set(a.strmL),c.getChannelData(1).set(a.strmR)}:2*a.samplerate===d.sampleRate?e=function(b){var c,d,e=a.strmL,f=a.strmR,g=b.outputBuffer,h=g.getChannelData(0),i=g.getChannelData(1),j=g.length;for(a.process(),c=d=0;j>c;c+=2,++d)h[c]=h[c+1]=e[d],i[c]=i[c+1]=f[d]}:(f=i,g=a.samplerate/d.sampleRate,e=function(b){var c,d=a.strmL,e=a.strmR,h=b.outputBuffer,j=h.getChannelData(0),k=h.getChannelData(1),l=h.length;for(c=0;l>c;++c)f>=i&&(a.process(),f-=i),j[c]=d[0|f],k[c]=e[0|f],f+=g}),b=d.createBufferSource(),c=d.createScriptProcessor(h,2,a.channels),c.onaudioprocess=e,b.noteOn&&b.noteOn(0),b.connect(c),c.connect(d.destination)},this.pause=function(){b.disconnect(),c.disconnect()},o){var f=0,g=d.createBufferSource();this.fix_iOS6_1_problem=function(a){f+=a?1:-1,1===f?(g.noteOn(0),g.connect(d.destination)):0===f&&g.disconnect()}}}:function(){this.maxSamplerate=48e3,this.defaultSamplerate=44100,this.env="nop",this.play=function(){},this.pause=function(){}},k=(new J).bind(K);var L=b;"node"===n||"undefined"!=typeof module&&module.exports?module.exports=global.timbre=L:"browser"===n&&(L.noConflict=function(){var a=window.timbre,b=window.T;return function(c){return window.T===L&&(window.T=b),c&&window.timbre===L&&(window.timbre=a),L}}(),window.timbre=window.T=L),function(){function a(a){try{return b.plugins&&b.mimeTypes&&b.mimeTypes.length?b.plugins["Shockwave Flash"].description.match(/([0-9]+)/)[a]:new ActiveXObject("ShockwaveFlash.ShockwaveFlash").GetVariable("$version").match(/([0-9]+)/)[a]}catch(c){return-1}}if("nop"===k.impl.env&&"browser"===n&&!o){var b=navigator;if(!(a(0)<10)){var c,d="TimbreFlashPlayerDiv",e=function(){var a=document.getElementsByTagName("script");if(a&&a.length)for(var b,c=0,d=a.length;d>c;++c)if(b=/^(.*\/)timbre(?:\.dev)?\.js$/i.exec(a[c].src))return b[1]+"timbre.swf"}();window.timbrejs_flashfallback_init=function(){function a(a){var b=0;this.maxSamplerate=44100,this.defaultSamplerate=44100,this.env="flash",this.play=function(){var d,f=new Array(a.streamsize*a.channels),g=a.streammsec,h=0,i=a.streamsize/a.samplerate*1e3,j=Date.now();d=function(){if(!(h>Date.now()-j)){var b=a.strmL,d=a.strmR,e=f.length,g=b.length;for(a.process();g--;)f[--e]=32768*d[g]|0,f[--e]=32768*b[g]|0;c.writeAudio(f.join(" ")),h+=i}},c.setup?(c.setup(a.channels,a.samplerate),b=setInterval(d,g)):console.warn("Cannot find "+e)},this.pause=function(){0!==b&&(c.cancel(),clearInterval(b),b=0)}}k.bind(a),delete window.timbrejs_flashfallback_init};var f,g,h=e,i=h+"?"+ +new Date,j="TimbreFlashPlayer",l=document.createElement("div");l.id=d,l.style.display="inline",l.width=l.height=1,b.plugins&&b.mimeTypes&&b.mimeTypes.length?(f=document.createElement("object"),f.id=j,f.classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000",f.width=f.height=1,f.setAttribute("data",i),f.setAttribute("type","application/x-shockwave-flash"),g=document.createElement("param"),g.setAttribute("name","allowScriptAccess"),g.setAttribute("value","always"),f.appendChild(g),l.appendChild(f)):l.innerHTML='<object id="'+j+'" classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" width="1" height="1"><param name="movie" value="'+i+'" /><param name="bgcolor" value="#FFFFFF" /><param name="quality" value="high" /><param name="allowScriptAccess" value="always" /></object>',window.addEventListener("load",function(){document.body.appendChild(l),c=document[j]
})}}}()}(),function(a){"use strict";function b(a){this.samplerate=a,this.frequency=340,this.Q=1,this.gain=0,this.x1L=this.x2L=this.y1L=this.y2L=0,this.x1R=this.x2R=this.y1R=this.y2R=0,this.b0=this.b1=this.b2=this.a1=this.a2=0,this.setType("lpf")}var c=b.prototype;c.process=function(a,b){var c,d,e,f,g,h,i=this.x1L,j=this.x2L,k=this.y1L,l=this.y2L,m=this.x1R,n=this.x2R,o=this.y1R,p=this.y2R,q=this.b0,r=this.b1,s=this.b2,t=this.a1,u=this.a2;for(g=0,h=a.length;h>g;++g)c=a[g],e=q*c+r*i+s*j-t*k-u*l,j=i,i=c,l=k,k=e,d=b[g],f=q*d+r*m+s*n-t*o-u*p,n=m,m=d,p=o,o=f,a[g]=e,b[g]=f;this.x1L=i,this.x2L=j,this.y1L=k,this.y2L=l,this.x1R=m,this.x2R=n,this.y1R=o,this.y2R=p},c.setType=function(a){var b;(b=d[a])&&(this.type=a,b.call(this,this.frequency,this.Q,this.gain))},c.setParams=function(a,b,c){this.frequency=a,this.Q=b,this.gain=c;var e=d[this.type];return e&&e.call(this,a,b,c),this};var d={lowpass:function(a,b){if(a/=.5*this.samplerate,a>=1)this.b0=1,this.b1=this.b2=this.a1=this.a2=0;else if(0>=a)this.b0=this.b1=this.b2=this.a1=this.a2=0;else{b=0>b?0:b;var c=Math.pow(10,.05*b),d=Math.sqrt(.5*(4-Math.sqrt(16-16/(c*c)))),e=Math.PI*a,f=.5*d*Math.sin(e),g=.5*(1-f)/(1+f),h=(.5+g)*Math.cos(e),i=.25*(.5+g-h);this.b0=2*i,this.b1=4*i,this.b2=this.b0,this.a1=2*-h,this.a2=2*g}},highpass:function(a,b){if(a/=.5*this.samplerate,a>=1)this.b0=this.b1=this.b2=this.a1=this.a2=0;else if(0>=a)this.b0=1,this.b1=this.b2=this.a1=this.a2=0;else{b=0>b?0:b;var c=Math.pow(10,.05*b),d=Math.sqrt((4-Math.sqrt(16-16/(c*c)))/2),e=Math.PI*a,f=.5*d*Math.sin(e),g=.5*(1-f)/(1+f),h=(.5+g)*Math.cos(e),i=.25*(.5+g+h);this.b0=2*i,this.b1=-4*i,this.b2=this.b0,this.a1=2*-h,this.a2=2*g}},bandpass:function(a,b){if(a/=.5*this.samplerate,a>0&&1>a)if(b>0){var c=Math.PI*a,d=Math.sin(c)/(2*b),e=Math.cos(c),f=1/(1+d);this.b0=d*f,this.b1=0,this.b2=-d*f,this.a1=-2*e*f,this.a2=(1-d)*f}else this.b0=this.b1=this.b2=this.a1=this.a2=0;else this.b0=this.b1=this.b2=this.a1=this.a2=0},lowshelf:function(a,b,c){a/=.5*this.samplerate;var d=Math.pow(10,c/40);if(a>=1)this.b0=d*d,this.b1=this.b2=this.a1=this.a2=0;else if(0>=a)this.b0=1,this.b1=this.b2=this.a1=this.a2=0;else{var e=Math.PI*a,f=1,g=.5*Math.sin(e)*Math.sqrt((d+1/d)*(1/f-1)+2),h=Math.cos(e),i=2*Math.sqrt(d)*g,j=d+1,k=d-1,l=1/(j+k*h+i);this.b0=d*(j-k*h+i)*l,this.b1=2*d*(k-j*h)*l,this.b2=d*(j-k*h-i)*l,this.a1=-2*(k+j*h)*l,this.a2=(j+k*h-i)*l}},highshelf:function(a,b,c){a/=.5*this.samplerate;var d=Math.pow(10,c/40);if(a>=1)this.b0=1,this.b1=this.b2=this.a1=this.a2=0;else if(0>=a)this.b0=d*d,this.b1=this.b2=this.a1=this.a2=0;else{var e=Math.PI*a,f=1,g=.5*Math.sin(e)*Math.sqrt((d+1/d)*(1/f-1)+2),h=Math.cos(e),i=2*Math.sqrt(d)*g,j=d+1,k=d-1,l=1/(j-k*h+i);this.b0=d*(j+k*h+i)*l,this.b1=-2*d*(k+j*h)*l,this.b2=d*(j+k*h-i)*l,this.a1=2*(k-j*h)*l,this.a2=(j-k*h-i)*l}},peaking:function(a,b,c){if(a/=.5*this.samplerate,a>0&&1>a){var d=Math.pow(10,c/40);if(b>0){var e=Math.PI*a,f=Math.sin(e)/(2*b),g=Math.cos(e),h=1/(1+f/d);this.b0=(1+f*d)*h,this.b1=-2*g*h,this.b2=(1-f*d)*h,this.a1=this.b1,this.a2=(1-f/d)*h}else this.b0=d*d,this.b1=this.b2=this.a1=this.a2=0}else this.b0=1,this.b1=this.b2=this.a1=this.a2=0},notch:function(a,b){if(a/=.5*this.samplerate,a>0&&1>a)if(b>0){var c=Math.PI*a,d=Math.sin(c)/(2*b),e=Math.cos(c),f=1/(1+d);this.b0=f,this.b1=-2*e*f,this.b2=f,this.a1=this.b1,this.a2=(1-d)*f}else this.b0=this.b1=this.b2=this.a1=this.a2=0;else this.b0=1,this.b1=this.b2=this.a1=this.a2=0},allpass:function(a,b){if(a/=.5*this.samplerate,a>0&&1>a)if(b>0){var c=Math.PI*a,d=Math.sin(c)/(2*b),e=Math.cos(c),f=1/(1+d);this.b0=(1-d)*f,this.b1=-2*e*f,this.b2=(1+d)*f,this.a1=this.b1,this.a2=this.b0}else this.b0=-1,this.b1=this.b2=this.a1=this.a2=0;else this.b0=1,this.b1=this.b2=this.a1=this.a2=0}};d.lpf=d.lowpass,d.hpf=d.highpass,d.bpf=d.bandpass,d.bef=d.notch,d.brf=d.notch,d.apf=d.allpass,a.modules.Biquad=b}(timbre),function(a){"use strict";function b(b){this.samplerate=b;var c=Math.round(Math.log(.1*b)*Math.LOG2E);this.buffersize=1<<c,this.bufferL=new a.fn.SignalArray(this.buffersize+1),this.bufferR=new a.fn.SignalArray(this.buffersize+1),this.wave=null,this._wave=null,this.writeIndex=this.buffersize>>1,this.readIndex=0,this.delayTime=20,this.rate=4,this.depth=20,this.feedback=.2,this.wet=.5,this.phase=0,this.phaseIncr=0,this.phaseStep=4,this.setWaveType("sin"),this.setDelayTime(this.delayTime),this.setRate(this.rate)}var c=b.prototype,d=[];d[0]=function(){for(var a=new Float32Array(512),b=0;512>b;++b)a[b]=Math.sin(2*Math.PI*(b/512));return a}(),d[1]=function(){for(var a,b=new Float32Array(512),c=0;512>c;++c)a=c/512-.25,b[c]=1-4*Math.abs(Math.round(a)-a);return b}(),c.setWaveType=function(a){"sin"===a?(this.wave=a,this._wave=d[0]):"tri"===a&&(this.wave=a,this._wave=d[1])},c.setDelayTime=function(a){this.delayTime=a;for(var b=this.writeIndex-(a*this.samplerate*.001|0);0>b;)b+=this.buffersize;this.readIndex=b},c.setRate=function(a){this.rate=a,this.phaseIncr=512*this.rate/this.samplerate*this.phaseStep},c.process=function(a,b){var c,d,e,f,g,h=this.bufferL,i=this.bufferR,j=this.buffersize,k=j-1,l=this._wave,m=this.phase,n=this.phaseIncr,o=this.writeIndex,p=this.readIndex,q=this.depth,r=this.feedback,s=this.wet,t=1-s,u=a.length,v=this.phaseStep;for(f=0;u>f;){for(e=l[0|m]*q,m+=n;m>512;)m-=512;for(g=0;v>g;++g,++f)d=p+j+e&k,c=.5*(h[d]+h[d+1]),h[o]=a[f]-c*r,a[f]=a[f]*t+c*s,c=.5*(i[d]+i[d+1]),i[o]=b[f]-c*r,b[f]=b[f]*t+c*s,o=o+1&k,p=p+1&k}this.phase=m,this.writeIndex=o,this.readIndex=p},a.modules.Chorus=b}(timbre),function(a){"use strict";function b(b,d){this.samplerate=b,this.channels=d,this.lastPreDelayFrames=0,this.preDelayReadIndex=0,this.preDelayWriteIndex=e,this.ratio=-1,this.slope=-1,this.linearThreshold=-1,this.dbThreshold=-1,this.dbKnee=-1,this.kneeThreshold=-1,this.kneeThresholdDb=-1,this.ykneeThresholdDb=-1,this.K=-1,this.attackTime=.003,this.releaseTime=.25,this.preDelayTime=.006,this.dbPostGain=0,this.effectBlend=1,this.releaseZone1=.09,this.releaseZone2=.16,this.releaseZone3=.42,this.releaseZone4=.98,this.detectorAverage=0,this.compressorGain=1,this.meteringGain=1,this.delayBufferL=new a.fn.SignalArray(c),this.delayBufferR=2===d?new a.fn.SignalArray(c):this.delayBufferL,this.preDelayTime=6,this.preDelayReadIndex=0,this.preDelayWriteIndex=e,this.maxAttackCompressionDiffDb=-1,this.meteringReleaseK=1-Math.exp(-1/(.325*this.samplerate)),this.setAttackTime(this.attackTime),this.setReleaseTime(this.releaseTime),this.setPreDelayTime(this.preDelayTime),this.setParams(-24,30,12)}var c=1024,d=c-1,e=256,f=5,g=b.prototype;g.clone=function(){var a=new b(this.samplerate,this.channels);return a.setAttackTime(this.attackTime),a.setReleaseTime(this.releaseTime),a.setPreDelayTime(this.preDelayTime),a.setParams(this.dbThreshold,this.dbKnee,this.ratio),a},g.setAttackTime=function(a){this.attackTime=Math.max(.001,a),this._attackFrames=this.attackTime*this.samplerate},g.setReleaseTime=function(a){this.releaseTime=Math.max(.001,a);var b=this.releaseTime*this.samplerate,c=.0025;this._satReleaseFrames=c*this.samplerate;var d=b*this.releaseZone1,e=b*this.releaseZone2,f=b*this.releaseZone3,g=b*this.releaseZone4;this._kA=.9999999999999998*d+1.8432219684323923e-16*e-1.9373394351676423e-16*f+8.824516011816245e-18*g,this._kB=-1.5788320352845888*d+2.3305837032074286*e-.9141194204840429*f+.1623677525612032*g,this._kC=.5334142869106424*d-1.272736789213631*e+.9258856042207512*f-.18656310191776226*g,this._kD=.08783463138207234*d-.1694162967925622*e+.08588057951595272*f-.00429891410546283*g,this._kE=-.042416883008123074*d+.1115693827987602*e-.09764676325265872*f+.028494263462021576*g},g.setPreDelayTime=function(a){this.preDelayTime=a;var b=a*this.samplerate;if(b>c-1&&(b=c-1),this.lastPreDelayFrames!==b){this.lastPreDelayFrames=b;for(var d=0,e=this.delayBufferL.length;e>d;++d)this.delayBufferL[d]=this.delayBufferR[d]=0;this.preDelayReadIndex=0,this.preDelayWriteIndex=b}},g.setParams=function(a,b,c){this._k=this.updateStaticCurveParameters(a,b,c);var d=this.saturate(1,this._k),e=1/d;e=Math.pow(e,.6),this._masterLinearGain=Math.pow(10,.05*this.dbPostGain)*e},g.kneeCurve=function(a,b){return a<this.linearThreshold?a:this.linearThreshold+(1-Math.exp(-b*(a-this.linearThreshold)))/b},g.saturate=function(a,b){var c;if(a<this.kneeThreshold)c=this.kneeCurve(a,b);else{var d=a?20*Math.log(a)*Math.LOG10E:-1e3,e=this.ykneeThresholdDb+this.slope*(d-this.kneeThresholdDb);c=Math.pow(10,.05*e)}return c},g.slopeAt=function(a,b){if(a<this.linearThreshold)return 1;var c=1.001*a,d=a?20*Math.log(a)*Math.LOG10E:-1e3,e=c?20*Math.log(c)*Math.LOG10E:-1e3,f=this.kneeCurve(a,b),g=this.kneeCurve(c,b),h=f?20*Math.log(f)*Math.LOG10E:-1e3,i=g?20*Math.log(g)*Math.LOG10E:-1e3;return(i-h)/(e-d)},g.kAtSlope=function(a){for(var b=this.dbThreshold+this.dbKnee,c=Math.pow(10,.05*b),d=.1,e=1e4,f=5,g=0;15>g;++g){var h=this.slopeAt(c,f);a>h?e=f:d=f,f=Math.sqrt(d*e)}return f},g.updateStaticCurveParameters=function(a,b,c){this.dbThreshold=a,this.linearThreshold=Math.pow(10,.05*a),this.dbKnee=b,this.ratio=c,this.slope=1/this.ratio,this.kneeThresholdDb=a+b,this.kneeThreshold=Math.pow(10,.05*this.kneeThresholdDb);var d=this.kAtSlope(1/this.ratio),e=this.kneeCurve(this.kneeThreshold,d);return this.ykneeThresholdDb=e?20*Math.log(e)*Math.LOG10E:-1e3,this._k=d,this._k},g.process=function(a,b){for(var c=1-this.effectBlend,e=this.effectBlend,g=this._k,h=this._masterLinearGain,i=this._satReleaseFrames,j=this._kA,k=this._kB,l=this._kC,m=this._kD,n=this._kE,o=64,p=a.length/o,q=0,r=this.detectorAverage,s=this.compressorGain,t=this.maxAttackCompressionDiffDb,u=1/this._attackFrames,v=this.preDelayReadIndex,w=this.preDelayWriteIndex,x=this.detectorAverage,y=this.delayBufferL,z=this.delayBufferR,A=this.meteringGain,B=this.meteringReleaseK,C=0;p>C;++C){var D,E=Math.asin(r)/(.5*Math.PI),F=E>s,G=s/E,H=G?20*Math.log(G)*Math.LOG10E:-1e3;if((1/0===H||isNaN(H))&&(H=-1),F){t=-1,G=H,G=-12>G?0:G>0?3:.25*(G+12);var I=G*G,J=I*G,K=I*I,L=j+k*G+l*I+m*J+n*K,M=f/L;D=Math.pow(10,.05*M)}else{(-1===t||H>t)&&(t=H);var N=Math.max(.5,t);G=.25/N,D=1-Math.pow(G,u)}for(var O=o;O--;){var P=0,Q=.5*(a[q]+b[q]);y[w]=a[q],z[w]=b[q],0>Q&&(Q*=-1),Q>P&&(P=Q);var R=P;0>R&&(R*=-1);var S=this.saturate(R,g),T=1e-4>=R?1:S/R,U=T?-20*Math.log(T)*Math.LOG10E:1e3;2>U&&(U=2);var V=U/i,W=Math.pow(10,.05*V)-1,X=T>x,Y=X?W:1;x+=(T-x)*Y,x>1&&(x=1),1>D?s+=(E-s)*D:(s*=D,s>1&&(s=1));var Z=Math.sin(.5*Math.PI*s),$=c+e*h*Z,_=20*Math.log(Z)*Math.LOG10E;A>_?A=_:A+=(_-A)*B,a[q]=y[v]*$,b[q]=z[v]*$,q++,v=v+1&d,w=w+1&d}1e-6>x&&(x=1e-6),1e-6>s&&(s=1e-6)}this.preDelayReadIndex=v,this.preDelayWriteIndex=w,this.detectorAverage=x,this.compressorGain=s,this.maxAttackCompressionDiffDb=t,this.meteringGain=A},g.reset=function(){this.detectorAverage=0,this.compressorGain=1,this.meteringGain=1;for(var a=0,b=this.delayBufferL.length;b>a;++a)this.delayBufferL[a]=this.delayBufferR[a]=0;this.preDelayReadIndex=0,this.preDelayWriteIndex=e,this.maxAttackCompressionDiffDb=-1},a.modules.Compressor=b}(timbre),function(a){"use strict";function b(){}b.prototype.decode=function(a,c,d){if("string"==typeof a){if(/\.wav$/.test(a))return b.wav_decode(a,c,d);if(b.ogg_decode&&/\.ogg$/.test(a))return b.ogg_decode(a,c,d);if(b.mp3_decode&&/\.mp3$/.test(a))return b.mp3_decode(a,c,d)}else if("object"==typeof a){if("wav"===a.type)return b.wav_decode(a.data,c,d);if(b.ogg_decode&&"ogg"===a.type)return b.ogg_decode(a.data,c,d);if(b.mp3_decode&&"mp3"===a.type)return b.mp3_decode(a.data,c,d)}return b.webkit_decode?"object"==typeof a?b.webkit_decode(a.data||a,c,d):b.webkit_decode(a,c,d):b.moz_decode?b.moz_decode(a,c,d):void c(!1)},a.modules.Decoder=b,b.getBinaryWithPath="browser"===a.envtype?function(b,c){a.fn.fix_iOS6_1_problem(!0);var d=new XMLHttpRequest;d.open("GET",b),d.responseType="arraybuffer",d.onreadystatechange=function(){4===d.readyState&&(d.response?c(new Uint8Array(d.response)):void 0!==d.responseBody&&c(new Uint8Array(VBArray(d.responseBody).toArray())),a.fn.fix_iOS6_1_problem(!1))},d.send()}:function(a,b){b("no support")};var c=function(a){for(var b,c,d,e,f,g=new Int32Array(a.length/3),h=0,i=a.length,j=0;i>h;)b=a[h++],c=a[h++],d=a[h++],e=b+(c<<8)+(d<<16),f=8388608&e?e-16777216:e,g[j++]=f;return g};b.wav_decode=function(){var a=function(a,b,d){if("RIFF"!==String.fromCharCode(a[0],a[1],a[2],a[3]))return b(!1);var e=a[4]+(a[5]<<8)+(a[6]<<16)+(a[7]<<24);if(e+8!==a.length)return b(!1);if("WAVE"!==String.fromCharCode(a[8],a[9],a[10],a[11]))return b(!1);if("fmt "!==String.fromCharCode(a[12],a[13],a[14],a[15]))return b(!1);for(var f=a[22]+(a[23]<<8),g=a[24]+(a[25]<<8)+(a[26]<<16)+(a[27]<<24),h=a[34]+(a[35]<<8),i=36;i<a.length&&"data"!==String.fromCharCode(a[i],a[i+1],a[i+2],a[i+3]);)i+=1;if(i>=a.length)return b(!1);i+=4;var j=a[i]+(a[i+1]<<8)+(a[i+2]<<16)+(a[i+3]<<24),k=(j/f>>1)/g;if(i+=4,j>a.length-i)return b(!1);var l,m,n;l=new Float32Array(k*g|0),2===f&&(m=new Float32Array(l.length),n=new Float32Array(l.length)),b({samplerate:g,channels:f,buffer:[l,m,n],duration:k}),8===h?a=new Int8Array(a.buffer,i):16===h?a=new Int16Array(a.buffer,i):32===h?a=new Int32Array(a.buffer,i):24===h&&(a=c(new Uint8Array(a.buffer,i)));var o,p,q,r=1/((1<<h-1)-1);if(2===f)for(i=p=0,o=l.length;o>i;++i)q=m[i]=a[p++]*r,q+=n[i]=a[p++]*r,l[i]=.5*q;else for(i=0,o=l.length;o>i;++i)l[i]=a[i]*r;d()};return function(c,d,e){"string"==typeof c?b.getBinaryWithPath(c,function(b){a(b,d,e)}):a(c,d,e)}}(),b.webkit_decode=function(){if("undefined"!=typeof a.fn._audioContext){var c=a.fn._audioContext,d=function(a,b,d){var e,f,g,h,i;if("string"==typeof a)return d(!1);var j;try{j=c.createBuffer(a.buffer,!1)}catch(k){return b(!1)}e=c.sampleRate,f=j.numberOfChannels,2===f?(g=j.getChannelData(0),h=j.getChannelData(1)):g=h=j.getChannelData(0),i=g.length/e;for(var l=new Float32Array(g),m=0,n=l.length;n>m;++m)l[m]=.5*(l[m]+h[m]);b({samplerate:e,channels:f,buffer:[l,g,h],duration:i}),d()};return function(a,c,e){if(a instanceof File){var f=new FileReader;f.onload=function(a){d(new Uint8Array(a.target.result),c,e)},f.readAsArrayBuffer(a)}else"string"==typeof a?b.getBinaryWithPath(a,function(a){d(a,c,e)}):d(a,c,e)}}}(),b.moz_decode=function(){return"function"==typeof Audio&&"function"==typeof(new Audio).mozSetup?function(a,b,c){var d,e,f,g,h,i,j=0,k=new Audio(a);k.volume=0,k.addEventListener("loadedmetadata",function(){d=k.mozSampleRate,e=k.mozChannels,i=k.duration,f=new Float32Array(k.duration*d|0),2===e&&(g=new Float32Array(k.duration*d|0),h=new Float32Array(k.duration*d|0)),2===e?k.addEventListener("MozAudioAvailable",function(a){for(var b,c=a.frameBuffer,d=0,e=c.length;e>d;d+=2)b=g[j]=c[d],b+=h[j]=c[d+1],f[j]=.5*b,j+=1},!1):k.addEventListener("MozAudioAvailable",function(a){for(var b=a.frameBuffer,c=0,d=b.length;d>c;++c)f[c]=b[c],j+=1},!1),k.play(),setTimeout(function(){b({samplerate:d,channels:e,buffer:[f,g,h],duration:i})},1e3)},!1),k.addEventListener("ended",function(){c()},!1),k.load()}:void 0}()}(timbre),function(a){"use strict";function b(a){this.samplerate=a||44100,this.value=d,this.status=m,this.curve="linear",this.step=1,this.releaseNode=null,this.loopNode=null,this.emit=null,this._envValue=new c(a),this._table=[],this._initValue=d,this._curveValue=0,this._defaultCurveType=f,this._index=0,this._counter=0}function c(a){this.samplerate=a,this.value=d,this.step=1,this._curveType=f,this._curveValue=0,this._grow=0,this._a2=0,this._b1=0,this._y1=0,this._y2=0}var d=b.ZERO=1e-6,e=b.CurveTypeSet=0,f=b.CurveTypeLin=1,g=b.CurveTypeExp=2,h=b.CurveTypeSin=3,i=b.CurveTypeWel=4,j=b.CurveTypeCurve=5,k=b.CurveTypeSqr=6,l=b.CurveTypeCub=7,m=b.StatusWait=0,n=b.StatusGate=1,o=b.StatusSustain=2,p=b.StatusRelease=3,q=b.StatusEnd=4,r={set:e,lin:f,linear:f,exp:g,exponential:g,sin:h,sine:h,wel:i,welch:i,sqr:k,squared:k,cub:l,cubed:l};b.CurveTypeDict=r;var s=b.prototype;s.clone=function(){var a=new b(this.samplerate);return a._table=this._table,a._initValue=this._initValue,a.setCurve(this.curve),null!==this.releaseNode&&a.setReleaseNode(this.releaseNode+1),null!==this.loopNode&&a.setLoopNode(this.loopNode+1),a.setStep(this.step),a.reset(),a},s.setTable=function(a){this._initValue=a[0],this._table=a.slice(1),this.value=this._envValue.value=this._initValue,this._index=0,this._counter=0,this.status=m},s.setCurve=function(a){"number"==typeof a?(this._defaultCurveType=j,this._curveValue=a,this.curve=a):(this._defaultCurveType=r[a]||null,this.curve=a)},s.setReleaseNode=function(a){"number"==typeof a&&a>0&&(this.releaseNode=a-1)},s.setLoopNode=function(a){"number"==typeof a&&a>0&&(this.loopNode=a-1)},s.setStep=function(a){this.step=this._envValue.step=a},s.reset=function(){this.value=this._envValue.value=this._initValue,this._index=0,this._counter=0,this.status=m},s.release=function(){null!==this.releaseNode&&this._index<=this.releaseNode&&(this._counter=0,this._index=this.releaseNode,this.status=p)},s.getInfo=function(a){var b,c,d=this._table,e=0,f=1/0,g=1/0,h=!1;for(b=0,c=d.length;c>b;++b){this.loopNode===b&&(f=e),this.releaseNode===b&&(a>e?e+=a:e=a,g=e);var i=d[b];Array.isArray(i)&&(e+=i[1])}return 1/0!==f&&1/0===g&&(e+=a,h=!0),{totalDuration:e,loopBeginTime:f,releaseBeginTime:g,isEndlessLoop:h}},s.calcStatus=function(){var a,b,c,d,g=this.status,h=this._table,i=this._index,k=this._counter,l=this._curveValue,r=this._defaultCurveType,s=this.loopNode,t=this.releaseNode,u=this._envValue,v=null;switch(g){case m:case q:break;case n:case p:for(;0>=k;)if(i>=h.length){if(g===n&&null!==s){i=s;continue}g=q,k=1/0,d=e,v="ended"}else if(g!==n||i!==t)a=h[i++],b=a[0],d=null===a[2]?r:a[2],d===j&&(l=a[3],Math.abs(l)<.001&&(d=f)),c=a[1],k=u.setNext(b,c,d,l);else{if(null!==s&&t>s){i=s;continue}g=o,k=1/0,d=e,v="sustained"}}return this.status=g,this.emit=v,this._index=i,this._counter=k,g},s.next=function(){return 1&this.calcStatus()&&(this.value=this._envValue.next()||d),this._counter-=1,this.value},s.process=function(a){var b,c=this._envValue,e=a.length;if(1&this.calcStatus())for(b=0;e>b;++b)a[b]=c.next()||d;else{var f=this.value||d;for(b=0;e>b;++b)a[b]=f}this.value=a[e-1],this._counter-=a.length},c.prototype.setNext=function(a,b,c,d){var m,n,o,p,q,r,s,u=this.step,v=this.value,w=.001*b*this.samplerate/u|0;switch(1>w&&(w=1,c=e),c){case e:this.value=a;break;case f:m=(a-v)/w;break;case g:m=0!==v?Math.pow(a/v,1/w):0;break;case h:n=Math.PI/w,p=.5*(a+v),q=2*Math.cos(n),r=.5*(a-v),s=r*Math.sin(.5*Math.PI-n),v=p-r;break;case i:n=.5*Math.PI/w,q=2*Math.cos(n),a>=v?(p=v,r=0,s=-Math.sin(n)*(a-v)):(p=a,r=v-a,s=Math.cos(n)*(v-a)),v=p+r;break;case j:o=(a-v)/(1-Math.exp(d)),p=v+o,q=o,m=Math.exp(d/w);break;case k:r=Math.sqrt(v),s=Math.sqrt(a),m=(s-r)/w;break;case l:r=Math.pow(v,.33333333),s=Math.pow(a,.33333333),m=(s-r)/w}return this.next=t[c],this._grow=m,this._a2=p,this._b1=q,this._y1=r,this._y2=s,w};var t=[];t[e]=function(){return this.value},t[f]=function(){return this.value+=this._grow,this.value},t[g]=function(){return this.value*=this._grow,this.value},t[h]=function(){var a=this._b1*this._y1-this._y2;return this.value=this._a2-a,this._y2=this._y1,this._y1=a,this.value},t[i]=function(){var a=this._b1*this._y1-this._y2;return this.value=this._a2+a,this._y2=this._y1,this._y1=a,this.value},t[j]=function(){return this._b1*=this._grow,this.value=this._a2-this._b1,this.value},t[k]=function(){return this._y1+=this._grow,this.value=this._y1*this._y1,this.value},t[l]=function(){return this._y1+=this._grow,this.value=this._y1*this._y1*this._y1,this.value},c.prototype.next=t[e],a.modules.Envelope=b,a.modules.EnvelopeValue=c}(timbre),function(a){"use strict";function b(b){b="number"==typeof b?b:512,b=1<<Math.ceil(Math.log(b)*Math.LOG2E),this.length=b,this.buffer=new a.fn.SignalArray(b),this.real=new a.fn.SignalArray(b),this.imag=new a.fn.SignalArray(b),this._real=new a.fn.SignalArray(b),this._imag=new a.fn.SignalArray(b),this.mag=new a.fn.SignalArray(b>>1),this.minDecibels=-30,this.maxDecibels=-100;var c=d.get(b);this._bitrev=c.bitrev,this._sintable=c.sintable,this._costable=c.costable}var c=b.prototype;c.setWindow=function(b){if("string"==typeof b){var c=/([A-Za-z]+)(?:\(([01]\.?\d*)\))?/.exec(b);if(null!==c){var d=c[1].toLowerCase(),f=void 0!==c[2]?+c[2]:.25,g=e[d];if(g){this._window||(this._window=new a.fn.SignalArray(this.length));var h=this._window,i=0,j=this.length;for(f=0>f?0:f>1?1:f;j>i;++i)h[i]=g(i,j,f);this.windowName=b}}}},c.forward=function(a){var b,c,d,e,f,g,h,i,j,k,l,m=this.buffer,n=this.real,o=this.imag,p=this._window,q=this._bitrev,r=this._sintable,s=this._costable,t=m.length;if(p)for(b=0;t>b;++b)m[b]=a[b]*p[b];else m.set(a);for(b=0;t>b;++b)n[b]=m[q[b]],o[b]=0;for(d=1;t>d;d=e)for(f=0,e=d+d,g=t/e,c=0;d>c;c++){for(h=s[f],i=r[f],b=c;t>b;b+=e)j=b+d,k=i*o[j]+h*n[j],l=h*o[j]-i*n[j],n[j]=n[b]-k,n[b]+=k,o[j]=o[b]-l,o[b]+=l;f+=g}var u,v,w=this.mag;for(b=0;t>b;++b)u=n[b],v=o[b],w[b]=Math.sqrt(u*u+v*v);return{real:n,imag:o}},c.inverse=function(a,b){var c,d,e,f,g,h,i,j,k,l,m,n=this.buffer,o=this._real,p=this._imag,q=this._bitrev,r=this._sintable,s=this._costable,t=n.length;for(c=0;t>c;++c)d=q[c],o[c]=+a[d],p[c]=-b[d];for(e=1;t>e;e=f)for(g=0,f=e+e,h=t/f,d=0;e>d;d++){for(i=s[g],j=r[g],c=d;t>c;c+=f)k=c+e,l=j*p[k]+i*o[k],m=i*p[k]-j*o[k],o[k]=o[c]-l,o[c]+=l,p[k]=p[c]-m,p[c]+=m;g+=h}for(c=0;t>c;++c)n[c]=o[c]/t;return n},c.getFrequencyData=function(a){var b,c=this.minDecibels,d=Math.min(this.mag.length,a.length);if(d){var e,f=this.mag,g=0;for(b=0;d>b;++b)e=f[b],a[b]=e?20*Math.log(e)*Math.LOG10E:c,g<a[b]&&(g=a[b])}return a};var d={get:function(b){return d[b]||function(){var c,e,f=function(){var a,c,d,e,f;for(a=new Int16Array(b),f=b>>1,c=d=0;a[c]=d,!(++c>=b);){for(e=f;d>=e;)d-=e,e>>=1;d+=e}return a}(),g=Math.floor(Math.log(b)/Math.LN2),h=new a.fn.SignalArray((1<<g)-1),i=new a.fn.SignalArray((1<<g)-1),j=2*Math.PI;for(c=0,e=h.length;e>c;++c)h[c]=Math.sin(j*(c/b)),i[c]=Math.cos(j*(c/b));return d[b]={bitrev:f,sintable:h,costable:i},d[b]}()}},e=function(){var a=Math.PI,b=2*Math.PI,c=Math.abs,d=Math.pow,e=Math.cos,f=Math.sin,g=function(b){return f(a*b)/(a*b)},h=Math.E;return{rectangular:function(){return 1},hann:function(a,c){return.5*(1-e(b*a/(c-1)))},hamming:function(a,c){return.54-.46*e(b*a/(c-1))},tukery:function(b,c,d){return d*(c-1)/2>b?.5*(1+e(a*(2*b/(d*(c-1))-1))):b>(c-1)*(1-d/2)?.5*(1+e(a*(2*b/(d*(c-1))-2/d+1))):1},cosine:function(b,c){return f(a*b/(c-1))},lanczos:function(a,b){return g(2*a/(b-1)-1)},triangular:function(a,b){return 2/(b+1)*((b+1)/2-c(a-(b-1)/2))},bartlett:function(a,b){return 2/(b-1)*((b-1)/2-c(a-(b-1)/2))},gaussian:function(a,b,c){return d(h,-.5*d((a-(b-1)/2)/(c*(b-1)/2),2))},bartlettHann:function(a,d){return.62-.48*c(a/(d-1)-.5)-.38*e(b*a/(d-1))},blackman:function(c,d,f){var g=(1-f)/2,h=.5,i=f/2;return g-h*e(b*c/(d-1))+i*e(4*a*c/(d-1))}}}();a.modules.FFT=b}(timbre),function(a){"use strict";function b(a){this.samplerate=a||44100,this.wave=null,this.step=1,this.frequency=0,this.value=0,this.phase=0,this.feedback=!1,this._x=0,this._lastouts=0,this._coeff=f/this.samplerate,this._radtoinc=f/(2*Math.PI)}function c(a,b,c,d){var e,f,g,h,i,j=k[b];if(void 0!==j){switch("function"==typeof j&&(j=j()),c){case"@1":for(f=512;1024>f;++f)j[f]=0;break;case"@2":for(f=512;1024>f;++f)j[f]=Math.abs(j[f]);break;case"@3":for(f=256;512>f;++f)j[f]=0;for(f=512;768>f;++f)j[f]=Math.abs(j[f]);for(f=768;1024>f;++f)j[f]=0;break;case"@4":for(e=new Float32Array(1024),f=0;512>f;++f)e[f]=j[f<<1];j=e;break;case"@5":for(e=new Float32Array(1024),f=0;512>f;++f)e[f]=Math.abs(j[f<<1]);j=e}if(void 0!==d&&50!==d){for(d*=.01,d=0>d?0:d>1?1:d,e=new Float32Array(1024),g=1024*d|0,f=0;g>f;++f)e[f]=j[f/g*512|0];for(i=1024-g,h=0;1024>f;++f,++h)e[f]=j[h/i*512+512|0];j=e}if("+"===a)for(f=0;1024>f;++f)j[f]=.5*j[f]+.5;else if("-"===a)for(f=0;1024>f;++f)j[f]*=-1;return j}}function d(a){var b=new Float32Array(1024),c=a.length>>1;if(-1!==[2,4,8,16,32,64,128,256,512,1024].indexOf(c))for(var d=0,e=0;c>d;++d){var f=parseInt(a.substr(2*d,2),16);f=128&f?(f-256)/128:f/127;for(var g=0,h=1024/c;h>g;++g)b[e++]=f}return b}function e(a){var b=new Float32Array(1024);if(8===a.length){var c,d,e=parseInt(a,16),f=new Float32Array(8);for(f[0]=1,c=0;7>c;++c)f[c+1]=.0625*(15&e),e>>=4;for(c=0;8>c;++c){var g=0,h=(c+1)/1024;for(d=0;1024>d;++d)b[d]+=Math.sin(2*Math.PI*g)*f[c],g+=h}var i,j=0;for(c=0;1024>c;++c)j<(i=Math.abs(b[c]))&&(j=i);if(j>0)for(c=0;1024>c;++c)b[c]/=j}return b}var f=1024,g=f-1,h=b.prototype;h.setWave=function(b){var c,d,e=this.wave;if(this.wave||(this.wave=new Float32Array(f+1)),"function"==typeof b)for(c=0;f>c;++c)e[c]=b(c/f);else if(a.fn.isSignalArray(b))if(b.length===e.length)e.set(b);else for(d=b.length/f,c=0;f>c;++c)e[c]=b[c*d|0];else"string"==typeof b&&void 0!==(d=i(b))&&this.wave.set(d);this.wave[f]=this.wave[0]},h.clone=function(){var a=new b(this.samplerate);return a.wave=this.wave,a.step=this.step,a.frequency=this.frequency,a.value=this.value,a.phase=this.phase,a.feedback=this.feedback,a},h.reset=function(){this._x=0},h.next=function(){var a=this._x,b=a+this.phase*this._radtoinc|0;return this.value=this.wave[b&g],a+=this.frequency*this._coeff*this.step,a>f&&(a-=f),this._x=a,this.value},h.process=function(a){var b,c,d,e,h,i,j=this.wave,k=this._radtoinc,l=this._x,m=this.frequency*this._coeff,n=this.step;if(this.feedback){var o=this._lastouts;for(k*=this.phase,i=0;n>i;++i)b=l+o*k,c=0|b,d=b-c,c&=g,e=j[c],h=j[c+1],a[i]=o=e+d*(h-e),l+=m;this._lastouts=o}else{var p=this.phase*k;for(i=0;n>i;++i)b=l+p,c=0|b,d=b-c,c&=g,e=j[c],h=j[c+1],a[i]=e+d*(h-e),l+=m}l>f&&(l-=f),this._x=l,this.value=a[a.length-1]},h.processWithFreqArray=function(a,b){var c,d,e,h,i,j,k=this.wave,l=this._radtoinc,m=this._x,n=this._coeff,o=this.step;if(this.feedback){var p=this._lastouts;for(l*=this.phase,j=0;o>j;++j)c=m+p*l,d=0|c,e=c-d,d&=g,h=k[d],i=k[d+1],a[j]=p=h+e*(i-h),m+=b[j]*n;this._lastouts=p}else{var q=this.phase*this._radtoinc;for(j=0;o>j;++j)c=m+q,d=0|c,e=c-d,d&=g,h=k[d],i=k[d+1],a[j]=h+e*(i-h),m+=b[j]*n}m>f&&(m-=f),this._x=m,this.value=a[a.length-1]},h.processWithPhaseArray=function(a,b){var c,d,e,h,i,j,k=this.wave,l=this._radtoinc,m=this._x,n=this.frequency*this._coeff,o=this.step;if(this.feedback){var p=this._lastouts;for(l*=this.phase,j=0;o>j;++j)c=m+p*l,d=0|c,e=c-d,d&=g,h=k[d],i=k[d+1],a[j]=p=h+e*(i-h),m+=n;this._lastouts=p}else for(j=0;o>j;++j)c=m+b[j]*l,d=0|c,e=c-d,d&=g,h=k[d],i=k[d+1],a[j]=h+e*(i-h),m+=n;m>f&&(m-=f),this._x=m,this.value=a[a.length-1]},h.processWithFreqAndPhaseArray=function(a,b,c){var d,e,h,i,j,k,l=this.wave,m=this._radtoinc,n=this._x,o=this._coeff,p=this.step;if(this.feedback){var q=this._lastouts;for(m*=this.phase,k=0;p>k;++k)d=n+q*m,e=0|d,h=d-e,e&=g,i=l[e],j=l[e+1],a[k]=q=i+h*(j-i),n+=b[k]*o;this._lastouts=q}else for(k=0;p>k;++k)d=n+c[k]*f,e=0|d,h=d-e,e&=g,i=l[e],j=l[e+1],a[k]=i+h*(j-i),n+=b[k]*o;n>f&&(n-=f),this._x=n,this.value=a[a.length-1]};var i=function(a){var b=k[a];if(void 0!==b)return"function"==typeof b&&(b=b()),b;var f;if(f=/^([\-+]?)(\w+)(?:\((@[0-7])?:?(\d+)?\))?$/.exec(a),null!==f){var g=f[1],h=f[2],i=f[3],j=f[4];if(b=c(g,h,i,j),void 0!==b)return k[a]=b,b}return f=/^wavb\(((?:[0-9a-fA-F][0-9a-fA-F])+)\)$/.exec(a),null!==f?d(f[1]):(f=/^wavc\(([0-9a-fA-F]{8})\)$/.exec(a),null!==f?e(f[1]):void 0)};b.getWavetable=i;var j=function(b,c){var d,e,f=new Float32Array(1024);if("function"==typeof c)for(e=0;1024>e;++e)f[e]=c(e/1024);else if(a.fn.isSignalArray(c))if(c.length===f.length)f.set(c);else for(d=c.length/1024,e=0;1024>e;++e)f[e]=c[e*d|0];k[b]=f};b.setWavetable=j;var k={sin:function(){for(var a=new Float32Array(1024),b=0;1024>b;++b)a[b]=Math.sin(2*Math.PI*(b/1024));return a},cos:function(){for(var a=new Float32Array(1024),b=0;1024>b;++b)a[b]=Math.cos(2*Math.PI*(b/1024));return a},pulse:function(){for(var a=new Float32Array(1024),b=0;1024>b;++b)a[b]=512>b?1:-1;return a},tri:function(){for(var a,b=new Float32Array(1024),c=0;1024>c;++c)a=c/1024-.25,b[c]=1-4*Math.abs(Math.round(a)-a);return b},saw:function(){for(var a,b=new Float32Array(1024),c=0;1024>c;++c)a=c/1024,b[c]=2*(a-Math.round(a));return b},fami:function(){for(var a=[0,.125,.25,.375,.5,.625,.75,.875,.875,.75,.625,.5,.375,.25,.125,0,-.125,-.25,-.375,-.5,-.625,-.75,-.875,-1,-1,-.875,-.75,-.625,-.5,-.375,-.25,-.125],b=new Float32Array(1024),c=0;1024>c;++c)b[c]=a[c/1024*a.length|0];return b},konami:function(){for(var a=[-.625,-.875,-.125,.75,.5,.125,.5,.75,.25,-.125,.5,.875,.625,0,.25,.375,-.125,-.75,0,.625,.125,-.5,-.375,-.125,-.75,-1,-.625,0,-.375,-.875,-.625,-.25],b=new Float32Array(1024),c=0;1024>c;++c)b[c]=a[c/1024*a.length|0];return b}};a.modules.Oscillator=b}(timbre),function(a){"use strict";function b(b,g){this.samplerate=b;var h,i,j=b/44100;for(i=2*e.length,this.comb=new Array(i),this.combout=new Array(i),h=0;i>h;++h)this.comb[h]=new c(e[h%e.length]*j),this.combout[h]=new a.fn.SignalArray(g);for(i=2*f.length,this.allpass=new Array(i),h=0;i>h;++h)this.allpass[h]=new d(f[h%f.length]*j);this.outputs=[new a.fn.SignalArray(g),new a.fn.SignalArray(g)],this.damp=0,this.wet=.33,this.setRoomSize(.5),this.setDamp(.5)}function c(b){this.buffer=new a.fn.SignalArray(0|b),this.buffersize=this.buffer.length,this.bufidx=0,this.feedback=0,this.filterstore=0,this.damp=0}function d(b){this.buffer=new a.fn.SignalArray(0|b),this.buffersize=this.buffer.length,this.bufidx=0}var e=[1116,1188,1277,1356,1422,1491,1557,1617],f=[225,556,441,341],g=b.prototype;g.setRoomSize=function(a){var b=this.comb,c=.28*a+.7;this.roomsize=a,b[0].feedback=b[1].feedback=b[2].feedback=b[3].feedback=b[4].feedback=b[5].feedback=b[6].feedback=b[7].feedback=b[8].feedback=b[9].feedback=b[10].feedback=b[11].feedback=b[12].feedback=b[13].feedback=b[14].feedback=b[15].feedback=c},g.setDamp=function(a){var b=this.comb,c=.4*a;this.damp=a,b[0].damp=b[1].damp=b[2].damp=b[3].damp=b[4].damp=b[5].damp=b[6].damp=b[7].damp=b[8].damp=b[9].damp=b[10].damp=b[11].damp=b[12].damp=b[13].damp=b[14].damp=b[15].damp=c},g.process=function(a,b){var c,d=this.comb,e=this.combout,f=this.allpass,g=this.outputs[0],h=this.outputs[1],i=this.wet,j=1-i,k=a.length;for(d[0].process(a,e[0]),d[1].process(a,e[1]),d[2].process(a,e[2]),d[3].process(a,e[3]),d[4].process(a,e[4]),d[5].process(a,e[5]),d[6].process(a,e[6]),d[7].process(a,e[7]),d[8].process(b,e[8]),d[9].process(b,e[9]),d[10].process(b,e[10]),d[11].process(b,e[11]),d[12].process(b,e[12]),d[13].process(b,e[13]),d[14].process(b,e[14]),d[15].process(b,e[15]),c=0;k>c;++c)g[c]=e[0][c]+e[1][c]+e[2][c]+e[3][c]+e[4][c]+e[5][c]+e[6][c]+e[7][c],h[c]=e[8][c]+e[9][c]+e[10][c]+e[11][c]+e[12][c]+e[13][c]+e[14][c]+e[15][c];for(f[0].process(g,g),f[1].process(g,g),f[2].process(g,g),f[3].process(g,g),f[4].process(h,h),f[5].process(h,h),f[6].process(h,h),f[7].process(h,h),c=0;k>c;++c)a[c]=g[c]*i+a[c]*j,b[c]=h[c]*i+b[c]*j},c.prototype.process=function(a,b){var c,d,e,f=this.buffer,g=this.buffersize,h=this.bufidx,i=this.filterstore,j=this.feedback,k=this.damp,l=1-k,m=a.length;for(e=0;m>e;++e)c=.015*a[e],d=f[h],i=d*l+i*k,f[h]=c+i*j,++h>=g&&(h=0),b[e]=d;this.bufidx=h,this.filterstore=i},d.prototype.process=function(a,b){var c,d,e,f,g=this.buffer,h=this.buffersize,i=this.bufidx,j=a.length;for(f=0;j>f;++f)c=a[f],e=g[i],d=-c+e,g[i]=c+.5*e,++i>=h&&(i=0),b[f]=d;this.bufidx=i},a.modules.Reverb=b}(timbre),function(a){"use strict";function b(a){return new c(a)}function c(a){if(this.fragments=[],a){var b=a.samplerate||44100,c=a.buffer[0].length/b;this.fragments.push(new d(a,0,c))}}function d(a,b,c,d,e,f,h){a||(a=g),this.buffer=a.buffer[0],this.samplerate=a.samplerate||44100,this.start=b,this._duration=c,this.reverse=d||!1,this.pitch=e||100,this.stretch=f||!1,this.pan=h||50}function e(a,b){this.tape=a,this.fragments=a.fragments,this.samplerate=b||44100,this.isEnded=!1,this.buffer=null,this.bufferIndex=0,this.bufferIndexIncr=0,this.bufferBeginIndex=0,this.bufferEndIndex=0,this.fragment=null,this.fragmentIndex=0,this.panL=.5,this.panR=.5}var f=new Float32Array(60),g={buffer:f,samplerate:1};b.silence=function(a){return new b(g).slice(0,1).fill(a)},b.join=function(a){for(var b=new c,d=0;d<a.length;d++)a[d]instanceof c&&b.add_fragments(a[d].fragments);return b},b.Tape=c,c.prototype.add_fragment=function(a){return this.fragments.push(a),this},c.prototype.add_fragments=function(a){for(var b=0;b<a.length;b++)this.fragments.push(a[b]);return this},c.prototype.duration=function(){for(var a=0,b=0;b<this.fragments.length;b++)a+=this.fragments[b].duration();
return a},c.prototype.slice=function(a,b){var d=this.duration();a+b>d&&(b=d-a);for(var e=new c,f=a,g=b,h=0;h<this.fragments.length;h++){var i=this.fragments[h],j=i.create(f,g),k=j[0];if(f=j[1],g=j[2],k&&e.add_fragment(k),0===g)break}return e},c.prototype.cut=c.prototype.slice,c.prototype.concat=function(a){var b=new c;return b.add_fragments(this.fragments),b.add_fragments(a.fragments),b},c.prototype.loop=function(a){var b,d=[];for(b=0;b<this.fragments.length;b++)d.push(this.fragments[b].clone());var e=new c;for(b=0;a>b;b++)e.add_fragments(d);return e},c.prototype.times=c.prototype.loop,c.prototype.split=function(a){for(var b=this.duration()/a,c=[],d=0;a>d;d++)c.push(this.slice(d*b,b));return c},c.prototype.fill=function(a){var b=this.duration();if(0===b)throw"EmptyFragment";var c=a/b|0,d=a%b;return this.loop(c).plus(this.slice(0,d))},c.prototype.replace=function(a,d,e){var f=new c,g=a+d;f=f.plus(this.slice(0,a));var h=f.duration();a>h&&(f=f.plus(b.silence(a-h))),f=f.plus(e);var i=this.duration();return i>g&&(f=f.plus(this.slice(g,i-g))),f},c.prototype.reverse=function(){for(var a=new c,b=this.fragments.length;b--;){var d=this.fragments[b].clone();d.reverse=!d.isReversed(),a.add_fragment(d)}return a},c.prototype.pitch=function(a,b){var d=new c;b=b||!1;for(var e=0;e<this.fragments.length;e++){var f=this.fragments[e].clone();f.pitch*=.01*a,f.stretch=b,d.add_fragment(f)}return d},c.prototype.stretch=function(a){var b=1/(.01*a)*100;return this.pitch(b,!0)},c.prototype.pan=function(a){var b=new c;a>100?a=100:0>a&&(a=0);for(var d=0;d<this.fragments.length;d++){var e=this.fragments[d].clone();e.pan=a,b.add_fragment(e)}return b},c.prototype.silence=function(){return b.silence(this.duration())},c.prototype.join=function(a){for(var b=new c,d=0;d<a.length;d++)a[d]instanceof c&&b.add_fragments(a[d].fragments);return b},c.prototype.getBuffer=function(){var a=44100;this.fragments.length>0&&(a=this.fragments[0].samplerate);var b=new e(this,a),c=this.duration()*a|0;return{samplerate:a,buffer:b.fetch(c)}},d.prototype.duration=function(){return this._duration*(100/this.pitch)},d.prototype.original_duration=function(){return this._duration},d.prototype.isReversed=function(){return this.reverse},d.prototype.isStretched=function(){return this.stretched},d.prototype.create=function(a,b){var c=this.duration();if(a>=c)return[null,a-c,b];var d,e=a+b>=c;e?(d=c-a,b-=d):(d=b,b=0);var f=this.clone();return f.start=this.start+a*this.pitch*.01,f._duration=d*this.pitch*.01,f.reverse=!1,[f,0,b]},d.prototype.clone=function(){var a=new d;return a.buffer=this.buffer,a.samplerate=this.samplerate,a.start=this.start,a._duration=this._duration,a.reverse=this.reverse,a.pitch=this.pitch,a.stretch=this.stretch,a.pan=this.pan,a},b.Fragment=d,b.TapeStream=e,e.prototype.reset=function(){return this.isEnded=!1,this.buffer=null,this.bufferIndex=0,this.bufferIndexIncr=0,this.bufferBeginIndex=0,this.bufferEndIndex=0,this.fragment=null,this.fragmentIndex=0,this.panL=.5,this.panR=.5,this.isLooped=!1,this},e.prototype.fetch=function(b){var c=new a.fn.SignalArray(b),d=new a.fn.SignalArray(b),e=this.fragments;if(0===e.length)return[c,d];for(var g,h=100*this.samplerate,i=this.buffer,j=this.bufferIndex,k=this.bufferIndexIncr,l=this.bufferBeginIndex,m=this.bufferEndIndex,n=this.fragment,o=this.fragmentIndex,p=this.panL,q=this.panR,r=0;b>r;r++){for(;!i||l>j||j>=m;)if(!n||o<e.length)n=e[o++],i=n.buffer,k=n.samplerate/h*n.pitch,l=n.start*n.samplerate,m=l+n.original_duration()*n.samplerate,g=.01*n.pan,p=1-g,q=g,n.reverse?(k*=-1,j=m+k):j=l;else{if(!this.isLooped){this.isEnded=!0,i=f,k=0,j=0;break}i=null,j=0,k=0,l=0,m=0,n=null,o=0}c[r]=i[0|j]*p,d[r]=i[0|j]*q,j+=k}return this.buffer=i,this.bufferIndex=j,this.bufferIndexIncr=k,this.bufferBeginIndex=l,this.bufferEndIndex=m,this.fragment=n,this.fragmentIndex=o,this.panL=p,this.panR=q,[c,d]},a.modules.Scissor=b}(timbre),function(a){"use strict";function b(b){this.samplerate=b;var c=Math.ceil(Math.log(1.5*b)*Math.LOG2E);this.buffersize=1<<c,this.buffermask=this.buffersize-1,this.writeBufferL=new a.fn.SignalArray(this.buffersize),this.writeBufferR=new a.fn.SignalArray(this.buffersize),this.readBufferL=this.writeBufferL,this.readBufferR=this.writeBufferR,this.delaytime=null,this.feedback=null,this.cross=null,this.mix=null,this.prevL=0,this.prevR=0,this.readIndex=0,this.writeIndex=0,this.setParams(125,.25,!1,.45)}var c=b.prototype;c.setParams=function(a,b,c,d){if(this.delaytime!==a){this.delaytime=a;var e=.001*a*this.samplerate|0;e>this.buffermask&&(e=this.buffermask),this.writeIndex=this.readIndex+e&this.buffermask}this.feedback!==b&&(this.feedback=b),this.cross!==c&&(this.cross=c,c?(this.readBufferL=this.writeBufferR,this.readBufferR=this.writeBufferL):(this.readBufferL=this.writeBufferL,this.readBufferR=this.writeBufferR)),this.mix!==d&&(this.mix=d)},c.process=function(a,b){var c,d,e=this.readBufferL,f=this.readBufferR,g=this.writeBufferL,h=this.writeBufferR,i=this.readIndex,j=this.writeIndex,k=this.buffermask,l=this.feedback,m=this.mix,n=1-m,o=this.prevL,p=this.prevR,q=a.length;for(d=0;q>d;++d)c=e[i],g[j]=a[d]-c*l,a[d]=o=.5*(a[d]*n+c*m+o),c=f[i],h[j]=b[d]-c*l,b[d]=p=.5*(b[d]*n+c*m+p),i+=1,j=j+1&k;this.readIndex=i&this.buffermask,this.writeIndex=j,this.prevL=o,this.prevR=p},a.modules.StereoDelay=b}(timbre),function(a){"use strict";var b=a.fn,c=a.modules;b.register("audio",function(a){var c=b.getClass("buffer"),f=new c(a);return f.playbackState=b.FINISHED_STATE,f._.isLoaded=!1,Object.defineProperties(f,{isLoaded:{get:function(){return this._.isLoaded}}}),f.load=d,f.loadthis=e,f});var d=function(d){var e=this,f=this._,g=new c.Deferred(this),h=arguments,i=1;g.done(function(){e._.emit("done")}),"function"==typeof h[i]&&(g.done(h[i++]),"function"==typeof h[i]&&g.fail(h[i++])),f.loadedTime=0;var j=function(c,d){var f=e._;c?(e.playbackState=b.PLAYING_STATE,f.samplerate=c.samplerate,f.channels=c.channels,f.bufferMix=null,f.buffer=c.buffer,f.phase=0,f.phaseIncr=c.samplerate/a.samplerate,f.duration=1e3*c.duration,f.currentTime=0,f.isReversed&&(f.phaseIncr*=-1,f.phase=c.buffer[0].length+f.phaseIncr),e._.emit("loadedmetadata")):g.reject(d)},k=function(){e._.isLoaded=!0,e._.plotFlush=!0,e._.emit("loadeddata"),g.resolveWith(e)};return(new c.Decoder).decode(d,j,k),g.promise()},e=function(){return d.apply(this,arguments),this}}(timbre),function(a){"use strict";function b(b){a.Object.call(this,2,b),c.fixAR(this);var d=this._;d.biquad=new e(d.samplerate),d.freq=a(340),d.band=a(1),d.gain=a(0),d.plotBefore=g,d.plotRange=[-18,18],d.plotFlush=!0}var c=a.fn,d=a.modules.FFT,e=a.modules.Biquad,f=20;c.extend(b);var g=function(a,b,c,d,e){a.lineWidth=1,a.strokeStyle="rgb(192, 192, 192)";for(var g=.5*this._.samplerate,h=1;10>=h;++h)for(var i=1;4>=i;i++){var j=h*Math.pow(10,i);if(!(f>=j||j>=g)){a.beginPath();var k=Math.log(j/f)/Math.log(g/f);k=(k*d+b|0)+.5,a.moveTo(k,c),a.lineTo(k,c+e),a.stroke()}}var l=e/6;for(h=1;6>h;h++){a.beginPath();var m=(c+h*l|0)+.5;a.moveTo(b,m),a.lineTo(b+d,m),a.stroke()}},h=b.prototype;Object.defineProperties(h,{type:{set:function(a){var b=this._;a!==b.biquad.type&&(b.biquad.setType(a),b.plotFlush=!0)},get:function(){return this._.biquad.type}},freq:{set:function(b){this._.freq=a(b)},get:function(){return this._.freq}},cutoff:{set:function(b){this._.freq=a(b)},get:function(){return this._.freq}},res:{set:function(b){this._.band=a(b)},get:function(){return this._.band}},Q:{set:function(b){this._.band=a(b)},get:function(){return this._.band}},band:{set:function(b){this._.band=a(b)},get:function(){return this._.band}},gain:{set:function(b){this._.gain=a(b)},get:function(){return this._.gain}}}),h.process=function(a){var b=this._;if(this.tickID!==a){this.tickID=a,c.inputSignalAR(this);var d=b.freq.process(a).cells[0][0],e=b.band.process(a).cells[0][0],f=b.gain.process(a).cells[0][0];(b.prevFreq!==d||b.prevband!==e||b.prevGain!==f)&&(b.prevFreq=d,b.prevband=e,b.prevGain=f,b.biquad.setParams(d,e,f),b.plotFlush=!0),b.bypassed||b.biquad.process(this.cells[1],this.cells[2]),c.outputSignalAR(this)}return this};var i=new d(2048),j=a.Object.prototype.plot;h.plot=function(a){if(this._.plotFlush){var b=new e(this._.samplerate);b.setType(this.type),b.setParams(this.freq.valueOf(),this.band.valueOf(),this.gain.valueOf());var c=new Float32Array(i.length);c[0]=1,b.process(c,c),i.forward(c);var d,g,h,k,l,m,n,o,p=512,q=new Float32Array(p),r=.5*this._.samplerate,s=new Float32Array(p);for(i.getFrequencyData(s),d=0;p>d;++d)h=Math.pow(r/f,d/p)*f,g=h/(r/s.length),k=0|g,l=g-k,0===k?n=m=o=s[k]:(m=s[k-1],n=s[k],o=(1-l)*m+l*n),q[d]=o;this._.plotData=q,this._.plotFlush=null}return j.call(this,a)},c.register("biquad",b),c.register("lowpass",function(a){return new b(a).set("type","lowpass")}),c.register("highpass",function(a){return new b(a).set("type","highpass")}),c.register("bandpass",function(a){return new b(a).set("type","bandpass")}),c.register("lowshelf",function(a){return new b(a).set("type","lowshelf")}),c.register("highshelf",function(a){return new b(a).set("type","highshelf")}),c.register("peaking",function(a){return new b(a).set("type","peaking")}),c.register("notch",function(a){return new b(a).set("type","notch")}),c.register("allpass",function(a){return new b(a).set("type","allpass")}),c.alias("lpf","lowpass"),c.alias("hpf","highpass"),c.alias("bpf","bandpass"),c.alias("bef","notch"),c.alias("brf","notch"),c.alias("apf","allpass")}(timbre),function(a){"use strict";function b(b){a.Object.call(this,1,b),c.fixAR(this);var d=this._;d.pitch=a(1),d.samplerate=44100,d.channels=0,d.bufferMix=null,d.buffer=[],d.isLooped=!1,d.isReversed=!1,d.duration=0,d.currentTime=0,d.currentTimeObj=null,d.phase=0,d.phaseIncr=0,d.onended=c.make_onended(this,0),d.onlooped=f(this)}var c=a.fn,d=a.modules.Scissor.Tape,e=function(a){return c.isSignalArray(a)||a instanceof Float32Array};c.extend(b);var f=function(a){return function(){var b=a._;b.phase>=b.buffer[0].length?b.phase=0:b.phase<0&&(b.phase=b.buffer[0].length+b.phaseIncr),a._.emit("looped")}},g=b.prototype,h=function(b){var c=this._;if("object"==typeof b){var f,g,h=[];e(b)?(h[0]=b,g=1):"object"==typeof b&&(b instanceof a.Object?b=b.buffer:b instanceof d&&(b=b.getBuffer()),Array.isArray(b.buffer)?e(b.buffer[0])&&(e(b.buffer[1])&&e(b.buffer[2])?(g=2,h=b.buffer):(g=1,h=[b.buffer[0]])):e(b.buffer)&&(g=1,h=[b.buffer]),"number"==typeof b.samplerate&&(f=b.samplerate)),h.length&&(f>0&&(c.samplerate=b.samplerate),c.bufferMix=null,c.buffer=h,c.phase=0,c.phaseIncr=c.samplerate/a.samplerate,c.duration=1e3*c.buffer[0].length/c.samplerate,c.currentTime=0,c.plotFlush=!0,this.reverse(c.isReversed))}};Object.defineProperties(g,{buffer:{set:h,get:function(){var a=this._;return{samplerate:a.samplerate,channels:a.channels,buffer:a.buffer}}},pitch:{set:function(b){this._.pitch=a(b)},get:function(){return this._.pitch}},isLooped:{get:function(){return this._.isLooped}},isReversed:{get:function(){return this._.isReversed}},samplerate:{get:function(){return this._.samplerate}},duration:{get:function(){return this._.duration}},currentTime:{set:function(b){if("number"==typeof b){var c=this._;b>=0&&b<=c.duration&&(c.phase=b/1e3*c.samplerate,c.currentTime=b)}else b instanceof a.Object?this._.currentTimeObj=b:null===b&&(this._.currentTimeObj=null)},get:function(){return this._.currentTimeObj?this._.currentTimeObj:this._.currentTime}}}),g.clone=function(){var a=this._,b=c.clone(this);return a.buffer.length&&h.call(b,{buffer:a.buffer,samplerate:a.samplerate,channels:a.channels}),b.loop(a.isLooped),b.reverse(a.isReversed),b},g.slice=function(b,d){var e=this._,f=a(e.originkey),g=e.isReversed;if(e.buffer.length){if(b="number"==typeof b?.001*b*e.samplerate|0:0,d="number"==typeof d?.001*d*e.samplerate|0:e.buffer[0].length,b>d){var i=b;b=d,d=i,g=!g}2===e.channels?h.call(f,{buffer:[c.pointer(e.buffer[0],b,d-b),c.pointer(e.buffer[1],b,d-b),c.pointer(e.buffer[2],b,d-b)],samplerate:e.samplerate}):h.call(f,{buffer:c.pointer(e.buffer[0],b,d-b),samplerate:e.samplerate}),f.playbackState=c.PLAYING_STATE}return f.loop(e.isLooped),f.reverse(e.isReversed),f},g.reverse=function(a){var b=this._;return b.isReversed=!!a,b.isReversed?(b.phaseIncr>0&&(b.phaseIncr*=-1),0===b.phase&&b.buffer.length&&(b.phase=b.buffer[0].length+b.phaseIncr)):b.phaseIncr<0&&(b.phaseIncr*=-1),this},g.loop=function(a){return this._.isLooped=!!a,this},g.bang=function(a){return this.playbackState=a===!1?c.FINISHED_STATE:c.PLAYING_STATE,this._.phase=0,this._.emit("bang"),this},g.process=function(a){var b=this._;if(!b.buffer.length)return this;if(this.tickID!==a){this.tickID=a;var d,e,f,g=this.cells[1],h=this.cells[2],i=b.phase,j=b.cellsize;if(2===b.channels?(e=b.buffer[1],f=b.buffer[2]):e=f=b.buffer[0],b.currentTimeObj){var k,l=b.currentTimeObj.process(a).cells[0],m=.001*b.samplerate;for(d=0;j>d;++d)k=l[d],i=k*m,g[d]=e[0|i]||0,h[d]=f[0|i]||0;b.phase=i,b.currentTime=k}else{var n=b.pitch.process(a).cells[0][0],o=b.phaseIncr*n;for(d=0;j>d;++d)g[d]=e[0|i]||0,h[d]=f[0|i]||0,i+=o;i>=e.length?c.nextTick(b.isLooped?b.onlooped:b.onended):0>i&&c.nextTick(b.isLooped?b.onlooped:b.onended),b.phase=i,b.currentTime+=c.currentTimeIncr}c.outputSignalAR(this)}return this};var i=a.Object.prototype.plot;g.plot=function(a){var b,c,d=this._;if(d.plotFlush){2===d.channels?(b=d.buffer[1],c=d.buffer[2]):b=c=d.buffer[0];for(var e=new Float32Array(2048),f=0,g=b.length/2048,h=0;2048>h;h++)e[h]=.5*(b[0|f]+c[0|f]),f+=g;d.plotData=e,d.plotFlush=null}return i.call(this,a)},c.register("buffer",b)}(timbre),function(a){"use strict";function b(b){a.Object.call(this,2,b),c.fixAR(this);var e=new d(this._.samplerate);e.setDelayTime(20),e.setRate(4),e.depth=20,e.feedback=.2,e.mix=.33,this._.chorus=e}var c=a.fn,d=a.modules.Chorus;c.extend(b);var e=b.prototype;Object.defineProperties(e,{type:{set:function(a){this._.chorus.setDelayTime(a)},get:function(){return this._.chorus.wave}},delay:{set:function(a){a>=.5&&80>=a&&this._.chorus.setDelayTime(a)},get:function(){return this._.chorus.delayTime}},rate:{set:function(a){"number"==typeof a&&a>0&&this._.chorus.setRate(a)},get:function(){return this._.chorus.rate}},depth:{set:function(a){"number"==typeof a&&a>=0&&100>=a&&(a*=this._.samplerate/44100,this._.chorus.depth=a)},get:function(){return this._.chorus.depth}},fb:{set:function(a){"number"==typeof a&&a>=-1&&1>=a&&(this._.chorus.feedback=.99996*a)},get:function(){return this._.chorus.feedback}},mix:{set:function(b){this._.mix=a(b)},get:function(){return this._.mix}}}),e.process=function(a){var b=this._;return this.tickID!==a&&(this.tickID=a,c.inputSignalAR(this),b.bypassed||b.chorus.process(this.cells[1],this.cells[2]),c.outputSignalAR(this)),this},c.register("chorus",b)}(timbre),function(a){"use strict";function b(b){a.Object.call(this,2,b);var c=this._;c.min=-.8,c.max=.8}var c=a.fn;c.extend(b);var d=b.prototype;Object.defineProperties(d,{minmax:{set:function(a){var b=this._;"number"==typeof a&&(b.min=-Math.abs(a),b.max=-b.min)},get:function(){return this._.max}},min:{set:function(a){var b=this._;"number"==typeof a&&(b.max<a?b.max=a:b.min=a)},get:function(){return this._.min}},max:{set:function(a){var b=this._;"number"==typeof a&&(a<b.min?b.min=a:b.max=a)},get:function(){return this._.max}}}),d.process=function(a){var b=this._;if(this.tickID!==a){this.tickID=a;var d,e,f=this.cells[1],g=this.cells[2],h=f.length,i=b.min,j=b.max;if(b.ar){for(c.inputSignalAR(this),d=0;h>d;++d)e=f[d],i>e?e=i:e>j&&(e=j),f[d]=e,e=g[d],i>e?e=i:e>j&&(e=j),g[d]=e;c.outputSignalAR(this)}else e=c.inputSignalKR(this),i>e?e=i:e>j&&(e=j),this.cells[0][0]=e,c.outputSignalKR(this)}return this},c.register("clip",b)}(timbre),function(a){"use strict";function b(b){a.Object.call(this,2,b),c.fixAR(this);var d=this._;d.prevThresh=-24,d.prevKnee=30,d.prevRatio=12,d.thresh=a(d.prevThresh),d.knee=a(d.prevKnee),d.ratio=a(d.prevRatio),d.postGain=6,d.reduction=0,d.attack=3,d.release=25,d.comp=new e(d.samplerate),d.comp.dbPostGain=d.postGain,d.comp.setAttackTime(.001*d.attack),d.comp.setReleaseTime(.001*d.release),d.comp.setPreDelayTime(6),d.comp.setParams(d.prevThresh,d.prevKnee,d.prevRatio)}var c=a.fn,d=a.timevalue,e=a.modules.Compressor;c.extend(b);var f=b.prototype;Object.defineProperties(f,{thresh:{set:function(b){this._.thresh=a(b)},get:function(){return this._.thresh}},thre:{set:function(b){this._.thresh=a(b)},get:function(){return this._.thre}},knee:{set:function(b){this._.kne=a(b)},get:function(){return this._.knee}},ratio:{set:function(b){this._.ratio=a(b)},get:function(){return this._.ratio}},gain:{set:function(a){"number"==typeof a&&(this._.comp.dbPostGain=a)},get:function(){return this._.comp.dbPostGain}},attack:{set:function(a){"string"==typeof a&&(a=d(a)),"number"==typeof a&&(a=0>a?0:a>1e3?1e3:a,this._.attack=a,this._.comp.setAttackTime(.001*a))},get:function(){return this._.attack}},release:{set:function(a){"string"==typeof a&&(a=d(a)),"number"==typeof a&&(a=0>a?0:a>1e3?1e3:a,this._.release=a,this._.comp.setReleaseTime(.001*a))},get:function(){return this._.release}},reduction:{get:function(){return this._.reduction}}}),f.process=function(a){var b=this._;if(this.tickID!==a){this.tickID=a,c.inputSignalAR(this);var d=b.thresh.process(a).cells[0][0],e=b.knee.process(a).cells[0][0],f=b.ratio.process(a).cells[0][0];(b.prevThresh!==d||b.prevKnee!==e||b.prevRatio!==f)&&(b.prevThresh=d,b.prevKnee=e,b.prevRatio=f,b.comp.setParams(d,e,f)),b.bypassed||(b.comp.process(this.cells[1],this.cells[2]),b.reduction=b.comp.meteringGain),c.outputSignalAR(this)}return this},c.register("comp",b)}(timbre),function(a){"use strict";function b(b){a.Object.call(this,2,b),c.fixAR(this);var d=this._;d.time=a(100),d.fb=a(.2),d.cross=a(!1),d.mix=.33,d.delay=new e(d.samplerate)}var c=a.fn,d=a.timevalue,e=a.modules.StereoDelay;c.extend(b);var f=b.prototype;Object.defineProperties(f,{time:{set:function(b){"string"==typeof b&&(b=d(b)),this._.time=a(b)},get:function(){return this._.time}},fb:{set:function(b){this._.fb=a(b)},get:function(){return this._.fb}},cross:{set:function(b){this._.cross=a(b)},get:function(){return this._.cross}},mix:{set:function(a){"number"==typeof a&&(a=a>1?1:0>a?0:a,this._.mix=a)},get:function(){return this._.mix}}}),f.process=function(a){var b=this._;if(this.tickID!==a){this.tickID=a;var d=b.time.process(a).cells[0][0],e=b.fb.process(a).cells[0][0],f=0!==b.cross.process(a).cells[0][0],g=b.mix;(b.prevTime!==d||b.prevFb!==e||b.prevCross!==f||b.prevMix!==g)&&(b.prevTime=d,b.prevFb=e,b.prevCross=f,b.prevMix=g,b.delay.setParams(d,e,f,g)),c.inputSignalAR(this),b.bypassed||b.delay.process(this.cells[1],this.cells[2]),c.outputSignalAR(this)}return this},c.register("delay",b)}(timbre),function(a){"use strict";function b(b){a.Object.call(this,2,b),c.fixAR(this);var d=this._;d.pre=a(60),d.post=a(-18),d.x1L=d.x2L=d.y1L=d.y2L=0,d.x1R=d.x2R=d.y1R=d.y2R=0,d.b0=d.b1=d.b2=d.a1=d.a2=0,d.cutoff=0,d.Q=1,d.preScale=0,d.postScale=0}var c=a.fn;c.extend(b);var d=b.prototype;Object.defineProperties(d,{cutoff:{set:function(a){"number"==typeof a&&a>0&&(this._.cutoff=a)},get:function(){return this._.cutoff}},pre:{set:function(b){this._.pre=a(b)},get:function(){return this._.pre}},post:{set:function(b){this._.post=a(b)},get:function(){return this._.post}}}),d.process=function(a){var b=this._;if(this.tickID!==a){this.tickID=a,c.inputSignalAR(this);var d=-b.pre.process(a).cells[0][0],f=-b.post.process(a).cells[0][0];if((b.prevPreGain!==d||b.prevPostGain!==f)&&(b.prevPreGain=d,b.prevPostGain=f,b.preScale=Math.pow(10,.05*-d),b.postScale=Math.pow(10,.05*-f)),!b.bypassed){var g,h,i,j,k,l=this.cells[1],m=this.cells[2],n=b.preScale,o=b.postScale;if(b.cutoff){b.prevCutoff!==b.cutoff&&(b.prevCutoff=b.cutoff,e(b));var p=b.x1L,q=b.x2L,r=b.y1L,s=b.y2L,t=b.x1R,u=b.x2R,v=b.y1R,w=b.y2R,x=b.b0,y=b.b1,z=b.b2,A=b.a1,B=b.a2;for(g=0,h=l.length;h>g;++g)j=l[g]*n,k=x*j+y*p+z*q-A*r-B*s,i=k*o,-1>i?i=-1:i>1&&(i=1),l[g]=i,q=p,p=j,s=r,r=k,j=m[g]*n,k=x*j+y*t+z*u-A*v-B*w,i=k*o,-1>i?i=-1:i>1&&(i=1),m[g]=i,u=t,t=j,w=v,v=k;b.x1L=p,b.x2L=q,b.y1L=r,b.y2L=s,b.x1R=t,b.x2R=u,b.y1R=v,b.y2R=w}else for(g=0,h=l.length;h>g;++g)i=l[g]*n*o,-1>i?i=-1:i>1&&(i=1),l[g]=i,i=m[g]*n*o,-1>i?i=-1:i>1&&(i=1),m[g]=i}c.outputSignalAR(this)}return this};var e=function(a){var b=2*Math.PI*a.cutoff/a.samplerate,c=Math.cos(b),d=Math.sin(b),e=d/(2*a.Q),f=1/(1+e);a.b0=.5*(1-c)*f,a.b1=1-c*f,a.b2=.5*(1-c)*f,a.a1=-2*c*f,a.a2=1-e*f};c.register("dist",b)}(timbre),function(a){"use strict";function b(b){a.Object.call(this,2,b),this._.ar=!1}var c=a.fn;c.extend(b);var d=b.prototype;d.process=function(a){var b=this._;if(this.tickID!==a){this.tickID=a;var d,e,f,g,h,i,j=this.nodes,k=this.cells[0],l=this.cells[1],m=this.cells[2],n=j.length,o=k.length;if(b.ar){if(j.length>0)for(j[0].process(a),g=j[0].cells[1],h=j[0].cells[2],l.set(g),m.set(h),d=1;n>d;++d)for(j[d].process(a),g=j[d].cells[1],h=j[d].cells[2],e=0;o>e;++e)i=g[e],l[e]=0===i?0:l[e]/i,i=h[e],m[e]=0===i?0:m[e]/i;else for(e=0;o>e;++e)l[e]=m[d]=0;c.outputSignalAR(this)}else{if(j.length>0)for(f=j[0].process(a).cells[0][0],d=1;n>d;++d)i=j[d].process(a).cells[0][0],f=0===i?0:f/i;else f=0;k[0]=f,c.outputSignalKR(this)}}return this},c.register("/",b)}(timbre),function(a){"use strict";function b(b){a.Object.call(this,2,b);var c=this._;c.env=new f(c.samplerate),c.env.setStep(c.cellsize),c.tmp=new d.SignalArray(c.cellsize),c.ar=!1,c.plotFlush=!0,c.onended=i(this),this.on("ar",h)}function c(a,b,c,d,e,f){var g=c;return"number"==typeof a[d]?g=a[d]:"number"==typeof a[e]?g=a[e]:f&&("string"==typeof a[d]?g=f(a[d]):"string"==typeof a[e]&&(g=f(a[e]))),b>g&&(g=b),g}var d=a.fn,e=a.timevalue,f=a.modules.Envelope,g=d.isDictionary;d.extend(b);var h=function(a){this._.env.setStep(a?1:this._.cellsize)},i=function(a){return function(){a._.emit("ended")}},j=b.prototype;Object.defineProperties(j,{table:{set:function(a){Array.isArray(a)&&(k.call(this,a),this._.plotFlush=!0)},get:function(){return this._.env.table}},curve:{set:function(a){this._.env.setCurve(a)},get:function(){return this._.env.curve}},releaseNode:{set:function(a){this._.env.setReleaseNode(a),this._.plotFlush=!0},get:function(){return this._.env.releaseNode+1}},loopNode:{set:function(a){this._.env.setLoopNode(a),this._.plotFlush=!0},get:function(){return this._.env.loopNode+1}}}),j.clone=function(){var a=d.clone(this);return a._.env=this._.env.clone(),a},j.reset=function(){return this._.env.reset(),this},j.release=function(){var a=this._;return a.env.release(),a.emit("released"),this},j.bang=function(){var a=this._;return a.env.reset(),a.env.status=f.StatusGate,a.emit("bang"),this},j.process=function(a){var b=this._;if(this.tickID!==a){this.tickID=a;var c,e=this.cells[1],f=this.cells[2],g=b.cellsize;if(this.nodes.length)d.inputSignalAR(this);else for(c=0;g>c;++c)e[c]=f[c]=1;var h,i=null;if(b.ar){var j=b.tmp;for(b.env.process(j),c=0;g>c;++c)e[c]*=j[c],f[c]*=j[c];i=b.env.emit}else{for(h=b.env.next(),c=0;g>c;++c)e[c]*=h,f[c]*=h;i=b.env.emit}d.outputSignalAR(this),i&&("ended"===i?d.nextTick(b.onended):this._.emit(i,b.value))}return this};var k=function(a){for(var b,c,d,g,h=this._.env,i=[a[0]||m],j=1,k=a.length;k>j;++j)b=a[j][0]||m,c=a[j][1],d=a[j][2],"number"!=typeof c&&(c="string"==typeof c?e(c):10),10>c&&(c=10),"number"==typeof d?(g=d,d=f.CurveTypeCurve):(d=f.CurveTypeDict[d]||null,g=0),i.push([b,c,d,g]);h.setTable(i)},l=a.Object.prototype.plot;j.plot=function(a){if(this._.plotFlush){var b,c,d=this._.env.clone(),e=d.getInfo(1e3),g=e.totalDuration,h=e.loopBeginTime,i=e.releaseBeginTime,j=new Float32Array(256),k=0,m=g/j.length,n=!1,o=.001*g*this._.samplerate|0;for(o/=j.length,d.setStep(o),d.status=f.StatusGate,b=0,c=j.length;c>b;++b)j[b]=d.next(),k+=m,!n&&k>=i&&(d.release(),n=!0);this._.plotData=j,this._.plotBefore=function(a,b,c,d,e){var f,j;1/0!==h&&1/0!==i&&(f=b+d*(h/g),j=b+d*(i/g),j-=f,a.fillStyle="rgba(224, 224, 224, 0.8)",a.fillRect(f,0,j,e)),1/0!==i&&(f=b+d*(i/g),j=d-f,a.fillStyle="rgba(212, 212, 212, 0.8)",a.fillRect(f,0,j,e))};var p=1/0,q=-1/0;for(b=0;c>b;++b)j[b]<p?p=j[b]:j[b]>q&&(q=j[b]);1>q&&(q=1),this._.plotRange=[p,q],this._.plotData=j,this._.plotFlush=null}return l.call(this,a)},d.register("env",b);var m=f.ZERO;d.register("perc",function(a){g(a[0])||a.unshift({});var d=a[0],f=c(d,10,10,"a","attackTime",e),h=c(d,10,1e3,"r","releaseTime",e),i=c(d,m,1,"lv","level");return d.table=[m,[i,f],[m,h]],new b(a)}),d.register("adsr",function(a){g(a[0])||a.unshift({});var d=a[0],f=c(d,10,10,"a","attackTime",e),h=c(d,10,300,"d","decayTime",e),i=c(d,m,.5,"s","sustainLevel"),j=c(d,10,1e3,"r","decayTime",e),k=c(d,m,1,"lv","level");return d.table=[m,[k,f],[i,h],[m,j]],d.releaseNode=3,new b(a)}),d.register("adshr",function(a){g(a[0])||a.unshift({});var d=a[0],f=c(d,10,10,"a","attackTime",e),h=c(d,10,300,"d","decayTime",e),i=c(d,m,.5,"s","sustainLevel"),j=c(d,10,500,"h","holdTime",e),k=c(d,10,1e3,"r","decayTime",e),l=c(d,m,1,"lv","level");return d.table=[m,[l,f],[i,h],[i,j],[m,k]],new b(a)}),d.register("asr",function(a){g(a[0])||a.unshift({});var d=a[0],f=c(d,10,10,"a","attackTime",e),h=c(d,m,.5,"s","sustainLevel"),i=c(d,10,1e3,"r","releaseTime",e);return d.table=[m,[h,f],[m,i]],d.releaseNode=2,new b(a)}),d.register("dadsr",function(a){g(a[0])||a.unshift({});var d=a[0],f=c(d,10,100,"dl","delayTime",e),h=c(d,10,10,"a","attackTime",e),i=c(d,10,300,"d","decayTime",e),j=c(d,m,.5,"s","sustainLevel"),k=c(d,10,1e3,"r","relaseTime",e),l=c(d,m,1,"lv","level");return d.table=[m,[m,f],[l,h],[j,i],[m,k]],d.releaseNode=4,new b(a)}),d.register("ahdsfr",function(a){g(a[0])||a.unshift({});var d=a[0],f=c(d,10,10,"a","attackTime",e),h=c(d,10,10,"h","holdTime",e),i=c(d,10,300,"d","decayTime",e),j=c(d,m,.5,"s","sustainLevel"),k=c(d,10,5e3,"f","fadeTime",e),l=c(d,10,1e3,"r","relaseTime",e),n=c(d,m,1,"lv","level");return d.table=[m,[n,f],[n,h],[j,i],[m,k],[m,l]],d.releaseNode=5,new b(a)}),d.register("linen",function(a){g(a[0])||a.unshift({});var d=a[0],f=c(d,10,10,"a","attackTime",e),h=c(d,10,1e3,"s","sustainTime",e),i=c(d,10,1e3,"r","releaseTime",e),j=c(d,m,1,"lv","level");return d.table=[m,[j,f],[j,h],[m,i]],new b(a)}),d.register("env.tri",function(a){g(a[0])||a.unshift({});var d=a[0],f=c(d,20,1e3,"dur","duration",e),h=c(d,m,1,"lv","level");return f*=.5,d.table=[m,[h,f],[m,f]],new b(a)}),d.register("env.cutoff",function(a){g(a[0])||a.unshift({});var d=a[0],f=c(d,10,100,"r","relaseTime",e),h=c(d,m,1,"lv","level");return d.table=[h,[m,f]],new b(a)})}(timbre),function(a){"use strict";function b(b){a.Object.call(this,2,b),c.fixAR(this);var d=this._;d.biquads=new Array(7),d.plotBefore=h,d.plotRange=[-18,18],d.plotFlush=!0}var c=a.fn,d=a.modules.FFT,e=a.modules.Biquad,f=20,g={hpf:0,lf:1,lmf:2,mf:3,hmf:4,hf:5,lpf:6};c.extend(b);var h=function(a,b,c,d,e){a.lineWidth=1,a.strokeStyle="rgb(192, 192, 192)";for(var g=.5*this._.samplerate,h=1;10>=h;++h)for(var i=1;4>=i;i++){var j=h*Math.pow(10,i);if(!(f>=j||j>=g)){a.beginPath();var k=Math.log(j/f)/Math.log(g/f);k=(k*d+b|0)+.5,a.moveTo(k,c),a.lineTo(k,c+e),a.stroke()}}var l=e/6;for(h=1;6>h;h++){a.beginPath();var m=(c+h*l|0)+.5;a.moveTo(b,m),a.lineTo(b+d,m),a.stroke()}},i=b.prototype;Object.defineProperties(i,{params:{set:function(a){if("object"==typeof a)for(var b=Object.keys(a),c=0,d=b.length;d>c;++c){var e=a[b[c]];Array.isArray(e)?this.setParams(b[c],e[0],e[1],e[2]):this.setParams(b[c])}}}}),i.setParams=function(a,b,c,d){var f=this._;if("string"==typeof a&&(a=g[a]),a>=0&&a<f.biquads.length){if(a|=0,"number"==typeof b&&"number"==typeof c){"number"!=typeof d&&(d=0);var h=f.biquads[a];if(!h)switch(h=f.biquads[a]=new e(f.samplerate),a){case 0:h.setType("highpass");break;case f.biquads.length-1:h.setType("lowpass");break;default:h.setType("peaking")}h.setParams(b,c,d)}else f.biquads[a]=void 0;f.plotFlush=!0}return this},i.getParams=function(a){var b=this._,c=b.biquads[0|a];return c?{freq:c.frequency,Q:c.Q,gain:c.gain}:void 0},i.process=function(a){var b=this._;if(this.tickID!==a){if(this.tickID=a,c.inputSignalAR(this),!b.bypassed)for(var d=this.cells[1],e=this.cells[2],f=b.biquads,g=0,h=f.length;h>g;++g)f[g]&&f[g].process(d,e);c.outputSignalAR(this)}return this};var j=new d(2048),k=a.Object.prototype.plot;i.plot=function(a){if(this._.plotFlush){var b=this._,c=new Float32Array(j.length);c[0]=1;for(var d=0,g=b.biquads.length;g>d;++d){var h=this.getParams(d);if(h){var i=new e(b.samplerate);i.setType(0===d?"highpass":d===g-1?"lowpass":"peaking"),i.setParams(h.freq,h.Q,h.gain),i.process(c,c)}}j.forward(c);var l,m,n,o,p,q,r,s=512,t=new Float32Array(s),u=.5*b.samplerate,v=new Float32Array(s);for(j.getFrequencyData(v),d=0;s>d;++d)m=Math.pow(u/f,d/s)*f,l=m/(u/v.length),n=0|l,o=l-n,0===n?q=p=r=v[n]:(p=v[n-1],q=v[n],r=(1-o)*p+o*q),t[d]=r;this._.plotData=t,this._.plotFlush=null}return k.call(this,a)},c.register("eq",b)}(timbre),function(a){"use strict";function b(b){a.Object.call(this,2,b),c.listener(this),c.fixAR(this),this.real=new a.ChannelObject(this),this.imag=new a.ChannelObject(this),this.cells[3]=this.real.cell,this.cells[4]=this.imag.cell;var e=this._;e.fft=new d(2*e.cellsize),e.fftCell=new c.SignalArray(e.fft.length),e.prevCell=new c.SignalArray(e.cellsize),e.freqs=new c.SignalArray(e.fft.length>>1),e.plotFlush=!0,e.plotRange=[0,32],e.plotBarStyle=!0}var c=a.fn,d=a.modules.FFT;c.extend(b);var e=b.prototype;Object.defineProperties(e,{window:{set:function(a){this._.fft.setWindow(a)},get:function(){return this._.fft.windowName}},spectrum:{get:function(){return this._.fft.getFrequencyData(this._.freqs)}}}),e.process=function(a){var b=this._;if(this.tickID!==a){this.tickID=a,c.inputSignalAR(this),c.outputSignalAR(this);var d=this.cells[0],e=b.cellsize;b.fftCell.set(b.prevCell),b.fftCell.set(d,e),b.fft.forward(b.fftCell),b.prevCell.set(d),b.plotFlush=!0,this.cells[3].set(b.fft.real.subarray(0,e)),this.cells[4].set(b.fft.imag.subarray(0,e))}return this};var f=a.Object.prototype.plot;e.plot=function(a){return this._.plotFlush&&(this._.plotData=this.spectrum,this._.plotFlush=null),f.call(this,a)},c.register("fft",b)}(timbre),function(a){"use strict";function b(b){a.Object.call(this,1,b),c.fixAR(this);var d=this._;d.freq=a(440),d.reg=32768,d.shortFlag=!1,d.phase=0,d.lastValue=0}var c=a.fn;c.extend(b);var d=b.prototype;Object.defineProperties(d,{shortFlag:{set:function(a){this._.shortFlag=!!a},get:function(){return this._.shortFlag}},freq:{set:function(b){this._.freq=a(b)},get:function(){return this._.freq}}}),d.process=function(a){var b=this._,c=this.cells[0];if(this.tickID!==a){this.tickID=a;var d,e,f=b.lastValue,g=b.phase,h=b.freq.process(a).cells[0][0]/b.samplerate,i=b.reg,j=b.mul,k=b.add;if(b.shortFlag)for(d=0,e=c.length;e>d;++d)g>=1&&(i>>=1,i|=(1&(i^i>>6))<<15,f=(1&i)-.5,g-=1),c[d]=f*j+k,g+=h;else for(d=0,e=c.length;e>d;++d)g>=1&&(i>>=1,i|=(1&(i^i>>1))<<15,f=(1&i)-.5,g-=1),c[d]=f*j+k,g+=h;b.reg=i,b.phase=g,b.lastValue=f}return this},c.register("fnoise",b)}(timbre),function(a){"use strict";function b(b){a.Object.call(this,2,b),c.fixAR(this),this._.selected=0,this._.outputs=[]}var c=a.fn,d=function(){function b(b){a.Object.call(this,2,[]),c.fixAR(this),this._.parent=b}return c.extend(b),b.prototype.process=function(a){return this.tickID!==a&&(this.tickID=a,this._.parent.process(a)),this},b}();c.extend(b);var e=b.prototype;Object.defineProperties(e,{selected:{set:function(a){var b=this._;if("number"==typeof a){b.selected=a;for(var d=b.outputs,e=0,f=d.length;f>e;++e)d[e]&&(d[e].cells[0].set(c.emptycell),d[e].cells[1].set(c.emptycell),d[e].cells[2].set(c.emptycell))}},get:function(){return this._.selected}}}),e.at=function(a){var b=this._,c=b.outputs[a];return c||(b.outputs[a]=c=new d(this)),c},e.process=function(a){var b=this._;if(this.tickID!==a){this.tickID=a,c.inputSignalAR(this),c.outputSignalAR(this);var d=b.outputs[b.selected];d&&(d.cells[0].set(this.cells[0]),d.cells[1].set(this.cells[1]),d.cells[2].set(this.cells[2]))}return this},c.register("gate",b)}(timbre),function(a){"use strict";function b(b){a.Object.call(this,1,b),c.fixAR(this);var e=this._;e.fft=new d(2*e.cellsize),e.fftCell=new c.SignalArray(this._.fft.length),e.realBuffer=new c.SignalArray(this._.fft.length),e.imagBuffer=new c.SignalArray(this._.fft.length)}var c=a.fn,d=a.modules.FFT;c.extend(b);var e=b.prototype;
Object.defineProperties(e,{real:{set:function(b){this._.real=a(b)},get:function(){return this._.real}},imag:{set:function(b){this._.imag=a(b)},get:function(){return this._.imag}}}),e.process=function(a){var b=this._;if(this.tickID!==a&&(this.tickID=a,b.real&&b.imag)){var d=this.cells[0],e=b.realBuffer,f=b.imagBuffer,g=b.real.process(a).cells[0],h=b.imag.process(a).cells[0];e.set(g),f.set(h),d.set(b.fft.inverse(e,f).subarray(0,b.cellsize)),c.outputSignalAR(this)}return this},c.register("ifft",b)}(timbre),function(a){"use strict";function b(b){a.Object.call(this,1,b),c.timer(this),c.fixKR(this);var d=this._;d.interval=a(1e3),d.count=0,d.delay=0,d.timeout=1/0,d.currentTime=0,d.delaySamples=0,d.countSamples=0,d.onended=c.make_onended(this),this.on("start",e)}var c=a.fn,d=a.timevalue;c.extend(b);var e=function(){var a=this._;this.playbackState=c.PLAYING_STATE,a.delaySamples=.001*a.samplerate*a.delay|0,a.countSamples=a.count=a.currentTime=0};Object.defineProperty(e,"unremovable",{value:!0,writable:!1});var f=b.prototype;Object.defineProperties(f,{interval:{set:function(b){"string"==typeof b&&(b=d(b),0>=b&&(b=0)),this._.interval=a(b)},get:function(){return this._.interval}},delay:{set:function(a){"string"==typeof a&&(a=d(a)),"number"==typeof a&&a>=0&&(this._.delay=a,this._.delaySamples=.001*this._.samplerate*a|0)},get:function(){return this._.delay}},count:{set:function(a){"number"==typeof a&&(this._.count=a)},get:function(){return this._.count}},timeout:{set:function(a){"string"==typeof a&&(a=d(a)),"number"==typeof a&&a>=0&&(this._.timeout=a)},get:function(){return this._.timeout}},currentTime:{get:function(){return this._.currentTime}}}),f.bang=function(){var a=this._;return this.playbackState=c.PLAYING_STATE,a.delaySamples=.001*a.samplerate*a.delay|0,a.countSamples=a.count=a.currentTime=0,a.emit("bang"),this},f.process=function(a){var b=this.cells[0],d=this._;if(this.tickID!==a){this.tickID=a,d.delaySamples>0&&(d.delaySamples-=b.length);var e=d.interval.process(a).cells[0][0];if(d.delaySamples<=0&&(d.countSamples-=b.length,d.countSamples<=0)){d.countSamples+=d.samplerate*e*.001|0;for(var f=this.nodes,g=d.count,h=g*d.mul+d.add,i=0,j=b.length;j>i;++i)b[i]=h;for(var k=0,l=f.length;l>k;++k)f[k].bang(g);d.count+=1}d.currentTime+=c.currentTimeIncr,d.currentTime>=d.timeout&&c.nextTick(d.onended)}return this},c.register("interval",b)}(timbre),function(a){"use strict";function b(b){a.Object.call(this,1,b),c.fixAR(this);var d=this._,e=Math.ceil(Math.log(d.samplerate)*Math.LOG2E);d.buffersize=1<<e,d.buffermask=d.buffersize-1,d.buffer=new c.SignalArray(d.buffersize),d.time=0,d.readIndex=0,d.writeIndex=0}var c=a.fn,d=a.timevalue;c.extend(b);var e=b.prototype;Object.defineProperties(e,{time:{set:function(a){if("string"==typeof a&&(a=d(a)),"number"==typeof a&&a>0){var b=this._;b.time=a;var c=.001*a*b.samplerate|0;c>b.buffermask&&(c=b.buffermask),b.writeIndex=b.readIndex+c&b.buffermask}},get:function(){return this._.time}}}),e.process=function(a){var b=this._;if(this.tickID!==a){this.tickID=a,c.inputSignalAR(this);var d,e=this.cells[0],f=b.buffer,g=b.buffermask,h=b.readIndex,i=b.writeIndex,j=e.length;for(d=0;j>d;++d)f[i]=e[d],e[d]=f[h],h+=1,i=i+1&g;b.readIndex=h&g,b.writeIndex=i,c.outputSignalAR(this)}return this},c.register("lag",b)}(timbre),function(a){"use strict";function b(b){a.Object.call(this,1,b);var c=this._;c.input=0,c.value=0,c.prev=null,c.ar=!1,c.map=d}var c=a.fn;c.extend(b);var d=function(a){return a},e=b.prototype;Object.defineProperties(e,{input:{set:function(a){"number"==typeof a&&(this._.input=a)},get:function(){return this._.input}},map:{set:function(a){"function"==typeof a&&(this._.map=a)},get:function(){return this._.map}}}),e.bang=function(){return this._.prev=null,this._.emit("bang"),this},e.at=function(a){return this._.map?this._.map(a):0},e.process=function(a){var b=this.cells[0],d=this._;if(this.tickID!==a){this.tickID=a;var e,f=this.nodes.length,g=b.length;if(d.ar&&f){c.inputSignalAR(this);var h=d.map;if(h)for(e=0;g>e;++e)b[e]=h(b[e]);d.value=b[g-1],c.outputSignalAR(this)}else{var i=f?c.inputSignalKR(this):d.input;d.map&&d.prev!==i&&(d.prev=i,d.value=d.map(i));var j=d.value*d.mul+d.add;for(e=0;g>e;++e)b[e]=j}}return this},c.register("map",b)}(timbre),function(a){"use strict";function b(b){a.Object.call(this,1,b)}var c=a.fn;c.extend(b);var d=b.prototype;d.process=function(a){var b=this.cells[0],d=this._;if(this.tickID!==a){this.tickID=a;var e,f,g,h,i=this.nodes,j=i.length,k=b.length;if(d.ar){if(i.length>0)for(g=i[0].process(a).cells[0],b.set(g),e=1;j>e;++e)for(g=i[e].process(a).cells[0],f=0;k>f;++f)h=g[f],b[f]<h&&(b[f]=h);else for(f=0;k>f;++f)b[f]=0;c.outputSignalAR(this)}else{if(i.length>0)for(g=i[0].process(a).cells[0][0],e=1;j>e;++e)h=i[e].process(a).cells[0][0],h>g&&(g=h);else g=0;b[0]=g,c.outputSignalKR(this)}}return this},c.register("max",b)}(timbre),function(a){"use strict";function b(b){a.Object.call(this,2,b),c.fixAR(this);var e=this._;e.src=e.func=null,e.bufferL=new c.SignalArray(d),e.bufferR=new c.SignalArray(d),e.readIndex=0,e.writeIndex=0,e.totalRead=0,e.totalWrite=0}if("browser"===a.envtype){var c=a.fn,d=4096,e=d-1;c.extend(b);var f=b.prototype;f.listen=function(b){var c=g[a.env];c&&(c.set.call(this,b),c.listen.call(this))},f.unlisten=function(){var b=g[a.env];b&&b.unlisten.call(this),this.cells[0].set(c.emptycell),this.cells[1].set(c.emptycell),this.cells[2].set(c.emptycell);for(var d=this._,e=d.bufferL,f=d.bufferR,h=0,i=e.length;i>h;++h)e[h]=f[h]=0},f.process=function(a){var b=this._;if(null===b.src)return this;if(this.tickID!==a){this.tickID=a;var d=b.cellsize;if(b.totalWrite>b.totalRead+d){var f=b.readIndex,g=f+d;this.cells[1].set(b.bufferL.subarray(f,g)),this.cells[2].set(b.bufferR.subarray(f,g)),b.readIndex=g&e,b.totalRead+=d}c.outputSignalAR(this)}return this};var g={};g.webkit={set:function(a){var b=this._;if(a instanceof HTMLMediaElement){var d=c._audioContext;b.src=d.createMediaElementSource(a)}},listen:function(){var a=this._,b=c._audioContext;a.gain=b.createGainNode(),a.gain.gain.value=0,a.node=b.createJavaScriptNode(1024,2,2),a.node.onaudioprocess=h(this),a.src.connect(a.node),a.node.connect(a.gain),a.gain.connect(b.destination)},unlisten:function(){var a=this._;a.src&&a.src.disconnect(),a.gain&&a.gain.disconnect(),a.node&&a.node.disconnect()}};var h=function(a){return function(b){var c=a._,d=b.inputBuffer,f=d.length,g=c.writeIndex;c.bufferL.set(d.getChannelData(0),g),c.bufferR.set(d.getChannelData(1),g),c.writeIndex=g+f&e,c.totalWrite+=f}};g.moz={set:function(a){var b=this._;a instanceof HTMLAudioElement&&(b.src=a,b.istep=b.samplerate/a.mozSampleRate)},listen:function(){var a=this._,b=a.bufferL,c=a.bufferR,d=0,f=0;2===a.src.mozChannels?(a.x=0,a.func=function(g){var h,i,j=a.writeIndex,k=a.totalWrite,l=g.frameBuffer,m=a.istep,n=l.length;for(h=a.x,i=0;n>i;i+=2){for(h+=m;h>0;)b[j]=.5*(l[i]+d),c[j]=.5*(l[i+1]+f),j=j+1&e,++k,h-=1;d=l[i],f=l[i+1]}a.x=h,a.writeIndex=j,a.totalWrite=k}):(a.x=0,a.func=function(f){var g,h,i=a.writeIndex,j=a.totalWrite,k=f.frameBuffer,l=a.istep,m=k.length;for(g=a.x,h=0;m>h;++h){for(g+=l;g>=0;)b[i]=c[i]=.5*(k[h]+d),i=i+1&e,++j,g-=1;d=k[h]}a.x=g,a.writeIndex=i,a.totalWrite=j}),a.src.addEventListener("MozAudioAvailable",a.func)},unlisten:function(){var a=this._;a.func&&(a.src.removeEventListener("MozAudioAvailable",a.func),a.func=null)}},c.register("mediastream",b)}}(timbre),function(a){"use strict";function b(b){a.Object.call(this,1,b);var c=this._;c.midi=0,c.value=0,c.prev=null,c.a4=440,c.ar=!1}var c=a.fn;c.extend(b);var d=b.prototype;Object.defineProperties(d,{midi:{set:function(a){"number"==typeof a&&(this._.midi=a)},get:function(){return this._.midi}},a4:{set:function(a){"number"==typeof a&&(this._.a4=a,this._.prev=null)},get:function(){return this._.a4}}}),d.bang=function(){return this._.prev=null,this._.emit("bang"),this},d.at=function(a){var b=this._;return b.a4*Math.pow(2,(a-69)/12)},d.process=function(a){var b=this._;if(this.tickID!==a){this.tickID=a;var d,e=this.cells[0],f=this.nodes.length,g=e.length;if(b.ar&&f){c.inputSignalAR(this);var h=b.a4;for(d=0;g>d;++d)e[d]=h*Math.pow(2,(e[d]-69)/12);b.value=e[g-1],c.outputSignalAR(this)}else{var i=f?c.inputSignalKR(this):b.midi;b.prev!==i&&(b.prev=i,b.value=b.a4*Math.pow(2,(i-69)/12)),e[0]=b.value,c.outputSignalKR(this)}}return this},c.register("midicps",b)}(timbre),function(a){"use strict";function b(b){a.Object.call(this,1,b);var c=this._;c.midi=0,c.value=0,c.prev=null,c.range=12,c.ar=!1}var c=a.fn;c.extend(b);var d=b.prototype;Object.defineProperties(d,{midi:{set:function(a){"number"==typeof a&&(this._.midi=a)},get:function(){return this._.midi}},range:{set:function(a){"number"==typeof a&&a>0&&(this._.range=a)},get:function(){return this._.range}}}),d.bang=function(){return this._.prev=null,this._.emit("bang"),this},d.at=function(a){var b=this._;return Math.pow(2,a/b.range)},d.process=function(a){var b=this.cells[0],d=this._;if(this.tickID!==a){this.tickID=a;var e,f=this.nodes.length,g=b.length;if(d.ar&&f){c.inputSignalAR(this);var h=d.range;for(e=0;g>e;++e)b[e]=Math.pow(2,b[e]/h);d.value=b[g-1],c.outputSignalAR(this)}else{var i=this.nodes.length?c.inputSignalKR(this):d.midi;d.prev!==i&&(d.prev=i,d.value=Math.pow(2,i/d.range));var j=d.value*d.mul+d.add;for(e=0;g>e;++e)b[e]=j}}return this},c.register("midiratio",b)}(timbre),function(a){"use strict";function b(b){a.Object.call(this,1,b)}var c=a.fn;c.extend(b);var d=b.prototype;d.process=function(a){var b=this.cells[0],d=this._;if(this.tickID!==a){this.tickID=a;var e,f,g,h,i=this.nodes,j=i.length,k=b.length;if(d.ar){if(i.length>0)for(g=i[0].process(a).cells[0],b.set(g),e=1;j>e;++e)for(g=i[e].process(a).cells[0],f=0;k>f;++f)h=g[f],b[f]>h&&(b[f]=h);else for(f=0;k>f;++f)b[f]=0;c.outputSignalAR(this)}else{if(i.length>0)for(g=i[0].process(a).cells[0][0],e=1;j>e;++e)h=i[e].process(a).cells[0][0],g>h&&(g=h);else g=0;b[0]=g,c.outputSignalKR(this)}}return this},c.register("min",b)}(timbre),function(a){"use strict";function b(b){a.Object.call(this,0,b),c.timer(this),c.fixKR(this);var e=this._;e.tracks=[],e.onended=c.make_onended(this),e.currentTime=0,this.on("start",d)}var c=a.fn;c.extend(b);var d=function(){var a=this,b=this._,d=b.mml;"string"==typeof d&&(d=[d]),b.tracks=d.map(function(b,c){return new f(a,c,b)}),b.currentTime=0,this.playbackState=c.PLAYING_STATE};Object.defineProperty(d,"unremoved",{value:!0,writable:!1});var e=b.prototype;Object.defineProperties(e,{mml:{set:function(a){var b=this._;("string"==typeof a||Array.isArray(a))&&(b.mml=a)},get:function(){return this._.mml}},currentTime:{get:function(){return this._.currentTime}}}),e.on=e.addListener=function(a,b){return"mml"===a&&(a="data",console.warn("A 'mml' event listener was deprecated in ~v13.03.01. use 'data' event listener.")),this._.events.on(a,b),this},e.once=function(a,b){return"mml"===a&&(a="data",console.warn("A 'mml' event listener was deprecated in ~v13.03.01. use 'data' event listener.")),this._.events.once(a,b),this},e.off=e.removeListener=function(a,b){return"mml"===a&&(a="data",console.warn("A 'mml' event listener was deprecated in ~v13.03.01. use 'data' event listener.")),this._.events.off(a,b),this},e.removeAllListeners=function(a){return"mml"===a&&(console.warn("A 'mml' event listener was deprecated in ~v13.03.01. use 'data' event listener."),a="data"),this._.events.removeAllListeners(a),this},e.listeners=function(a){return"mml"===a&&(console.warn("A 'mml' event listener was deprecated in ~v13.03.01. use 'data' event listener."),a="data"),this._.events.listeners(a)},e.process=function(a){var b=this._;if(this.tickID!==a){this.tickID=a;var d,e,f=b.tracks;for(d=0,e=f.length;e>d;++d)f[d].process();for(;d--;)f[d].ended&&f.splice(d,1);0===f.length&&c.nextTick(b.onended),b.currentTime+=c.currentTimeIncr}return this},c.register("mml",b);var f=function(){function a(a,b,c){var d=this._={};d.sequencer=a,d.trackNum=b,d.commands=k(c),d.status={t:120,l:4,o:4,v:12,q:6,dot:0,tie:!1},d.index=0,d.queue=[],d.currentTime=0,d.queueTime=0,d.segnoIndex=-1,d.loopStack=[],d.prevNote=0,d.remain=1/0,this.ended=!1,j(this)}var b=0,d=1,e=2,f=3;a.prototype.process=function(){var a=this._,k=a.sequencer,l=a.trackNum,m=a.queue,n=!1;if(m.length)for(;m[0][0]<=a.currentTime;){var o=a.queue.shift();switch(o[1]){case d:g(k,l,o[2],o[3]),a.remain=o[4],j(this);break;case e:h(k,l,o[2],o[3]);break;case f:i(k,o[2]);break;case b:n=!0}if(0===m.length)break}a.remain-=c.currentTimeIncr,n&&(this.ended=!0),a.currentTime+=c.currentTimeIncr};var g=function(a,b,c,d){var e,f,g,h=a.nodes;for(f=0,g=h.length;g>f;++f)e=h[f],e.noteOn?e.noteOn(c,d):e.bang();a._.emit("data","noteOn",{trackNum:b,noteNum:c,velocity:d})},h=function(a,b,c,d){var e,f,g,h=a.nodes;for(f=0,g=h.length;g>f;++f)e=h[f],e.noteOff?e.noteOff(c,d):e.release&&e.release();a._.emit("data","noteOff",{trackNum:b,noteNum:c,velocity:d})},i=function(a,b){a._.emit("data","command",{command:b})},j=function(a){var c,g,h,i,j,k,l,m,n,o,p,q,r,s=a._,t=(s.sequencer,s.commands),u=s.queue,v=s.index,w=s.status,x=s.queueTime,y=s.loopStack;n=[];a:for(;;){if(t.length<=v){if(!(s.segnoIndex>=0))break;v=s.segnoIndex}switch(c=t[v++],c.name){case"@":u.push([x,f,c.val]);break;case"n":if(g=w.t||120,null!==c.len?(i=c.len,j=c.dot||0):(i=w.l,j=c.dot||w.dot),l=60/g*(4/i)*1e3,l*=[1,1.5,1.75,1.875][j]||1,k=w.v<<3,w.tie){for(q=u.length;q--;)if(u[q][2]){u.splice(q,1);break}h=s.prevNote}else h=s.prevNote=c.val+12*(w.o+1),u.push([x,d,h,k,l]);if(i>0){if(m=w.q/8,1>m)for(o=x+l*m,u.push([o,e,h,k]),q=0,r=n.length;r>q;++q)u.push([o,e,n[q],k]);if(n=[],x+=l,!w.tie)break a}else n.push(h);w.tie=!1;break;case"r":g=w.t||120,null!==c.len?(i=c.len,j=c.dot||0):(i=w.l,j=c.dot||w.dot),i>0&&(l=60/g*(4/i)*1e3,l*=[1,1.5,1.75,1.875][j]||1,x+=l);break;case"l":w.l=c.val,w.dot=c.dot;break;case"o":w.o=c.val;break;case"<":w.o<9&&(w.o+=1);break;case">":w.o>0&&(w.o-=1);break;case"v":w.v=c.val;break;case"(":w.v<15&&(w.v+=1);break;case")":w.v>0&&(w.v-=1);break;case"q":w.q=c.val;break;case"&":w.tie=!0;break;case"$":s.segnoIndex=v;break;case"[":y.push([v,null,null]);break;case"|":p=y[y.length-1],p&&1===p[1]&&(y.pop(),v=p[2]);break;case"]":p=y[y.length-1],p&&(null===p[1]&&(p[1]=c.count,p[2]=v),p[1]-=1,0===p[1]?y.pop():v=p[0]);break;case"t":w.t=null===c.val?120:c.val;break;case"EOF":u.push([x,b])}}s.index=v,s.queueTime=x},k=function(a){var b,c,d,e,f,g,h,i,j=new Array(a.length),k=[];for(f=0,g=l.length;g>f;++f)for(b=l[f],c=b.re;d=c.exec(a);){if(!j[d.index]){for(h=0,i=d[0].length;i>h;++h)j[d.index+h]=!0;e=b.func?b.func(d):{name:d[0]},e&&(e.index=d.index,e.origin=d[0],k.push(e))}for(;c.lastIndex<a.length&&j[c.lastIndex];)++c.lastIndex}return k.sort(function(a,b){return a.index-b.index}),k.push({name:"EOF"}),k},l=[{re:/@(\d*)/g,func:function(a){return{name:"@",val:a[1]||null}}},{re:/([cdefgab])([\-+]?)(\d*)(\.*)/g,func:function(a){return{name:"n",val:{c:0,d:2,e:4,f:5,g:7,a:9,b:11}[a[1]]+({"-":-1,"+":1}[a[2]]||0),len:""===a[3]?null:Math.min(0|a[3],64),dot:a[4].length}}},{re:/r(\d*)(\.*)/g,func:function(a){return{name:"r",len:""===a[1]?null:Math.max(1,Math.min(0|a[1],64)),dot:a[2].length}}},{re:/&/g},{re:/l(\d*)(\.*)/g,func:function(a){return{name:"l",val:""===a[1]?4:Math.min(0|a[1],64),dot:a[2].length}}},{re:/o([0-9])/g,func:function(a){return{name:"o",val:""===a[1]?4:0|a[1]}}},{re:/[<>]/g},{re:/v(\d*)/g,func:function(a){return{name:"v",val:""===a[1]?12:Math.min(0|a[1],15)}}},{re:/[()]/g},{re:/q([0-8])/g,func:function(a){return{name:"q",val:""===a[1]?6:Math.min(0|a[1],8)}}},{re:/\[/g},{re:/\|/g},{re:/\](\d*)/g,func:function(a){return{name:"]",count:0|a[1]||2}}},{re:/t(\d*)/g,func:function(a){return{name:"t",val:""===a[1]?null:Math.max(5,Math.min(0|a[1],300))}}},{re:/\$/g}];return a}()}(timbre),function(a){"use strict";function b(b){a.Object.call(this,1,b)}var c=a.fn;c.extend(b),b.prototype.process=function(a){var b=this._;return this.tickID!==a&&(this.tickID=a,b.ar?(c.inputSignalAR(this),c.outputSignalAR(this)):(this.cells[0][0]=c.inputSignalKR(this),c.outputSignalKR(this))),this},c.register("mono",b)}(timbre),function(a){"use strict";function b(b){a.Object.call(this,2,b)}var c=a.fn;c.extend(b);var d=b.prototype;d.process=function(a){var b=this._;if(this.tickID!==a){this.tickID=a;var d,e,f,g,h,i=this.nodes,j=this.cells[0],k=this.cells[1],l=this.cells[2],m=i.length,n=j.length;if(b.ar){if(i.length>0)for(i[0].process(a),g=i[0].cells[1],h=i[0].cells[2],k.set(g),l.set(h),d=1;m>d;++d)for(i[d].process(a),g=i[d].cells[1],h=i[d].cells[2],e=0;n>e;++e)k[e]*=g[e],l[e]*=h[e];else for(e=0;n>e;++e)k[e]=l[e]=0;c.outputSignalAR(this)}else{if(i.length>0)for(f=i[0].process(a).cells[0][0],d=1;m>d;++d)f*=i[d].process(a).cells[0][0];else f=0;j[0]=f,c.outputSignalKR(this)}}return this},c.register("*",b)}(timbre),function(a){"use strict";function b(b){a.Object.call(this,1,b);var c=this._;c.defaultValue=0,c.index=0,c.dict={},c.ar=!1}var c=a.fn;c.extend(b);var d=b.prototype;Object.defineProperties(d,{dict:{set:function(a){if("object"==typeof a)this._.dict=a;else if("function"==typeof a){for(var b={},c=0;128>c;++c)b[c]=a(c);this._.dict=b}},get:function(){return this._.dict}},defaultValue:{set:function(a){"number"==typeof a&&(this._.defaultValue=a)},get:function(){return this._.defaultValue}},index:{set:function(a){"number"==typeof a&&(this._.index=a)},get:function(){return this._.index}}}),d.at=function(a){var b=this._;return(b.dict[0|a]||b.defaultValue)*b.mul+b.add},d.clear=function(){return this._.dict={},this},d.process=function(a){var b=this.cells[0],d=this._;if(this.tickID!==a){this.tickID=a;var e,f,g,h=this.nodes.length,i=d.dict,j=d.defaultValue,k=d.mul,l=d.add,m=b.length;if(d.ar&&h){for(c.inputSignalAR(this),g=0;m>g;++g)e=b[g],e=0>e?e-.5|0:e+.5|0,b[g]=(i[e]||j)*k+l;c.outputSignalAR(this)}else for(e=this.nodes.length?c.inputSignalKR(this):d.index,e=0>e?e-.5|0:e+.5|0,f=(i[e]||j)*k+l,g=0;m>g;++g)b[g]=f}return this},c.register("ndict",b)}(timbre),function(a){"use strict";function b(b){a.Object.call(this,1,b)}var c=a.fn;c.extend(b);var d=b.prototype;d.process=function(a){var b=this.cells[0],c=this._;if(this.tickID!==a){this.tickID=a;var d,e,f,g=c.mul,h=c.add;if(c.ar)for(d=0,e=b.length;e>d;++d)b[d]=(2*Math.random()-1)*g+h;else for(f=(2*Math.random()+1)*g+h,d=0,e=b.length;e>d;++d)b[d]=f}return this},c.register("noise",b)}(timbre),function(a){"use strict";function b(b){a.Object.call(this,2,b);var d=this._;d.freq=a(440),d.phase=a(0),d.osc=new e(d.samplerate),d.tmp=new c.SignalArray(d.cellsize),d.osc.step=d.cellsize,this.once("init",f)}var c=a.fn,d=a.timevalue,e=a.modules.Oscillator;c.extend(b);var f=function(){var a=this._;this.wave||(this.wave="sin"),a.plotData=a.osc.wave,a.plotLineWidth=2,a.plotCyclic=!0,a.plotBefore=h},g=b.prototype;Object.defineProperties(g,{wave:{set:function(a){this._.osc.setWave(a)},get:function(){return this._.osc.wave}},freq:{set:function(b){"string"==typeof b&&(b=d(b),b=0>=b?0:1e3/b),this._.freq=a(b)},get:function(){return this._.freq}},phase:{set:function(b){this._.phase=a(b),this._.osc.feedback=!1},get:function(){return this._.phase}},fb:{set:function(b){this._.phase=a(b),this._.osc.feedback=!0},get:function(){return this._.phase}}}),g.clone=function(){var a=c.clone(this);return a._.osc=this._.osc.clone(),a._.freq=this._.freq,a._.phase=this._.phase,a},g.bang=function(){return this._.osc.reset(),this._.emit("bang"),this},g.process=function(a){var b=this._;if(this.tickID!==a){this.tickID=a;var d,e=this.cells[1],f=this.cells[2],g=b.cellsize;if(this.nodes.length)c.inputSignalAR(this);else for(d=0;g>d;++d)e[d]=f[d]=1;var h=b.osc,i=b.freq.process(a).cells[0],j=b.phase.process(a).cells[0];if(h.frequency=i[0],h.phase=j[0],b.ar){var k=b.tmp;for(b.freq.isAr?b.phase.isAr?h.processWithFreqAndPhaseArray(k,i,j):h.processWithFreqArray(k,i):b.phase.isAr?h.processWithPhaseArray(k,j):h.process(k),d=0;g>d;++d)e[d]*=k[d],f[d]*=k[d]}else{var l=h.next();for(d=0;g>d;++d)e[d]*=l,f[d]*=l}c.outputSignalAR(this)}return this};var h;"browser"===a.envtype&&(h=function(a,b,c,d,e){var f=(e>>1)+.5;a.strokeStyle="#ccc",a.lineWidth=1,a.beginPath(),a.moveTo(b,f+c),a.lineTo(b+d,f+c),a.stroke()}),c.register("osc",b),c.register("sin",function(a){return new b(a).set("wave","sin")}),c.register("cos",function(a){return new b(a).set("wave","cos")}),c.register("pulse",function(a){return new b(a).set("wave","pulse")}),c.register("tri",function(a){return new b(a).set("wave","tri")}),c.register("saw",function(a){return new b(a).set("wave","saw")}),c.register("fami",function(a){return new b(a).set("wave","fami")}),c.register("konami",function(a){return new b(a).set("wave","konami")}),c.register("+sin",function(a){return new b(a).set("wave","+sin").kr()}),c.register("+pulse",function(a){return new b(a).set("wave","+pulse").kr()}),c.register("+tri",function(a){return new b(a).set("wave","+tri").kr()}),c.register("+saw",function(a){return new b(a).set("wave","+saw").kr()}),c.alias("square","pulse")}(timbre),function(a){"use strict";function b(b){a.Object.call(this,2,b),c.fixAR(this);var d=this._;d.pos=a(0),d.panL=.5,d.panR=.5}var c=a.fn;c.extend(b);var d=b.prototype;Object.defineProperties(d,{pos:{set:function(b){this._.pos=a(b)},get:function(){return this._.pos}}}),d.process=function(a){var b=this._;if(this.tickID!==a){this.tickID=a;var d=b.pos.process(a).cells[0][0];if(b.prevPos!==d){b.panL=1-d,b.panR=b.prevPos=d}var e,f,g,h=this.nodes,i=this.cells[1],j=this.cells[2],k=h.length,l=i.length;if(k){for(g=h[0].process(a).cells[0],f=0;l>f;++f)i[f]=j[f]=g[f];for(e=1;k>e;++e)for(g=h[e].process(a).cells[0],f=0;l>f;++f)i[f]=j[f]+=g[f];var m=b.panL,n=b.panR;for(f=0;l>f;++f)i[f]=i[f]*m,j[f]=j[f]*n}else i.set(c.emptycell),j.set(c.emptycell);c.outputSignalAR(this)}return this},c.register("pan",b)}(timbre),function(a){"use strict";function b(b){a.Object.call(this,2,b);var c=this._;c.value=0,c.env=new f(c.samplerate),c.env.step=c.cellsize,c.curve="lin",c.counter=0,c.ar=!1,c.onended=g(this),this.on("ar",h)}var c=a.fn,d=a.timevalue,e=a.modules.Envelope,f=a.modules.EnvelopeValue;c.extend(b);var g=function(a,b){return function(){if("number"==typeof b)for(var c=a.cells[0],d=a.cells[1],e=a.cells[2],f=a._.env.value,g=0,h=d.length;h>g;++g)c[0]=d[g]=e[g]=f;a._.emit("ended")}},h=function(a){this._.env.step=a?1:this._.cellsize},i=b.prototype;Object.defineProperties(i,{value:{set:function(a){"number"==typeof a&&(this._.env.value=a)},get:function(){return this._.env.value}}}),i.to=function(a,b,c){var f=this._,g=f.env;if("string"==typeof b?b=d(b):"undefined"==typeof b&&(b=0),"undefined"==typeof c)f.counter=g.setNext(a,b,e.CurveTypeLin),f.curve="lin";else{var h=e.CurveTypeDict[c];f.counter="undefined"==typeof h?g.setNext(a,b,e.CurveTypeCurve,c):g.setNext(a,b,h),f.curve=c}return f.plotFlush=!0,this},i.setAt=function(a,b){var c=this._;return this.to(c.env.value,b,"set"),c.atValue=a,this},i.linTo=function(a,b){return this.to(a,b,"lin")},i.expTo=function(a,b){return this.to(a,b,"exp")},i.sinTo=function(a,b){return this.to(a,b,"sin")},i.welTo=function(a,b){return this.to(a,b,"wel")},i.sqrTo=function(a,b){return this.to(a,b,"sqr")},i.cubTo=function(a,b){return this.to(a,b,"cub")},i.cancel=function(){var a=this._;return a.counter=a.env.setNext(a.env.value,0,e.CurveTypeSet),this},i.process=function(a){var b=this._;if(this.tickID!==a){this.tickID=a;var d,f,g=this.cells[1],h=this.cells[2],i=b.cellsize,j=b.env,k=b.counter;if(this.nodes.length)c.inputSignalAR(this);else for(d=0;i>d;++d)g[d]=h[d]=1;if(0>=k&&("set"===b.curve?j.setNext(b.atValue,0,e.CurveTypeSet):j.setNext(j.value,0,e.CurveTypeSet),c.nextTick(b.onended),b.counter=1/0),b.ar){for(d=0;i>d;++d)f=j.next(),g[d]*=f,h[d]*=f;b.counter-=b.cellsize}else{for(f=j.next(),d=0;i>d;++d)g[d]*=f,h[d]*=f;b.counter-=1}c.outputSignalAR(this),b.value=f}return this};var j=a.Object.prototype.plot;i.plot=function(a){var b=this._;if(b.plotFlush){var c,d,g,h=new f(128),i=new Float32Array(128);if("set"===b.curve)for(d=100,g=i.length;g>d;++d)i[d]=1;else for(c=e.CurveTypeDict[b.curve],"undefined"==typeof c?h.setNext(1,1e3,e.CurveTypeCurve,b.curve):h.setNext(1,1e3,c),d=0,g=i.length;g>d;++d)i[d]=h.next();b.plotData=i,b.plotRange=[0,1],b.plotFlush=null}return j.call(this,a)},c.register("param",b)}(timbre),function(a){"use strict";function b(b){a.Object.call(this,2,b),c.fixAR(this);var d=this._;d.freq=a("sin",{freq:1,add:1e3,mul:250}).kr(),d.Q=a(1),d.allpass=[],this.steps=2}var c=a.fn,d=a.modules.Biquad;c.extend(b);var e=b.prototype;Object.defineProperties(e,{freq:{set:function(a){this._.freq=a},get:function(){return this._.freq}},Q:{set:function(b){this._.Q=a(b)},get:function(){return this._.Q}},steps:{set:function(a){if("number"==typeof a){if(a|=0,2===a||4===a||8===a||12===a){var b=this._.allpass;if(b.length<a)for(var c=b.length;a>c;++c)b[c]=new d(this._.samplerate),b[c].setType("allpass")}this._.steps=a}},get:function(){return this._.steps}}}),e.process=function(a){var b=this._;if(this.tickID!==a){if(this.tickID=a,c.inputSignalAR(this),!b.bypassed){var d,e=this.cells[1],f=this.cells[2],g=b.freq.process(a).cells[0][0],h=b.Q.process(a).cells[0][0],i=b.steps;for(d=0;i>d;d+=2)b.allpass[d].setParams(g,h,0),b.allpass[d].process(e,f),b.allpass[d+1].setParams(g,h,0),b.allpass[d+1].process(e,f)}c.outputSignalAR(this)}return this},c.register("phaser",b)}(timbre),function(a){"use strict";function b(b){a.Object.call(this,1,b),d.fixAR(this);for(var c=new Uint8Array(5),e=0;5>e;++e)c[e]=(Math.random()*(1<<30)|0)%25;this._.whites=c,this._.key=0}var c=31,d=a.fn;d.extend(b);var e=b.prototype;e.process=function(a){var b=this.cells[0],d=this._;if(this.tickID!==a){this.tickID=a;var e,f,g,h,i,j,k=d.key,l=d.whites,m=d.mul,n=d.add;for(e=0,f=b.length;f>e;++e){for(h=k++,k>c&&(k=0),j=h^k,g=i=0;5>g;++g)j&1<<g&&(l[g]=(Math.random()*(1<<30)|0)%25),i+=l[g];b[e]=(.01666666*i-1)*m+n}d.key=k}return this},d.register("pink",b)}(timbre),function(a){"use strict";function b(b){a.Object.call(this,1,b),this._.freq=440,this._.buffer=null,this._.index=0}var c=a.fn;c.extend(b);var d=b.prototype;Object.defineProperties(d,{freq:{set:function(a){"number"==typeof a&&(0>a&&(a=0),this._.freq=a)},get:function(){return this._.freq}}}),d.bang=function(){for(var a=this._,b=a.freq,d=a.samplerate/b+.5|0,e=a.buffer=new c.SignalArray(d),f=0;d>f;++f)e[f]=2*Math.random()-1;return a.index=0,a.emit("bang"),this},d.process=function(a){var b=this.cells[0],c=this._;if(this.tickID!==a){this.tickID=a;var d=c.buffer;if(d){var e,f,g,h=d.length,i=c.index,j=c.mul,k=c.add,l=b.length;for(g=0;l>g;++g)e=i,f=d[i++],i>=h&&(i=0),f=.5*(f+d[i]),d[e]=f,b[g]=f*j+k;c.index=i}}return this},c.register("pluck",b)}(timbre),function(a){"use strict";function b(b){a.Object.call(this,1,b),c.listener(this),c.fixAR(this);var d=this._;d.timeout=5e3,d.status=e,d.writeIndex=0,d.writeIndexIncr=1,d.currentTime=0,d.currentTimeIncr=1e3/d.samplerate,d.onended=g(this)}var c=a.fn,d=a.timevalue,e=0,f=1;c.extend(b);var g=function(a){return function(){var b=a._,d=new c.SignalArray(b.buffer.subarray(0,0|b.writeIndex));b.status=e,b.writeIndex=0,b.currentTime=0,b.emit("ended",{buffer:d,samplerate:b.samplerate})}},h=b.prototype;Object.defineProperties(h,{timeout:{set:function(a){"string"==typeof a&&(a=d(a)),"number"==typeof a&&a>0&&(this._.timeout=a)},get:function(){return this._.timeout}},samplerate:{set:function(a){"number"==typeof a&&a>0&&a<=this._.samplerate&&(this._.samplerate=a)},get:function(){return this._.samplerate}},currentTime:{get:function(){return this._.currentTime}}}),h.start=function(){var b,d=this._;return d.status===e&&(b=.01*d.timeout*d.samplerate|0,(!d.buffer||d.buffer.length<b)&&(d.buffer=new c.SignalArray(b)),d.writeIndex=0,d.writeIndexIncr=d.samplerate/a.samplerate,d.currentTime=0,d.status=f,d.emit("start"),this.listen()),this},h.stop=function(){var a=this._;return a.status===f&&(a.status=e,a.emit("stop"),c.nextTick(a.onended),this.unlisten()),this},h.bang=function(){return this._.status===e?this.srart():this._.status===f&&this.stop(),this._.emit("bang"),this},h.process=function(a){var b=this._,d=this.cells[0];if(this.tickID!==a){if(this.tickID=a,c.inputSignalAR(this),b.status===f){var e,g=d.length,h=b.buffer,i=b.timeout,j=b.writeIndex,k=b.writeIndexIncr,l=b.currentTime,m=b.currentTimeIncr;for(e=0;g>e;++e)h[0|j]=d[e],j+=k,l+=m,l>=i&&c.nextTick(b.onended);b.writeIndex=j,b.currentTime=l}c.outputSignalAR(this)}return this},c.register("record",b),c.alias("rec","record")}(timbre),function(a){"use strict";function b(b){a.Object.call(this,2,b),c.fixAR(this),this._.reverb=new d(this._.samplerate,this._.cellsize)}var c=a.fn,d=a.modules.Reverb;c.extend(b);var e=b.prototype;Object.defineProperties(e,{room:{set:function(a){"number"==typeof a&&(a=a>1?1:0>a?0:a,this._.reverb.setRoomSize(a))},get:function(){return this._.reverb.roomsize}},damp:{set:function(a){"number"==typeof a&&(a=a>1?1:0>a?0:a,this._.reverb.setDamp(a))},get:function(){return this._.reverb.damp}},mix:{set:function(a){"number"==typeof a&&(a=a>1?1:0>a?0:a,this._.reverb.wet=a)},get:function(){return this._.reverb.wet}}}),e.process=function(a){var b=this._;return this.tickID!==a&&(this.tickID=a,c.inputSignalAR(this),b.bypassed||b.reverb.process(this.cells[1],this.cells[2]),c.outputSignalAR(this)),this},c.register("reverb",b)}(timbre),function(a){"use strict";function b(b){a.Object.call(this,0,b),c.timer(this),c.fixKR(this);var d=this._;d.queue=[],d.currentTime=0,d.maxRemain=1e3}var c=a.fn,d=a.timevalue;c.extend(b);var e=b.prototype;Object.defineProperties(e,{queue:{get:function(){return this._.queue}},remain:{get:function(){return this._.queue.length}},maxRemain:{set:function(a){"number"==typeof a&&a>0&&(this._.maxRemain=a)},get:function(){return this._.maxRemain}},isEmpty:{get:function(){return 0===this._.queue.length}},currentTime:{get:function(){return this._.currentTime}}}),e.sched=function(a,b,c){return"string"==typeof a&&(a=d(a)),"number"==typeof a&&this.schedAbs(this._.currentTime+a,b,c),this},e.schedAbs=function(b,c,e){if("string"==typeof b&&(b=d(b)),"number"==typeof b){var f=this._,g=f.queue;if(g.length>=f.maxRemain)return this;for(var h=g.length;h--&&!(g[h][0]<b););g.splice(h+1,0,[b,a(c),e])}return this},e.advance=function(a){return"string"==typeof a&&(a=d(a)),"number"==typeof a&&(this._.currentTime+=a),this},e.clear=function(){return this._.queue.splice(0),this},e.process=function(a){var b=this._;if(this.tickID!==a){this.tickID=a;var d=null,e=b.queue;if(e.length)for(;e[0][0]<b.currentTime;){var f=b.queue.shift();if(f[1].bang(f[2]),d="sched",0===e.length){d="empty";break}}b.currentTime+=c.currentTimeIncr,d&&b.emit(d)}return this},c.register("schedule",b),c.alias("sched","schedule")}(timbre),function(a){"use strict";function b(b){a.Object.call(this,2,b),c.listener(this),c.fixAR(this);var d=this._;d.samples=0,d.writeIndex=0,d.plotFlush=!0,this.once("init",e)}var c=a.fn,d=a.timevalue;c.extend(b);var e=function(){this._.buffer||(this.size=1024),this._.interval||(this.interval=1e3)},f=b.prototype;Object.defineProperties(f,{size:{set:function(a){var b=this._;if(!b.buffer&&"number"==typeof a){var d=64>a?64:a>2048?2048:a;b.buffer=new c.SignalArray(d),b.reservedinterval&&(this.interval=b.reservedinterval,b.reservedinterval=null)}},get:function(){return this._.buffer.length}},interval:{set:function(a){var b=this._;"string"==typeof a&&(a=d(a)),"number"==typeof a&&a>0&&(b.buffer?(b.interval=a,b.samplesIncr=.001*a*b.samplerate/b.buffer.length,b.samplesIncr<1&&(b.samplesIncr=1)):b.reservedinterval=a)},get:function(){return this._.interval}},buffer:{get:function(){return this._.buffer}}}),f.bang=function(){for(var a=this._,b=a.buffer,c=0,d=b.length;d>c;++c)b[c]=0;return a.samples=0,a.writeIndex=0,this._.emit("bang"),this},f.process=function(a){var b=this._;if(this.tickID!==a){this.tickID=a,c.inputSignalAR(this),c.outputSignalAR(this);var d,e=this.cells[0],f=b.cellsize,g=b.samples,h=b.samplesIncr,i=b.buffer,j=b.writeIndex,k=!1,l=i.length;for(d=0;f>d;++d)0>=g&&(i[j++]=e[d],j>=l&&(j=0),k=b.plotFlush=!0,g+=h),--g;b.samples=g,b.writeIndex=j,k&&this._.emit("data")}return this};var g=a.Object.prototype.plot;f.plot=function(a){var b=this._;if(b.plotFlush){for(var c=b.buffer,d=c.length-1,e=new Float32Array(c.length),f=b.writeIndex,h=0,i=c.length;i>h;h++)e[h]=c[++f&d];
b.plotData=e,b.plotFlush=null}return g.call(this,a)},c.register("scope",b)}(timbre),function(a){"use strict";function b(b){a.Object.call(this,2,b),e.fixAR(this);var c=this._;c.numberOfInputs=0,c.numberOfOutputs=0,c.bufferSize=0,c.bufferMask=0,c.duration=0,c.inputBufferL=null,c.inputBufferR=null,c.outputBufferL=null,c.outputBufferR=null,c.onaudioprocess=null,c.index=0,this.once("init",f)}function c(a,b){this.samplerate=a._.samplerate,this.length=a._.bufferSize,this.duration=a._.duration,this.numberOfChannels=b.length,this.getChannelData=function(a){return b[a]}}function d(b){var d=b._;this.node=b,this.playbackTime=a.currentTime,this.inputBuffer=2===d.numberOfInputs?new c(b,[d.inputBufferL,d.inputBufferR]):new c(b,[d.inputBufferL]),this.outputBuffer=2===d.numberOfOutputs?new c(b,[d.outputBufferL,d.outputBufferR]):new c(b,[d.outputBufferL])}var e=a.fn;e.extend(b);var f=function(){var a=this._;0===a.numberOfInputs&&(this.numberOfInputs=1),0===a.numberOfOutputs&&(this.numberOfOutputs=1),0===a.bufferSize&&(this.bufferSize=1024)},g=b.prototype;Object.defineProperties(g,{numberOfInputs:{set:function(a){var b=this._;0===b.numberOfInputs&&(b.numberOfInputs=2===a?2:1)},get:function(){return this._.numberOfInputs}},numberOfOutputs:{set:function(a){var b=this._;0===b.numberOfOutputs&&(b.numberOfOutputs=2===a?2:1)},get:function(){return this._.numberOfOutputs}},bufferSize:{set:function(a){var b=this._;0===b.bufferSize&&-1!==[256,512,1024,2048,4096,8192,16384].indexOf(a)&&(b.bufferSize=a,b.bufferMask=a-1,b.duration=a/b.samplerate,b.inputBufferL=new e.SignalArray(a),b.inputBufferR=new e.SignalArray(a),b.outputBufferL=new e.SignalArray(a),b.outputBufferR=new e.SignalArray(a))},get:function(){return this._.bufferSize}},onaudioprocess:{set:function(a){"function"==typeof a&&(this._.onaudioprocess=a)},get:function(){return this._.onaudioprocess}}}),g.process=function(a){var b=this._;if(this.tickID!==a){this.tickID=a;var c,f=b.cellsize,g=b.bufferMask,h=b.index,i=h+f,j=this.cells[1],k=this.cells[2];if(e.inputSignalAR(this),2===b.numberOfInputs)b.inputBufferL.set(j,h),b.inputBufferR.set(k,h);else{c=b.inputBufferL;for(var l=0;f>l;l++)c[h+l]=.5*(j[l]+k[l])}j.set(b.outputBufferL.subarray(h,i)),k.set(b.outputBufferR.subarray(h,i)),b.index=i&g,0===b.index&&b.onaudioprocess&&(b.onaudioprocess(new d(this)),1===b.numberOfOutputs&&b.outputBufferR.set(b.outputBufferL)),e.outputSignalAR(this)}return this},e.register("script",b)}(timbre),function(a){"use strict";function b(b){a.Object.call(this,2,b),this._.selected=0,this._.background=!1}var c=a.fn;c.extend(b);var d=b.prototype;Object.defineProperties(d,{selected:{set:function(a){"number"==typeof a&&(this._.selected=a,this.cells[1].set(c.emptycell),this.cells[2].set(c.emptycell))},get:function(){return this._.selected}},background:{set:function(a){this._.background=!!a},get:function(){return this._.background}}}),d.process=function(a){var b=this._;if(this.tickID!==a){this.tickID=a;var d,e=this.nodes,f=e.length;if(b.background)for(d=0;f>d;++d)e[d].process(a);var g=e[b.selected];g&&(b.background||g.process(a),this.cells[1].set(g.cells[1]),this.cells[2].set(g.cells[2])),c.outputSignalAR(this)}return this},c.register("selector",b)}(timbre),function(a){"use strict";function b(b){a.Object.call(this,2,b),c.listener(this),c.fixAR(this);var d=this._;d.status=f,d.samples=0,d.samplesIncr=0,d.writeIndex=0,d.plotFlush=!0,d.plotRange=[0,32],d.plotBarStyle=!0,this.once("init",h)}var c=a.fn,d=a.timevalue,e=a.modules.FFT,f=0,g=1;c.extend(b);var h=function(){var a=this._;a.fft||(this.size=512),a.interval||(this.interval=500)},i=b.prototype;Object.defineProperties(i,{size:{set:function(a){var b=this._;if(!b.fft&&"number"==typeof a){var d=256>a?256:a>2048?2048:a;b.fft=new e(d),b.buffer=new c.SignalArray(b.fft.length),b.freqs=new c.SignalArray(b.fft.length>>1),b.reservedwindow&&(b.fft.setWindow(b.reservedwindow),b.reservedwindow=null),b.reservedinterval&&(this.interval=b.reservedinterval,b.reservedinterval=null)}},get:function(){return this._.buffer.length}},window:{set:function(a){this._.fft.setWindow(a)},get:function(){return this._.fft.windowName}},interval:{set:function(a){var b=this._;"string"==typeof a&&(a=d(a)),"number"==typeof a&&a>0&&(b.buffer?(b.interval=a,b.samplesIncr=.001*a*b.samplerate,b.samplesIncr<b.buffer.length&&(b.samplesIncr=b.buffer.length,b.interval=1e3*b.samplesIncr/b.samplerate)):b.reservedinterval=a)},get:function(){return this._.interval}},spectrum:{get:function(){return this._.fft.getFrequencyData(this._.freqs)}},real:{get:function(){return this._.fft.real}},imag:{get:function(){return this._.fft.imag}}}),i.bang=function(){return this._.samples=0,this._.writeIndex=0,this._.emit("bang"),this},i.process=function(a){var b=this._;if(this.tickID!==a){this.tickID=a,c.inputSignalAR(this),c.outputSignalAR(this);var d,e,h=this.cells[0],i=h.length,j=b.status,k=b.samples,l=b.samplesIncr,m=b.writeIndex,n=b.buffer,o=n.length;for(d=0;i>d;++d)0>=k&&j===f&&(j=g,m=0,k+=l),j===g&&(n[m++]=h[d],m>=o&&(b.fft.forward(n),e=b.plotFlush=!0,j=f)),--k;b.samples=k,b.status=j,b.writeIndex=m,e&&this._.emit("data")}return this};var j=a.Object.prototype.plot;i.plot=function(a){return this._.plotFlush&&(this._.plotData=this.spectrum,this._.plotFlush=null),j.call(this,a)},c.register("spectrum",b)}(timbre),function(a){"use strict";function b(b){a.Object.call(this,2,b),this._.ar=!1}var c=a.fn;c.extend(b);var d=b.prototype;d.process=function(a){var b=this._;if(this.tickID!==a){this.tickID=a;var d,e,f,g,h,i=this.nodes,j=this.cells[0],k=this.cells[1],l=this.cells[2],m=i.length,n=j.length;if(b.ar){if(i.length>0)for(i[0].process(a),g=i[0].cells[1],h=i[0].cells[2],k.set(g),l.set(h),d=1;m>d;++d)for(i[d].process(a),g=i[d].cells[1],h=i[d].cells[2],e=0;n>e;++e)k[e]-=g[e],l[e]-=h[e];else for(e=0;n>e;++e)k[e]=l[d]=0;c.outputSignalAR(this)}else{if(i.length>0)for(f=i[0].process(a).cells[0][0],d=1;m>d;++d)f-=i[d].process(a).cells[0][0];else f=0;j[0]=f,c.outputSignalKR(this)}}return this},c.register("-",b)}(timbre),function(a){"use strict";function b(b){a.Object.call(this,2,b),c.fixAR(this);var d=this._;this.playbackState=c.FINISHED_STATE,d.poly=4,d.genList=[],d.genDict={},d.synthdef=null,d.remGen=f(this),d.onended=c.make_onended(this)}var c=a.fn;c.extend(b);var d=b.prototype;Object.defineProperties(d,{def:{set:function(a){"function"==typeof a&&(this._.synthdef=a)},get:function(){return this._.synthdef}},poly:{set:function(a){"number"==typeof a&&a>0&&64>=a&&(this._.poly=a)},get:function(){return this._.poly}}});var e=function(a,b){return function(){a._.remGen(b.gen)}},f=function(a){return function(b){var c=a._,d=c.genList.indexOf(b);-1!==d&&c.genList.splice(d,1),"undefined"!=typeof b.noteNum&&(c.genDict[b.noteNum]=null)}},g=function(b,d,f,g){f|=0,0>=f?this.noteOff(this,b):f>127&&(f=127);var h=this._,i=h.genList,j=h.genDict,k=j[b];k&&h.remGen(k);var l={freq:d,noteNum:b,velocity:f,mul:.0078125*f};if(g)for(var m in g)l[m]=g[m];l.doneAction=e(this,l),k=h.synthdef.call(this,l),k instanceof a.Object&&(k.noteNum=b,i.push(k),j[b]=l.gen=k,this.playbackState=c.PLAYING_STATE,i.length>h.poly&&h.remGen(i[0]))},h=function(){for(var a=new Float32Array(128),b=0;128>b;++b)a[b]=440*Math.pow(2,1*(b-69)/12);return a}(),i=function(a){return a>0?Math.log(1*a/440)*Math.LOG2E*12+69:0};d.noteOn=function(a,b,c){var d=h[a]||440*Math.pow(2,(a-69)/12);return g.call(this,a+.5|0,d,b,c),this},d.noteOff=function(a){var b=this._.genDict[a];return b&&b.release&&b.release(),this},d.noteOnWithFreq=function(a,b,c){var d=i(a);return g.call(this,d+.5|0,a,b,c),this},d.noteOffWithFreq=function(a){var b=i(a);return this.noteOff(b+.5|0)},d.allNoteOff=function(){for(var a=this._.genList,b=0,c=a.length;c>b;++b)a[b].release&&a[b].release()},d.allSoundOff=function(){for(var a=this._,b=a.genList,c=a.genDict;b.length;)delete c[b.shift().noteNum]},d.synth=function(b){var d,f=this._,g=f.genList,h={};if(b)for(var i in b)h[i]=b[i];return h.doneAction=e(this,h),d=f.synthdef.call(this,h),d instanceof a.Object&&(g.push(d),h.gen=d,this.playbackState=c.PLAYING_STATE,g.length>f.poly&&f.remGen(g[0])),this},d.process=function(a){var b=this.cells[0],d=this._;if(this.tickID!==a){if(this.tickID=a,this.playbackState===c.PLAYING_STATE){var e,f,g,h,i,j,k=d.genList,l=this.cells[1],m=this.cells[2],n=b.length;if(k.length)for(e=k[0],e.process(a),l.set(e.cells[1]),m.set(e.cells[2]),f=1,g=k.length;g>f;++f)for(e=k[f],e.process(a),i=e.cells[1],j=e.cells[2],h=0;n>h;++h)l[h]+=i[h],m[h]+=j[h];else c.nextTick(d.onended)}c.outputSignalAR(this)}return this},c.register("SynthDef",b);var j={set:function(b){c.isDictionary(b)?"string"==typeof b.type&&(this._.env=b):b instanceof a.Object&&(this._.env=b)},get:function(){return this._.env}};c.register("OscGen",function(){var c={set:function(b){b instanceof a.Object&&(this._.osc=b)},get:function(){return this._.osc}},d={set:function(a){"string"==typeof a&&(this._.wave=a)},get:function(){return this._.wave}},e=function(b){var c,d,e,f,g=this._;return d=g.osc||null,e=g.env||{},f=e.type||"perc",d instanceof a.Object&&"function"==typeof d.clone&&(d=d.clone()),d||(d=a("osc",{wave:g.wave})),d.freq=b.freq,d.mul=d.mul*b.velocity/128,c=d,e instanceof a.Object?"function"==typeof e.clone&&(c=e.clone().append(c)):c=a(f,e,c),c.on("ended",b.doneAction).bang(),c};return function(a){var f=new b(a);return f._.wave="sin",Object.defineProperties(f,{env:j,osc:c,wave:d}),f.def=e,f}}()),c.register("PluckGen",function(){var c=function(b){var c,d,e,f=this._;return d=f.env||{},e=d.type||"perc",c=a("pluck",{freq:b.freq,mul:b.velocity/128}).bang(),d instanceof a.Object?"function"==typeof d.clone&&(c=d.clone().append(c)):c=a(e,d,c),c.on("ended",b.doneAction).bang(),c};return function(a){var d=new b(a);return Object.defineProperties(d,{env:j}),d.def=c,d}}())}(timbre),function(a){"use strict";function b(b){a.Object.call(this,2,b),c.fixAR(this);var d=this._;d.isLooped=!1,d.onended=c.make_onended(this,0)}var c=a.fn,d=a.modules.Scissor,e=d.Tape,f=d.TapeStream,g=c.isSignalArray;c.extend(b);var h=b.prototype;Object.defineProperties(h,{tape:{set:function(b){b instanceof e?(this.playbackState=c.PLAYING_STATE,this._.tape=b,this._.tapeStream=new f(b,this._.samplerate),this._.tapeStream.isLooped=this._.isLooped):(b instanceof a.Object&&b.buffer&&(b=b.buffer),"object"==typeof b&&Array.isArray(b.buffer)&&g(b.buffer[0])&&(this.playbackState=c.PLAYING_STATE,this._.tape=new d(b),this._.tapeStream=new f(this._.tape,this._.samplerate),this._.tapeStream.isLooped=this._.isLooped))},get:function(){return this._.tape}},isLooped:{get:function(){return this._.isLooped}},buffer:{get:function(){return this._.tape?this._.tape.getBuffer():void 0}}}),h.loop=function(a){return this._.isLooped=!!a,this._.tapeStream&&(this._.tapeStream.isLooped=this._.isLooped),this},h.bang=function(){return this.playbackState=c.PLAYING_STATE,this._.tapeStream&&this._.tapeStream.reset(),this._.emit("bang"),this},h.getBuffer=function(){return this._.tape?this._.tape.getBuffer():void 0},h.process=function(a){var b=this._;if(this.tickID!==a){this.tickID=a;var d=b.tapeStream;if(d){var e=this.cells[1],f=this.cells[2],g=d.fetch(e.length);e.set(g[0]),f.set(g[1]),this.playbackState===c.PLAYING_STATE&&d.isEnded&&c.nextTick(b.onended)}c.outputSignalAR(this)}return this},c.register("tape",b)}(timbre),function(a){"use strict";function b(b){a.Object.call(this,1,b),c.timer(this);var d=this._;this.playbackState=c.FINISHED_STATE,d.task=[],d.i=0,d.j=0,d.imax=0,d.jmax=0,d.wait=0,d.count=0,d.args={},d.doNum=1,d.initFunc=c.nop,d.onended=g(this),this.on("start",f)}var c=a.fn,d=a.timevalue,e=a(function(){}).constructor;c.extend(b);var f=function(){var a,b=this._;this.playbackState=c.PLAYING_STATE,b.task=this.nodes.map(function(a){return a instanceof e?a.func:!1}).filter(function(a){return!!a}),b.i=b.j=0,b.imax=b.doNum,b.jmax=b.task.length,a=b.initFunc(),c.isDictionary(a)||(a={param:a}),b.args=a},g=function(a){return function(){a.playbackState=c.FINISHED_STATE;var b=a._,d=a.cells[0],e=a.cells[1],f=a.cells[2],g=b.args;if("number"==typeof g)for(var h=0,i=e.length;i>h;++h)d[0]=e[h]=f[h]=g;b.emit("ended",b.args)}},h=b.prototype;Object.defineProperties(h,{"do":{set:function(a){"number"==typeof a&&a>0&&(this._.doNum=1/0===a?1/0:0|a)},get:function(){return this._.doNum}},init:{set:function(a){"function"==typeof a&&(this._.initFunc=a)},get:function(){return this._.initFunc}}}),h.bang=function(){var a=this._;return a.count=0,a.emit("bang"),this},h.wait=function(a){return"string"==typeof a&&(a=d(a)),"number"==typeof a&&a>0&&(this._.count+=this._.samplerate*a*.001|0),this},h.process=function(a){var b,d=this.cells[0],e=this._;if(this.tickID!==a&&(this.tickID=a,e.i<e.imax)){for(;e.count<=0;){if(e.j>=e.jmax){if(++e.i,e.i>=e.imax){c.nextTick(e.onended);break}e.j=0}b=e.task[e.j++],b&&b.call(this,e.i,e.args)}e.count-=d.length}return this},c.register("task",b)}(timbre),function(a){"use strict";function b(b){a.Object.call(this,0,b),c.timer(this),c.fixKR(this);var d=this._;this.playbackState=c.FINISHED_STATE,d.currentTime=0,d.samplesMax=0,d.samples=0,d.onended=c.make_onended(this),this.once("init",e),this.on("start",f)}var c=a.fn,d=a.timevalue;c.extend(b);var e=function(){this._.timeout||(this.timeout=1e3)},f=function(){this.playbackState=c.PLAYING_STATE};Object.defineProperty(f,"unremovable",{value:!0,writable:!1});var g=b.prototype;Object.defineProperties(g,{timeout:{set:function(a){var b=this._;"string"==typeof a&&(a=d(a)),"number"==typeof a&&a>=0&&(this.playbackState=c.PLAYING_STATE,b.timeout=a,b.samplesMax=.001*b.samplerate*a|0,b.samples=b.samplesMax)},get:function(){return this._.timeout}},currentTime:{get:function(){return this._.currentTime}}}),g.bang=function(){var a=this._;return this.playbackState=c.PLAYING_STATE,a.samples=a.samplesMax,a.currentTime=0,a.emit("bang"),this},g.process=function(a){var b=this.cells[0],d=this._;if(this.tickID!==a){if(this.tickID=a,d.samples>0&&(d.samples-=b.length),d.samples<=0){for(var e=this.nodes,f=0,g=e.length;g>f;++f)e[f].bang();c.nextTick(d.onended)}d.currentTime+=c.currentTimeIncr}return this},c.register("timeout",b)}(timbre),function(a){"use strict";function b(b){a.Object.call(this,1,b),c.fixAR(this),this._.curve=null}var c=a.fn;c.extend(b);var d=b.prototype;Object.defineProperties(d,{curve:{set:function(a){c.isSignalArray(a)&&(this._.curve=a)},get:function(){return this._.curve}}}),d.process=function(a){var b=this._;if(this.tickID!==a){if(this.tickID=a,c.inputSignalAR(this),b.curve){var d,e,f=this.cells[0],g=b.curve,h=g.length,i=b.cellsize;for(e=0;i>e;++e)d=.5*(f[e]+1)*h+.5|0,0>d?d=0:d>=h-1&&(d=h-1),f[e]=g[d]}c.outputSignalAR(this)}return this},c.register("waveshaper",b)}(timbre),function(a){"use strict";function b(b){a.Object.call(this,1,b);var c=this._;c.inMin=0,c.inMax=1,c.outMin=0,c.outMax=1,c.ar=!1,this.once("init",d)}var c=a.fn;c.extend(b);var d=function(){this._.warp||(this.warp="linlin")},e=b.prototype;Object.defineProperties(e,{inMin:{set:function(a){"number"==typeof a&&(this._.inMin=a)},get:function(){return this._.inMin}},inMax:{set:function(a){"number"==typeof a&&(this._.inMax=a)},get:function(){return this._.inMax}},outMin:{set:function(a){"number"==typeof a&&(this._.outMin=a)},get:function(){return this._.outMin}},outMax:{set:function(a){"number"==typeof a&&(this._.outMax=a)},get:function(){return this._.outMax}},warp:{set:function(a){if("string"==typeof a){var b=f[a];b&&(this._.warp=b,this._.warpName=a)}},get:function(){return this._.warpName}}}),e.process=function(a){var b=this._,d=this.cells[0];if(this.tickID!==a){this.tickID=a;var e,f=b.inMin,g=b.inMax,h=b.outMin,i=b.outMax,j=b.warp,k=this.nodes.length,l=b.mul,m=b.add,n=d.length;if(b.ar&&k){for(c.inputSignalAR(this),e=0;n>e;++e)d[e]=j(d[e],f,g,h,i)*l+m;c.outputSignalAR(this)}else{var o=this.nodes.length?c.inputSignalKR(this):0,p=j(o,f,g,h,i)*l+m;for(e=0;n>e;++e)d[e]=p}}return this};var f={linlin:function(a,b,c,d,e){return b>a?d:a>c?e:c===b?d:(a-b)/(c-b)*(e-d)+d},linexp:function(a,b,c,d,e){return b>a?d:a>c?e:0===d?0:c===b?e:Math.pow(e/d,(a-b)/(c-b))*d},explin:function(a,b,c,d,e){return b>a?d:a>c?e:0===b?e:Math.log(a/b)/Math.log(c/b)*(e-d)+d},expexp:function(a,b,c,d,e){return b>a?d:a>c?e:0===b||0===d?0:Math.pow(e/d,Math.log(a/b)/Math.log(c/b))*d}};c.register("zmap",b)}(timbre);
//# sourceMappingURL=timbre.js.map
(function(T) {
    "use strict";

    if (T.env !== "webkit") {
        return;
    }

    var fn = T.fn;
//    var context = fn._audioContext;
    var BUFFERSIZE = 1024;

    function WebAudioAPINode(_args) {
        timbre.Object.call(this, 2, _args.slice(0, _args.length-1));
        fn.fixAR(this);

        var _ = this._;
        var context = _args.slice(-1)[0];

        _.mode = "";
        _.bufferL = new fn.SignalArray(BUFFERSIZE << 2);
        _.bufferR = new fn.SignalArray(BUFFERSIZE << 2);
        _.buffermask = _.bufferL.length - 1;
        _.node   = null;
        _.script = context.createScriptProcessor(BUFFERSIZE, 2, 2);
        _.writeIndex = 0;
        _.readIndex  = 0;
        _.totalRead  = 0;
        _.totalWrite = 0;
        _.context = context;
    }
    fn.extend(WebAudioAPINode);

    var $ = WebAudioAPINode.prototype;

    Object.defineProperties($, {
        context: {
            get: function() {
                return this._.context;
            }
        },
        mode: {
            get: function() {
                return this._.mode;
            }
        }
    });

    $.cancel = function() {
        var _ = this._;
        var cell = this.cells[0];
        for (var i = 0, imax = cell.length; i < imax; ++i) {
            cell[i] = 0;
        }
        _.node = null;

        if (_.connectIndex !== null && _.connectIndex !== undefined) {
            _.script.disconnect(_.connectIndex);
        } else {
            _.script.disconnect();
        }
    };

    (function() {
        function WebAudioAPIRecvNode(_args) {
            WebAudioAPINode.call(this, _args);
            var context = _args.slice(-1)[0];

            var _ = this._;
            _.mode = "recv";
            _.script.onaudioprocess = make_recv_process(this);
            _.gain = context.createGain();
            _.gain.gain.value = 0;
            _.script.connect(_.gain);
        }
        fn.extend(WebAudioAPIRecvNode, WebAudioAPINode);

        var make_recv_process = function(self) {
            return function(e) {
                var _ = self._;
                var ins = e.inputBuffer;
                var inputL = ins.getChannelData(0);
                var inputR = ins.getChannelData(1);
                var length = ins.length;
                var writeIndex = _.writeIndex;
                _.bufferL.set(inputL, writeIndex);
                _.bufferR.set(inputR, writeIndex);
                _.writeIndex = (writeIndex + length) & _.buffermask;
                _.totalWrite += length;
            };
        };

        var $ = WebAudioAPIRecvNode.prototype;

        $.cancel = function() {
            if(this._.node) {
              this._.node.disconnect();
            }
            WebAudioAPINode.prototype.cancel.call(this);
            this._.gain.disconnect();
        };

        $.recv = function(node) {
            var _ = this._;
            try {
                _.node = node;
                _.node.connect(_.script);
                _.gain.connect(_.context.destination);
            } catch(e) {
                _.node = null;
            }
            _.writeIndex = 0;
            _.readIndex  = 0;
            _.totalWrite = 0;
            _.totalRead  = 0;
            return this;
        };

        $.process = function(tickID) {
            var _ = this._;

            if (_.node === null) {
                return this;
            }

            if (this.tickID !== tickID) {
                this.tickID = tickID;

                var cellsize = _.cellsize;
                var bufferL = _.bufferL;
                var bufferR = _.bufferR;

                if (_.totalWrite > _.totalRead + cellsize) {
                    var begin = _.readIndex;
                    var end = begin + cellsize;
                    this.cells[1].set(bufferL.subarray(begin, end));
                    this.cells[2].set(bufferR.subarray(begin, end));
                    _.readIndex = end & _.buffermask;
                    _.totalRead += cellsize;
                }
                fn.outputSignalAR(this);
            }
            return this;
        };

        fn.register("WebAudioAPI:recv", WebAudioAPIRecvNode);
    })();

    (function() {
        function WebAudioAPISendNode(_args) {
            WebAudioAPINode.call(this, _args);
            fn.listener(this);

            var _ = this._;
            _.mode = "send";
            _.script.onaudioprocess = make_send_process(this);
            _.connectIndex = null;
        }
        fn.extend(WebAudioAPISendNode, WebAudioAPINode);

        var make_send_process = function(self) {
            return function(e) {
                var _ = self._;
                var outs = e.outputBuffer;
                var length  = outs.length;

                if (_.totalWrite > _.totalRead + length) {
                    var begin = _.readIndex;
                    var end = begin + length;
                    outs.getChannelData(0).set(_.bufferL.subarray(begin, end));
                    outs.getChannelData(1).set(_.bufferR.subarray(begin, end));
                    _.readIndex = end & _.buffermask;
                    _.totalRead += length;
                }
            };
        };

        var $ = WebAudioAPISendNode.prototype;

        $.cancel = function() {
            WebAudioAPINode.prototype.cancel.call(this);
            this.unlisten();
        };

        $.send = function(node, index) {
            var _ = this._;
            try {
                _.node = node;
                if (typeof index === "number") {
                    _.script.connect(_.node, index);
                    _.connectIndex = index;
                } else {
                    _.script.connect(_.node);
                    _.connectIndex = null;
                }
                this.listen();
            } catch(e) {
                _.node = null;
            }
            _.writeIndex = 0;
            _.readIndex  = 0;
            _.totalWrite = 0;
            _.totalRead  = 0;
            return this;
        };

        $.process = function(tickID) {
            var _ = this._;

            if (_.script === null) {
                return this;
            }

            if (this.tickID !== tickID) {
                this.tickID = tickID;

                var cellL = this.cells[1];
                var cellR = this.cells[2];
                var cellsize = _.cellsize;
                var writeIndex = _.writeIndex;

                fn.inputSignalAR(this);

                _.bufferL.set(cellL, writeIndex);
                _.bufferR.set(cellR, writeIndex);
                _.writeIndex = (writeIndex + cellsize) & _.buffermask;
                _.totalWrite += cellsize;

                fn.outputSignalAR(this);
            }
            return this;
        };

        fn.register("WebAudioAPI:send", WebAudioAPISendNode);
    })();

})(timbre);

(function(){

var TypeConversor = function(typeName) {
  var conversorArray = [];

  this.add = function(conversor){
    conversorArray.push(conversor);
  };

  this.cast = function(obj) {
    for (var i=0; i<conversorArray.length;i++) {
      var conversor = conversorArray[i];
      var converted = conversor(obj);

      if (converted) return converted;
    }

    throw "Can't convert " + obj + " to " + typeName;
  };
};

TypeCast = function(){
  var typeConversors = {};

  this.register = function(typeName, conversor){
    var typeConversor;
    if (!typeConversors[typeName]) {
      typeConversors[typeName] = new TypeConversor(typeName);
    }

    typeConversor = typeConversors[typeName];
    typeConversor.add(conversor);
  };

  this.cast = function(typeName, obj) {
    var typeConversor = typeConversors[typeName];
    if (!typeConversor) throw "unkown type " + typeName;

    return typeConversor.cast(obj);
  };
};

})();
MUSIC = {};

(function() {
MUSIC.SoundLib = MUSIC.SoundLib || {};
MUSIC.Effects = MUSIC.Effects || {};
MUSIC.Types = new TypeCast();


MUSIC.playablePipeExtend = function(obj) {
  obj.during = function(duration) {
    var original = this;
    return MUSIC.playablePipeExtend({
      play: function() {
        var stopped = false;
        var playable = original.play();
        var wrapper = {
          stop: function() {
            if (!stopped) playable.stop();
            stopped = true;
          }
        };
        setTimeout(wrapper.stop, duration);
        return wrapper;
      },

      duration: function() { return duration; }
    });
  };

  obj.stopDelay = function(delay) {
    var original = this;
    return MUSIC.playablePipeExtend(
      {
        play: function(param) {
          var playing = original.play(param);
          return {
            stop: function() {
              setTimeout(playing.stop.bind(playing), delay);
            }
          };
        }
      }
    );
  };

  obj.onError = function(fcn) {
    var original = this;
    return MUSIC.playablePipeExtend(
      {
        play: function(param) {
          try {
            var playing = original.play(param);
            return {
              stop: function() {
                try {
                  playing.stop();
                } catch(e) {
                  console.error(e);
                  fcn(e);
                }
              }
            };
          } catch(e) {
            console.error(e);
            fcn(e);
            throw e;
          }
        }
      }
    );
  };

  obj.onStop = function(fcn) {
    var original = this;
    return MUSIC.playablePipeExtend(
      {
        play: function(param) {
          var playing = original.play(param);
          return {
            stop: function() {
              playing.stop();
              fcn(param);
            }
          };
        }
      }
    );
  };

  return obj;
};

MUSIC.Types.register("playable", function(playable) {
  if (playable.play) {
    return playable;
  }
});

MUSIC.Types.register("playable", function(fcn) {
  if (typeof fcn === "function") {
    return {
      play: fcn
    };
  }
});

MUSIC.EffectsPipeline = function(audio, audioDestination) {
  this._audio = audio;
  this._audioDestination = audioDestination;
};

var defaultWrapFcn = function(obj){
  return obj;
};
var compose = function(f,g) {
  return function(obj) {
    return g(f(obj));
  };
};

MUSIC.EffectsPipeline.prototype = {

  _wrapFcn: defaultWrapFcn,

  wrap: function(f) {
    var ret = new MUSIC.DummyNode(this)
    if (this._wrapFcn !== defaultWrapFcn) {
      f = compose(f, this._wrapFcn);
    }
    ret._wrapFcn = function(obj) {
      var ret2 = f(obj);
      ret2._wrapFcn = ret._wrapFcn;
      return ret2;
    };
    return ret;
  },

  sfxBase: function() {
    var objects = [];
    var dispose = function(obj) {
      obj.dispose();
    };

    var sfxBaseWrapper = function(elem) {
      if (!elem.dispose) return elem;
      
      var removeElem = function(x) {
        return x != elem;
      };
      var originalDispose = elem.dispose;
      objects.push(elem);
      elem.dispose = function() {
        objects = objects.filter(removeElem);
        originalDispose.call(elem);
      };

      return elem;
    };

    var sfxPrune = function() {
      objects.forEach(dispose);
    };

    var ret = this.wrap(sfxBaseWrapper);
    ret.prune = sfxPrune;
    return ret;
  },

  oscillator: function(options) {
    return this._wrapFcn(new MUSIC.SoundLib.Oscillator(this._audio, this._audioDestination, options));
  },

  soundfont: function(param) {
    return this._wrapFcn(new MUSIC.SoundfontInstrument(param, this._audio, this._audioDestination));
  },

  sound: function(path) {
    var audio = this._audio;
    var audioDestination = this._audioDestination;

    var request = new XMLHttpRequest();
    request.open("GET", path, true);
    request.responseType = "arraybuffer";
    var audioBuffer;

    request.onerror = function(err) {
      console.error(err);
    };

    request.onload = function(e) {
      audio.audio.decodeAudioData(request.response, function (buffer) {
        audioBuffer = buffer;
      });
    };

    request.send();
    return MUSIC.playablePipeExtend({
      play: function() {
        var bufferSource = audio.audio.createBufferSource();
        bufferSource.buffer = audioBuffer;
        bufferSource.connect(audioDestination._destination);
        bufferSource.start(audio.audio.currentTime);

        return {
          stop: function() {
            bufferSource.stop();
            bufferSource.disconnect(audioDestination._destination);
          }
        };
      }
    });
  },
  
  formulaGenerator: function(fcn) {
    return this._wrapFcn(new MUSIC.SoundLib.FormulaGenerator(this._audio, this._audioDestination, fcn));
  },

  scale: function(options) {
    var a, b;
    var formulaGenerator = new MUSIC.Effects.Formula(this._audio, this._audioDestination, function(input, t) {
      return input*a+b;
    });

    var update = function(options) {
      a = (options.top - options.base)/2;
      b = options.base + a;
    };

    update(options);
    formulaGenerator.update = update;

    return formulaGenerator;
  },


  T: function() {
    return this._wrapFcn(new MUSIC.T(arguments, this._audio, this._audioDestination));
  },

  noise: function() {
    return this._wrapFcn(new MUSIC.SoundLib.Noise(this._audio, this._audioDestination));
  },

  pink_noise: function() {
    return this._wrapFcn(new MUSIC.SoundLib.PinkNoise(this._audio, this._audioDestination));
  }
};

MUSIC.DummyNode = function(music) {
  MUSIC.EffectsPipeline.apply(this, [music._audio, music._audioDestination]);
};
MUSIC.DummyNode.prototype = Object.create(MUSIC.EffectsPipeline.prototype);

MUSIC.T = function(args, music, audioDestination) {
  var api = T("WebAudioAPI:recv", music.audio /* audioContext */);
  var context = api.context;
  var gainNode = context.createGain(1.0);

  api.recv(gainNode);
  setTimeout(function() { // this hack prevents a bug in current version of chrome
    gainNode.connect(audioDestination._destination);
  });

  var Targuments = [];
  for (var i=0; i<args.length; i++) {
    Targuments.push(args[i]);
  };

  Targuments.push(api);
  var synth = T.apply(null, Targuments);// ("reverb", {room:0.95, damp:0.1, mix:0.75}, api);
  var send = T("WebAudioAPI:send", synth, music.audio /* audioContext */).send(audioDestination._destination);

  this.output = function() {
    return gainNode;
  }; 

  var disconnected = false;
  this.disconnect = function() {
    if (disconnected) return;
    disconnected = true;
    gainNode.disconnect(audioDestination._destination);
    api.cancel();
  };

  this.dispose = this.disconnect;

  this._destination = gainNode;
  this.next = function() {
    return audioDestination;
  };

  MUSIC.EffectsPipeline.bind(this)(music, this);
};
MUSIC.T.prototype = Object.create(MUSIC.EffectsPipeline.prototype);

MUSIC.Effects.register = function(effectName, fcn) {
  MUSIC.EffectsPipeline.prototype[effectName] = function(value) {
    return this._wrapFcn(fcn(this._audio, this._audioDestination, value));
  };
};

var audioContext = new (window.AudioContext || window.webkitAudioContext)();
MUSIC.Context = function(options) {
  var audio = audioContext;
  var music = this;
  var gainNode = audio.createGain();
  options = options || {};

  gainNode.gain.value = 1.0; 
  
  if (!options.nooutput) gainNode.connect(audio.destination);

  this._destination = gainNode;
  this.audio = audio;

  this.record = function() {
    var rec = new Recorder(gainNode, {workerPath: "lib/recorder/recorderWorker.js"});

    rec.record();
    return rec;
  };

  this.audio = audio;

  MUSIC.EffectsPipeline.bind(this)(music, this);
};
MUSIC.Context.prototype = new MUSIC.EffectsPipeline();

MUSIC.SoundLib.FormulaGenerator = function(audio, nextProvider, fcn) {
  this.play = function(param) {
    var audioDestination;
    var formulaGenerator = new MUSIC.Effects.Formula(audio, nextProvider, function(input, t) {
      return fcn(t);
    });

    return {
      stop: function() {
        formulaGenerator.disconnect(nextProvider._destination);
      }
    }
  };

  MUSIC.playablePipeExtend(this);
};

MUSIC.SoundLib.PinkNoise = function(audio, nextProvider) {
  this.play = function(param) {
    var audioDestination;
    var b0, b1, b2, b3, b4, b5, b6;
    b0 = b1 = b2 = b3 = b4 = b5 = b6 = 0.0;

    var noiseGenerator = new MUSIC.Effects.Formula(audio, nextProvider, function() {
      var white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      var ret = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      b6 = white * 0.115926;
      return ret * 0.11;
    });

    return {
      stop: function() {
        noiseGenerator.disconnect(nextProvider._destination);
      }
    }
  };

  MUSIC.playablePipeExtend(this);
};


MUSIC.SoundLib.Noise = function(audio, nextProvider) {
  var audioContext = audio.audio;

  var bufferSize = 2 * audioContext.sampleRate,
      noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate),
      output = noiseBuffer.getChannelData(0);
  for (var i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
  }

  this.play = function(param) {
    var whiteNoise = audioContext.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;
    whiteNoise.start(0);

    whiteNoise.connect(nextProvider._destination);

    return {
      stop: function() {
        whiteNoise.stop();
        whiteNoise.disconnect(nextProvider._destination);
      }
    }
  };

  MUSIC.playablePipeExtend(this);
};

MUSIC.SoundLib.Wave = function(path, period) {

  var music = new MUSIC.Context({nooutput: true});
  var sound = music.sound(path);
  var sampleCount = Math.floor(period * music.audio.sampleRate / 1000);
  var dataArray = [];

  // fix race condition using callbacks
  setTimeout(function() {
    var recording = music.record();
    sound.play();

    setTimeout(function(){
      recording.stop();
      recording.getBuffer(function(data) {
        var originalDataArray = data[0];
        for (var i=0; i<sampleCount; i++) {
          dataArray.push(originalDataArray[i]);
        }
      });
    }, period+100);
  }, 500);

  this.f = function(t) {
    if (t<0)return 0;
    var value1 = dataArray[Math.floor(t*sampleCount)];
    return value1;
  };  
};

MUSIC.AudioDestinationWrapper = function(music, audioDestination) {
    this._destination = audioDestination;
    MUSIC.EffectsPipeline.bind(this)(music, this)
};
MUSIC.AudioDestinationWrapper.prototype = Object.create(MUSIC.EffectsPipeline.prototype);

MUSIC.modulator = function(f) {
  return {
    apply: function(currentTime, audioParam, music) {
      var modulatorFactory = (new MUSIC.AudioDestinationWrapper(music, audioParam)).sfxBase();
      var modulator = f(modulatorFactory).play();

      return {
        dispose: function() {
          modulatorFactory.prune();
          if (modulator) modulator.stop();
          modulator = null;
        }
      };
    }
  };
};

MUSIC.SoundLib.Oscillator = function(music, destination, options) {
  options = options || {};
  var effects = options.effects;
  var frequency = options.frequency;
  var detune = options.detune;

  this.freq = function(newFreq) {
    var newoptions = {
      type: options.type,
      wave: options.wave,
      f: options.f,
      frequency: options.fixed_frequency ? options.fixed_frequency : newFreq,
      detune: options.detune,
      periodicWave: options.periodicWave
    };
    return new MUSIC.SoundLib.Oscillator(music, destination, newoptions)
  };

  if (options.f) {
    this.play = function(param) {
      var wtPosition = options.wtPosition || 0;
      var fcn = options.f;
      var ta = 0;
      var frequency;
      var optionsFrequency = options.frequency;

      if (optionsFrequency.at) {
        frequency = optionsFrequency.at.bind(optionsFrequency);
      } else {
        frequency = function(t){ return optionsFrequency };
      }
      var deltatime = 0;
      var lastTime = 0;
      var tb;

      if (wtPosition.at) {
        var formulaGenerator = new MUSIC.Effects.Formula(music, destination, function(input, t) {
          deltatime = t - lastTime;
          ta += deltatime * frequency(t);
          ta = ta % 1;

          tb = ta + wtPosition.at(t);
          tb = tb % 1;

          if (tb < 0) tb++;
          lastTime = t;
          return fcn(tb);
        });
      } else {
        var formulaGenerator = new MUSIC.Effects.Formula(music, destination, function(input, t) {
          deltatime = t - lastTime;
          ta += deltatime * frequency(t);
          ta = ta % 1;

          tb = ta + wtPosition;
          tb = tb % 1;

          if (tb < 0) tb++;
          lastTime = t;
          return fcn(tb);
        });
      }

      return {
        stop: function() {
          formulaGenerator.disconnect(destination._destination);
        }
      }
    };    
  } else if (options.wave) {
    var newOptions = Object.create(options);
    newOptions.f = options.wave.f;
    MUSIC.SoundLib.Oscillator.bind(this)(music, destination, newOptions);
  } else {
    var wave;
    if (!options.periodicWave) {
      if (options.type === "custom") {
        var real = new Float32Array(options.terms.sin || []);
        var imag = new Float32Array(options.terms.cos || []);

        options.periodicWave = music.audio.createPeriodicWave(real, imag);
      }
    }

    this.play = function(param) {
      var osc;
      var nextNode;
      var disposeNode;
      var audioDestination;

      osc = music.audio.createOscillator();

      var appliedFrequencyParam;
      if (frequency.apply) {
        appliedFrequencyParam = frequency.apply(music.audio.currentTime, osc.frequency);
      } else {
        osc.frequency.value = frequency;
      }

      var appliedAudioParam;
      if (detune) {
        if (detune.apply) {
          appliedAudioParam = detune.apply(music.audio.currentTime, osc.detune, music);
        } else {
          osc.detune.value = detune;
        }
      }

      if (options.periodicWave) {
        osc.setPeriodicWave(options.periodicWave);
      } else {
        osc.type = options.type;
      }

      nextNode = destination;
      audioDestination = nextNode._destination;
      disposeNode = function() {
        osc.disconnect(audioDestination);
      };

      osc.connect(audioDestination);
      osc.start(0);

      return {
        stop : function() {
          if (appliedAudioParam && appliedAudioParam.dispose) {
            appliedAudioParam.dispose();
          }
          if (appliedFrequencyParam && appliedFrequencyParam.dispose) {
            appliedFrequencyParam.dispose();
          }
          osc.stop(0);
          disposeNode();
        }
      };
    };
  }

  MUSIC.playablePipeExtend(this);
};

MUSIC.Loop = function(playable, times) {
  var original = playable;
  var duration = playable.duration();
  return {
    play: function() {
      var lastPlay;
      var startTime = window.performance.now();
      var lastTime = startTime;
      var currentIteration = 0;

      lastPlay = playable.play();

      var nextIteration = function() {
        var now = window.performance.now();
        if (now - startTime > currentIteration * duration) { // ms
          setTimeout(function(){
              lastPlay = playable.play();
          }, (currentIteration+1) * duration - now)
          currentIteration++;
          if (currentIteration == times-1) {
            clearInterval(inter);
          }
        }
      };

      var inter = setInterval(nextIteration, duration);
      return {
        stop: function() {
          clearInterval(inter)
          if (lastPlay) lastPlay.stop();
        }
      };
    }
  };
};

MUSIC.Silence = function(time) {
  return {
    play : function() {
      return {
        stop: function(){

        }
      }
    },

    duration: function(){return time}
  };
};

})();
MUSIC.Effects = MUSIC.Effects || {};

var effectsObject = {};
MUSIC.Effects.forEach = function(cb) {
  for (var sfx in effectsObject) {
    cb(sfx, effectsObject[sfx]);
  }
};

MUSIC.Effects.WebAudioNodeWrapper = function (music, audioNode, next, onDispose) {

  this._destination = audioNode;
  setTimeout(function() { // this hack prevents a bug in current version of chrome
    audioNode.connect(next._destination);
  });

  this.next = function() {
    return next;
  };

  var disconnected = false;
  this.disconnect = function() {
    if (disconnected) return;
    if (onDispose) onDispose();
    disconnected = true;
    audioNode.disconnect(next._destination);
  };

  this.dispose = this.disconnect;

  this.output = function() {
    return audioNode;
  };

  this.setParam = function(paramName, value) {
    value.apply(music.audio.currentTime, audioNode[paramName]);
  };

  this.record = function() {
    var rec = new Recorder(audioNode, {workerPath: "lib/recorder/recorderWorker.js"});

    rec.record();
    return rec;
  };

  MUSIC.EffectsPipeline.bind(this)(music, this);
};
MUSIC.Effects.WebAudioNodeWrapper.prototype = Object.create(MUSIC.EffectsPipeline.prototype);

MUSIC.Effects.Formula = function(music, next, fcn) {
  var scriptNode = music.audio.createScriptProcessor(1024, 1, 1);
  var iteration = 0;
  var sampleRate = music.audio.sampleRate;

  scriptNode.onaudioprocess = function(audioProcessingEvent) {
    // The input buffer is the song we loaded earlier
    var inputBuffer = audioProcessingEvent.inputBuffer;

    // The output buffer contains the samples that will be modified and played
    var outputBuffer = audioProcessingEvent.outputBuffer;

    // Loop through the output channels (in this case there is only one)
    for (var channel = 0; channel < outputBuffer.numberOfChannels; channel++) {
      var inputData = inputBuffer.getChannelData(channel);
      var outputData = outputBuffer.getChannelData(channel);

      // Loop through the 4096 samples
      for (var sample = 0; sample < inputBuffer.length; sample++) {
        // make output equal to the same as the input
        outputData[sample] = fcn(inputData[sample], (inputBuffer.length * iteration + sample) / sampleRate);
      }
    }

    iteration++;
  }

  setTimeout(function() { // this hack prevents a bug in current version of chrome
    scriptNode.connect(next._destination);
  });

  this._destination = scriptNode;
  
  MUSIC.EffectsPipeline.bind(this)(music, this);

  this.next = function() {
    return next;
  };

  var disconnected = false;
  this.disconnect = function() {
    if (disconnected) return;
    disconnected = true;
    scriptNode.disconnect(next._destination);
  };

  this.dispose = this.disconnect;

  this.update = function(_f) {
    fcn = _f;
  };

  this.output = function() {
    return scriptNode;
  };
}
MUSIC.Effects.Formula.prototype = Object.create(MUSIC.EffectsPipeline.prototype);


MUSIC.Effects.register("formula", function(music, next, fcn) {
  return new MUSIC.Effects.Formula(music, next, fcn)
});


MUSIC.Effects.BiQuad = function(music, next, options) {
  var biquadFilter = music.audio.createBiquadFilter();
  var gainModulation = nodispose;
  var qModulation = nodispose;
  var frequencyModulation = nodispose;
  var detuneModulation = nodispose;

  var biquadType = options.type;

  this.update = function(options) {
    biquadFilter.type = biquadType;

    var assignParam = function(orig, audioParam) {
      if (orig) {
        if (orig.apply) {
          return orig.apply(music.audio.currentTime, audioParam, music);
        } else {
          audioParam.value = orig;
        }
      }

      return nodispose;
    };

    gainModulation.dispose();
    qModulation.dispose();
    frequencyModulation.dispose();
    detuneModulation.dispose();

    gainModulation = assignParam(options.gain, biquadFilter.gain);
    qModulation = assignParam(options.Q, biquadFilter.Q);
    frequencyModulation = assignParam(options.frequency, biquadFilter.frequency);
    detuneModulation = assignParam(options.detune, biquadFilter.detune);
  };

  this.update(options);

  MUSIC.Effects.WebAudioNodeWrapper.bind(this)(music, biquadFilter, next, function() {
    gainModulation.dispose();
    qModulation.dispose();
    frequencyModulation.dispose();
    detuneModulation.dispose();
  });
};
MUSIC.Effects.BiQuad.prototype = Object.create(MUSIC.Effects.WebAudioNodeWrapper.prototype);

MUSIC.Effects.register("biquad", MUSIC.Effects.BiQuad);
["lowpass", "highpass", "bandpass", "lowshelf", "highshelf", "peaking", "notch", "allpass"]
  .forEach(function(filterName) {
    MUSIC.Effects.register(filterName, function(music, next, options) {
      return new MUSIC.Effects.BiQuad(music, next, {type: filterName, frequency: options.frequency, Q: options.Q, detune: options.detune});
    });
  });

var canMutate = function(obj, updateFcn) {
  obj.update = function(value) {
    updateFcn(value);
    return obj;
  };
  return obj;
};

var nodispose = {
  dispose: function(){}
};

MUSIC.Effects.register("gain", function(music, next, value) {
  var gainNode = music.audio.createGain();
  var volumeModulation = nodispose;

  return canMutate(
    new MUSIC.Effects.WebAudioNodeWrapper(music, gainNode, next, function() {
      volumeModulation.dispose();
    }),
    function(value) {
      volumeModulation.dispose();

      if (value.apply) {
        gainNode.gain.value = 0.0;
        volumeModulation = value.apply(music.audio.currentTime, gainNode.gain, music);
      } else {
        volumeModulation = nodispose;
        gainNode.gain.value = value;
      }
    }
  ).update(value);
});

MUSIC.Effects.register("delay", function(music, next, value) {
  var delayNode = music.audio.createDelay(60);
  var delayModulation = nodispose;

  return canMutate(
    new MUSIC.Effects.WebAudioNodeWrapper(music, delayNode, next, function() {
      delayModulation.dispose();
    }),
    function(value) {
      delayModulation.dispose();

      if (value.apply) {
        delayModulation = value.apply(music.audio.currentTime, delayNode.delayTime, music);
      } else {
        delayModulation = nodispose;
        delayNode.delayTime.value = value;
      }
    }
  ).update(value);
});

var Echo = function(music, next, options) {
  this.update = function(options) {
    delayNode.delayTime.value = options.delay || 0.02;
    att.gain.value = options.gain === 0  ? 0 : (options.gain||0.2);

    if (delayNode.delayTime.value < 0.01) delayNode.delayTime.value = 0.01;
    if (delayNode.delayTime.value > 1) delayNode.delayTime.value = 1;
    if (att.gain.value > 0.99) att.gain.value = 0.99;
    if (att.gain.value < 0) att.gain.value = 0;
  };

  var delayNode = music.audio.createDelay(60);

  var gainNode = music.audio.createGain();
  var gainNode2 = music.audio.createGain();
  gainNode.gain.value = 1.0;
  gainNode2.gain.value = 1.0;

  var att = music.audio.createGain();

  this.update(options);

  setTimeout(function() {
    gainNode.connect(gainNode2);
    gainNode.connect(delayNode);
    delayNode.connect(att);
    gainNode2.connect(next._destination);
    gainNode2.connect(delayNode);
    att.connect(gainNode2);
  });

  this._destination = gainNode;


  this.next = function() {
    return next;
  };

  var disconnected = false;
  this.disconnect = function() {
    if (disconnected) return;
    disconnected = true;
    gainNode.disconnect(gainNode2);
    gainNode.disconnect(delayNode);
    delayNode.disconnect(att);
    gainNode2.disconnect(next._destination);
    gainNode2.disconnect(delayNode);
    att.disconnect(gainNode2);
  };

  this.dispose = this.disconnect;

  this.output = function() {
    return audioNode;
  };

  this.setParam = function(paramName, value) {
    value.apply(music.audio.currentTime, audioNode[paramName]);
  };

  MUSIC.EffectsPipeline.bind(this)(music, this);
};
Echo.prototype = Object.create(MUSIC.EffectsPipeline.prototype);

MUSIC.Effects.register("echo", function(music, next, options) {
  return new Echo(music, next, options);
});

MUSIC.Curve = function(array) {
  this.during = during(array);
};

MUSIC.Curve.concat = function(c1, time1, c2, time2, n) {
  var time = time1 + time2;
  if (!n) {
    n=Math.floor(time*100)+1;
  }

  var at = function(t) {
    if (t < time1){
      return c1.at(t); 
    } else {
      return c2.at(t-time1);
    }
  };

  var array = new Float32Array(n+1);
  for (var i = 0; i < n+1; i++ ) {
    array[i] = at(time * (i / n));
  };

  return {
    apply: function(currentTime, audioParam) {
      audioParam.setValueCurveAtTime(array, currentTime, time)
    },

    at: at
  };
};

var during = function(fcn, n) {
  return function(time) {
    if (!n) {
      n=Math.floor(time*100)+1;
    }

    var array = new Float32Array(n+1);
    for (var i = 0; i < n+1; i++ ) {
      array[i] = fcn(i / n);
    };

    return { 
      apply: function(currentTime, audioParam) {
        audioParam.setValueCurveAtTime(array, currentTime, time);
      },

      at: function(t) {
        return fcn(t/time);
      }
    };
  };
};


MUSIC.Curve.Formula = function(fcn, n) {
  this.during = during(fcn, n);
}

MUSIC.Curve.Ramp = function(initValue, endValue, n) {
  MUSIC.Curve.Formula.bind(this)(function(t){return initValue + (endValue - initValue)*t;}, n);
};

MUSIC.Curve.Periodic = function(fcn, frequency) {
  var ta = 0;
  var delayTime;
  var lastTime = 0;
  var deltatime;
  var tb;
  var period = 1.0 / frequency;
  if (frequency.at) {
    this.at = function(t) {
      deltatime = t - lastTime;
      ta += deltatime * frequency.at(t);
      ta = ta % 1;

      lastTime = t;
      return fcn(ta);
    };
  } else {
    this.at = function(t) {
      ta = (t % period) / period;
      if (ta < 0) ta++;
      return fcn(ta);
    };
  }
};

MUSIC.Effects.register("ADSR", function(music, next, options) {
  options = options || {};
  var samples = options.samples || 100;
  var attackTime = options.attackTime;
  var decayTime = options.decayTime;
  var sustainLevel = options.sustainLevel;
  var releaseTime = options.releaseTime;

  if (attackTime === undefined) attackTime = 0.1;
  if (decayTime === undefined) decayTime = 0.1;
  if (sustainLevel === undefined) sustainLevel = 0.8;
  if (releaseTime === undefined) releaseTime = 0.1;

  var nextNodeFcn = options.node;
  var attackCurve = new MUSIC.Curve.Ramp(0.0, 1.0, samples).during(attackTime);
  var decayCurve = new MUSIC.Curve.Ramp(1.0, sustainLevel, samples).during(decayTime);
  var startCurve = MUSIC.Curve.concat(attackCurve, attackTime, decayCurve, decayTime);

  var gainNode = next
              .gain(sustainLevel);

  gainNode.setParam('gain', startCurve);
  
  return nextNodeFcn(gainNode)
    .onStop(function(){ gainNode.dispose(); }) // dispose gain node
    .stopDelay(releaseTime * 1000)
    .onStop(function(){ 
      var currentLevel = gainNode._destination.gain.value;
      var releaseCurve = new MUSIC.Curve.Ramp(currentLevel, 0.0, samples).during(releaseTime)
      gainNode.setParam('gain', releaseCurve); 
    }); // set gain curve

});

MUSIC.Effects.register("stopCurve", function(music, next, options) {
  options = options || {};
  var samples = options.samples || 100;
  var duration = options.duration || 0.4;
  var nextNodeFcn = options.node;
  var stopCurve = new MUSIC.Curve.Ramp(1.0, 0.0, samples).during(duration);
  var gainNode = next
              .gain(1.0);
  
  return nextNodeFcn(gainNode)
    .onStop(function(){ gainNode.dispose(); }) // dispose gain node
    .stopDelay(duration * 1000)
    .onStop(function(){ gainNode.setParam('gain', stopCurve); }); // set gain curve

});


(function() {

var frequency = function(notenum) {
    return 16.35 * Math.pow(2, notenum/12);
};
var noteToNumMap = {
  'C': 0, 
  'D': 2, 
  'E': 4, 
  'F': 5, 
  'G': 7, 
  'A': 9, 
  'B': 11
};

var instrumentExtend = function(obj) {
  var delayedPlaying = function(originalPlaying, ms) {
    return {
      stop: function() {
        setTimeout(originalPlaying.stop.bind(originalPlaying), ms);
      } 
    };
  };

  var delayedNote = function(originalNote, ms) {
    return {
      play: function(param) {
        var originalPlaying = originalNote.play(param);
        return delayedPlaying(originalPlaying, ms);
      }
    };
  };

  obj.stopDelay = function(ms) {
    return instrumentExtend({
      note: function(noteNum) {
        return delayedNote(obj.note(noteNum), ms);
      }
    });
  };

  obj.perNoteWrap = function(wrapper) {
    return instrumentExtend({
      note: function(noteNum) {
        return wrapper(obj.note(noteNum));
      }
    });
  };

  obj.mapNote = function(fcn) {
    return instrumentExtend({
      note: function(noteNum) {
        return obj.note(fcn(noteNum));
      }
    });
  };

  return obj;
};

MUSIC.noteToNoteNum = function(noteName) {
  var notenum;

  notenum = noteToNumMap[noteName.charAt(0)]
  if (notenum === undefined) return undefined
  if (noteName.charAt(1) === '#') notenum++;
  if (noteName.charAt(1) === 'b') notenum--;
  if (noteName.charAt(2) !== "") notenum += (12 * parseInt(noteName.charAt(2)));
  return notenum;
};

MUSIC.Instrument = function(soundFactory) {
  this.note = function(notenum) {
    if (notenum === undefined) return undefined;

    var freq = frequency(notenum);
    return MUSIC.playablePipeExtend({
      play: function(param) {
        var soundInstance = soundFactory.freq(freq).play(param);
        return {
          stop: function() {
            soundInstance.stop();
          }
        }
      }
    });
  };

  instrumentExtend(this);
};

MUSIC.instrumentExtend = instrumentExtend;
MUSIC.Instrument.frequency = frequency;

MUSIC.MultiInstrument = function(instrumentArray) {
  var notePlay = function(note) { return note.play(); };
  var noteStop = function(note) { return note.stop(); };

  var MultiNote = function(noteArray) {
    this.play = function() {
      var notes = noteArray.map(notePlay);
      return {
        stop: function() {
          notes.forEach(noteStop);
        }
      };
    }
  };

  this.note = function(noteNum) {
    return MUSIC.playablePipeExtend(new MultiNote(instrumentArray.map(function(instrument){ 
      return instrument.note(noteNum);
    })));
  };

  instrumentExtend(this);

};

var NOTES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
var noteNumToNoteName = function(noteNum) {
  var noteName = NOTES[noteNum % 12];
  var octaveNum = (Math.floor(noteNum / 12 + 1));

  return noteName + octaveNum;
};

MUSIC.PatchInstrument = function(notes) {
  var noteNum;
  var sounds = [];

  for (var noteName in notes) {
    var playable = MUSIC.Types.cast("playable", notes[noteName]);
    noteNum = MUSIC.noteToNoteNum(noteName);
    sounds[noteNum] = playable;
  };

  this.note = function(noteNum) {
    var s = sounds[noteNum];
    if (!s) return s;
    return MUSIC.playablePipeExtend({
      play: s.play
    });
  };

  instrumentExtend(this);
};

MUSIC.SoundfontInstrument = function(sounds, audio, audioDestination) {

  var noteAudio = [];

function _base64ToArrayBuffer(base64) {
    var binary_string =  window.atob(base64);
    var len = binary_string.length;
    var bytes = new Uint8Array( len );
    for (var i = 0; i < len; i++)        {
        var ascii = binary_string.charCodeAt(i);
        bytes[i] = ascii;
    }
    return bytes.buffer;
};
  audio = audio.audio
  
  for (var i = 0; i<72; i++) {
    (function() {
      var index = i;
      var xmlhttp=new XMLHttpRequest();
      var noteName = noteNumToNoteName(i);
      var data = sounds[noteName];
      var encoded = data.split(",")[1];

      audio.decodeAudioData(_base64ToArrayBuffer(encoded), function(buffer) {
        noteAudio[index] = buffer;
      }, function(err) {
        console.error("error " + err + " loading " + index);
      });

    })();
  };

  this.note = function(notenum) {
    var source = audio.createBufferSource();
    return MUSIC.playablePipeExtend({
      play: function() {
        var source = audio.createBufferSource();
        source.buffer = noteAudio[notenum];
        source.connect(audioDestination._destination);
        source.start(0);
        return {
          stop: function() {
            source.stop(0);
            source.disconnect(audioDestination._destination);
          }
        };
      }
    });
  };

  instrumentExtend(this);

};

MUSIC.Types.register("instrument", function(instrument) {
  if (instrument.note) return instrument;
});

MUSIC.Types.register("instrument", function(soundGenerator) {
  if (soundGenerator.freq) {
    return new MUSIC.Instrument(soundGenerator);
  }
});

MUSIC.Types.register("instrument", function(playable) {
  if (playable.play) {
    return {
      note: function(){
        return playable;
      }
    };
  }
});

var nullPlay = {
  play: function(){
    return {stop: function(){}};
  }
};

MUSIC.Types.register("instrument", function(fcn) {
  if (typeof fcn === "function") {
    return {
      note: function(n) {
        return fcn(n) || nullPlay;
      }
    };
  }
});

MUSIC.Types.register("instrument", function(array) {
  if (array instanceof Array) {
    return new MUSIC.MultiInstrument(array);
  }
});

MUSIC.Types.register("instrument", function(plainObject) {
  if (typeof plainObject === "object" && plainObject.constructor === Object) {
    return new MUSIC.PatchInstrument(plainObject)
  }
});

MUSIC.StopEvent = function() {
  return function(note) {
      return MUSIC.playablePipeExtend({
          play: function() {
              var paramObject = {
                  onplay: function() {},
                  onstop: function() {}
              };

              var originalNote = note.play(paramObject);
              paramObject.onplay();
              return {
                  stop: function() {
                      paramObject.onstop();
                      originalNote.stop();
                  }
              };
          }
      });
  };
};

})();
MUSIC.Effects = MUSIC.Effects || {};

var LemonadePlayable = function(music, destination, outputFcn, ops) {
  this._destination = destination;
  this._music = music;
  this._ops = ops;
  this._output = outputFcn;
};

LemonadePlayable.prototype.play = function() {
  var destination = this._destination;
  var ops = this._ops;
  var opsLength = ops.length;
  var signalArray = [];
  var phaseArray = [];


  for (var i=0; i<opsLength; i++) {
    signalArray[i] = 0;
    phaseArray[i] = 0;
    ops[i].wave = MUSIC.Types.cast("function", ops[i].wave)
  }

  var lastT = 0;
  var outputFcn = this._output;
  var formulaGenerator = new MUSIC.Effects.Formula(this._music, destination, function(input, t) {
    var deltay = t-lastT;
    for (var i=0; i<opsLength; i++) {
      lastT = t;
      // EULER
      phaseArray[i] = phaseArray[i] + deltay * ops[i].frequency.apply(null, signalArray);

      var phase = phaseArray[i] % 1;
      if (phase < 0) phase++;
      signalArray[i] = ops[i].wave(phase)
    };

    return outputFcn.apply(null, signalArray);
  });
  return {
    stop: function() {
      formulaGenerator.disconnect(destination._destination);
    }
  };
};

MUSIC.playablePipeExtend(LemonadePlayable.prototype);

MUSIC.Effects.register("lemonade", function(music, next, options) {
  return new LemonadePlayable(music, next._audioDestination, options.output, options.ops);
});
(function() {

MUSIC.NoteSequence = function(funseq) {
  var clock;
  if (!funseq){
    clock = MUSIC.Utils.Clock(
      window.performance.now.bind(window.performance),
      setInterval,
      clearInterval,
      500);
    funseq = MUSIC.Utils.FunctionSeq(clock, setTimeout, clearTimeout);
  }

  this._funseq = funseq;
  this._totalduration = 0;
  this._noteid = 0;
};

MUSIC.NoteSequence.Playable = function(noteseq, context, duration) {
  this._noteseq = noteseq;
  this._context = context;
  this._duration = duration;
};

MUSIC.NoteSequence.Playable.prototype.loop = function(times) {
  return MUSIC.Loop(this, times);
};

MUSIC.NoteSequence.Playable.prototype.duration = function() {
  return this._duration;
};

MUSIC.NoteSequence.Playable.prototype.play = function() {
  this._runningFunSeq = this._noteseq._funseq.start(this._context);
  return new MUSIC.NoteSequence.Playing(this._runningFunSeq, this._context);
};

MUSIC.NoteSequence.Playing = function(runningFunSeq, ctx) {
  this._runningFunSeq = runningFunSeq;
  this._context = ctx;
};
MUSIC.NoteSequence.Playing.prototype.stop = function() {
  if (this._context.playing) this._context.playing.stop();
  this._runningFunSeq.stop();
  this._context.stop();
};

MUSIC.NoteSequence.prototype.push = function(array){
  var noteNum = array[0];
  var startTime = array[1];
  var duration = array[2];

  this._noteid++;
  var mynoteid = this._noteid;

  this._funseq.push({t:startTime, f: function(ctx){
    var playing;
    playing = ctx.instrument.note(noteNum);
    ctx.setPlaying(mynoteid, playing);
  }});
  this._funseq.push({t:startTime + duration, f: function(ctx){
    ctx.unsetPlaying(mynoteid);
  }});

  if (startTime + duration > this._totalduration) this._totalduration = startTime + duration;
};

MUSIC.NoteSequence.prototype.makePlayable = function(instrument) {
  return new MUSIC.NoteSequence.Playable(this, MUSIC.NoteSequence.context(instrument), this._totalduration);
};

MUSIC.NoteSequence.context = function(instrument) {
  var playingNotes = [];
  var setPlaying = function(noteid, p) {
    playingNotes[noteid] = p.play();
  };
  var unsetPlaying = function(noteid) {
    var playing = playingNotes[noteid]; 
    if (playing) {
      playing.stop();
      playingNotes[noteid] = undefined;
    }
  };

  var stop = function() {
    for (var i = 0; i<playingNotes.length; i++) {
      if(playingNotes[i]) playingNotes[i].stop();
    }
  };

  return {
    setPlaying: setPlaying,
    unsetPlaying: unsetPlaying,
    instrument: instrument,
    stop: stop
  };
};

})();
(function() {
var playablePlay = function(playable) { return playable.play(); };
var playingStop = function(playing) { playing.stop(); };

MUSIC.MultiPlayable = function(playableArray) {
  this._playableArray = playableArray;

  MUSIC.playablePipeExtend(this);
};

MUSIC.MultiPlayable.prototype.play = function() {
  var playingArray = this._playableArray.map(playablePlay);

  return {
    stop: function() {
      playingArray.forEach(playingStop);
    }
  };
};

var higher = function(a,b){ return a > b ? a : b; };
var getDuration = function(playable) { return playable.duration(); };
MUSIC.MultiPlayable.prototype.duration = function() {
  return this._playableArray.map(getDuration).reduce(higher, 0);
};

MUSIC.ChangeTimeWrapper = function(noteseq, extensionTime) {
  this._noteseq=noteseq;
  this._extensionTime=extensionTime;
};

MUSIC.ChangeTimeWrapper.prototype.push = function(input) {
  this._noteseq.push([input[0], input[1]*this._extensionTime, input[2]*this._extensionTime]);
};

MUSIC.Pattern = function(input, options) {
  var playableArray = [];
  options = options || {};
  options.pulseTime = options.pulseTime || 50;

  playableArray = input.map(function(seq) {
    var code = seq[0];
    var instrument = MUSIC.Types.cast("instrument", seq[1]);

    var noteseq = new MUSIC.NoteSequence();
    MUSIC.SequenceParser.parse(code, new MUSIC.ChangeTimeWrapper(noteseq,options.pulseTime));
    return noteseq.makePlayable(instrument);
  });

  return new MUSIC.MultiPlayable(playableArray);

};

})();
(function() {
MUSIC.SequenceParser = {};
var notes = {
  "Cb": -1,
  "C": 0,
  "C#": 1,
  "Db": 1,
  "D": 2,
  "D#": 3,
  "Eb": 3,
  "E": 4,
  "E#": 5,
  "Fb": 4,
  "F": 5,
  "F#": 6,
  "Gb": 6,
  "G": 7,
  "G#": 8,
  "Ab": 8,
  "A": 9,
  "A#": 10,
  "Bb": 10,
  "B": 11,
  "B#": 12
};

var isNoteStart = function(chr) {
  return "CDEFGAB".indexOf(chr) !== -1;
};

var noteSplit = function(str) {
  var ret = [];
  var lastNote = "";
  for (var i = 0; i < str.length; i++) {
    if (isNoteStart(str[i])) {
      if (lastNote !== "") ret.push(lastNote);
      lastNote = "";
    }

    if (str[i] === " " || str[i] === ".") {
      if (lastNote !== "") ret.push(lastNote);
      lastNote = "";
    }

    lastNote += str[i];
  }
  if (lastNote !== "") ret.push(lastNote);
  return ret;
};

var pipeReplace = new RegExp("\\|", "g");
MUSIC.SequenceParser.parse = function(input, noteSeq) {
  var currentNote;
  var currentCharacter;
  if (input === "") return;
  input = input.replace(pipeReplace, "");

  var noteArray = noteSplit(input);
  var currentTime = 0;
  for (var i=0; i<noteArray.length; i++) {
    var currentNoteStr = noteArray[i];
    var noteDuration = currentNoteStr.length;
    var equalIndex = currentNoteStr.indexOf("=");
    if (equalIndex != -1) currentNoteStr = currentNoteStr.slice(0, equalIndex);

    var lastChar = currentNoteStr.slice(-1);
    var octave = parseInt(lastChar);
    if (isNaN(octave)) {
      octave = 0;
    } else {
      currentNoteStr = currentNoteStr.slice(0, currentNoteStr.length-1);
    }

    var currentNote = notes[currentNoteStr];
    if (currentNote !== undefined){
      noteSeq.push([currentNote + octave*12, currentTime, noteDuration])
    };
    currentTime += noteDuration;
  }
};

})();
(function() {

var PlayingSong = function(funseq) {
  this._context = {playing: []};
  this._funseqHandler = funseq.start(this._context);
};

PlayingSong.prototype.stop = function() {
  this._context.playing.forEach(function(playing) {
    playing.stop();
  });

  this._funseqHandler.stop();
};

var fromPatterns = function(patterns) {
  return function(patternName) {
    return patterns[patternName];
  };
};

MUSIC.Song = function(input, patterns, options){

  options = options || {};
  var measure = options.measure || 500;
  var funseq;
  if (!funseq){
    var clock = MUSIC.Utils.Clock(
      window.performance.now.bind(window.performance),
      setInterval,
      clearInterval,
      500);
    funseq = MUSIC.Utils.FunctionSeq(clock, setTimeout, clearTimeout);
  }


  var totalMeasures = input[0].length;
  var getFromPatterns = fromPatterns(patterns);

  this._funseq = funseq;
  this._duration = totalMeasures * measure;

  for (var j = 0; j < totalMeasures; j++) {
    (function() {
      var patternArray = [];
      for (var i = 0 ; i < input.length; i++) {
        patternArray.push(input[i][j]);
      };
      var playableArray = patternArray.map(getFromPatterns) 
      var multiPlayable = new MUSIC.MultiPlayable(playableArray);
      var playing;
      funseq.push({t: j*measure, f: function(context) {
        playing = multiPlayable.play();
        context.playing.push(playing);
      }});

      funseq.push({t: (j+1)*measure, f: function(context) {
        playing.stop();
        context.playing = context.playing.filter(function(x){ return x != playing; });
      }});

    })();
  };
};

MUSIC.Song.prototype.duration = function() {
  return this._duration;
};

MUSIC.Song.prototype.play = function() {
  return new PlayingSong(this._funseq);
};

})();
(function() {
MUSIC.Utils = MUSIC.Utils || {};
MUSIC.Utils.Scale = function(base) {
  var toneAdd;
  var v;

  toneAdd = {};
  v = [0,2,5,7,9];
  for (var i=0; i<v.length; i++) {
    toneAdd[(base+v[i]) % 12 ] = true;
  }

  return {
    add: function(notenum, notes) {
      var ret = notenum;
      while (notes > 0) {
        ret+= toneAdd[ret % 12] ? 2 : 1;
        notes--;
      }
      return ret;
    }
  };
};

MUSIC.Utils.Clock = function(preciseTimer, setInterval, clearInterval, interval) {
  var start = function(fcn) {
    var startTime = preciseTimer();
    fcn(0);
    var hndl = setInterval(function(){
      var t = preciseTimer();
      fcn(t - startTime);
    }, interval);

    return {
      stop: function() {
        clearInterval(hndl);
      }
    }
  };

  return {
    start: start
  };
};

MUSIC.Utils.FunctionSeq = function(clock, setTimeout, clearTimeout) {
  var eventsArray = [];

  var reject = function(x) {
    return function(y) {
      return x!=y;
    };
  };

  var start = function(parameter) {
    var array = eventsArray.slice(0);
    var timeoutHandlers = [];
    var eventCount = array.length;

    var clockHandler = clock.start(function(t) {
      var callingCriteria = function(element) {
        return element.t - t < 1000 && element.t - t >= 0;
      };

      var schedule = function(event) {
        var timeoutHandler = setTimeout(function(){
          timeoutHandlers = timeoutHandlers.filter(reject(timeoutHandler))
          event.f(parameter);
          eventCount--;
          if (eventCount === 0) clockHandler.stop();
        }, event.t - t);
        timeoutHandlers.push(timeoutHandler);
      };

      var nextElement;

      while(1) {
        if (array.length > 0) {
          nextElement = array[0];
          if (callingCriteria(nextElement)) {
            schedule(nextElement);
            array.shift(); // remove first element
          } else {
            break;
          }
        } else {
          break;
        }
      }
    });

    return {
      stop: function(){
        for (var i=0; i<timeoutHandlers.length;i++){
          clearTimeout(timeoutHandlers[i]);
        };
        clockHandler.stop();
      }
    };
  };

  var push = eventsArray.push.bind(eventsArray);

  return {
    start: start,
    push: push
  };
};

MUSIC.Utils.FunctionSeq.preciseTimeout = function(fcn, ms) {
  var funseq;
  clock = MUSIC.Utils.Clock(
    window.performance.now.bind(window.performance),
    setInterval,
    clearInterval,
    500);
  funseq = MUSIC.Utils.FunctionSeq(clock, setTimeout, clearTimeout);

  var runningFunSeq;

  funseq.push({f: function() {
    if (runningFunSeq) {
      runningFunSeq.stop();
    }
    fcn();
  }, t: ms});
  runningFunSeq = funseq.start();
};


})();
(function() {
  MUSIC = MUSIC ||{};

  MUSIC.Types.register("function", function(wave) {
    if (typeof wave.at === "function") {
      return wave.at.bind(wave);
    }
  });

  MUSIC.Types.register("function", function(fcn) {
    if (typeof fcn === "function") {
      return fcn;
    }
  });

  MUSIC.Types.register("wave", function(fcn) {
    if (typeof fcn === "function") {
      return new MUSIC.Wave.FunctionWave(fcn);
    }
  });

  MUSIC.Types.register("wave", function(wave) {
    if (typeof wave.at === "function") {
      return wave;
    }
  });


  var twopi = Math.PI*2;
  MUSIC.Wave = {};

  var waveTransform = function(fcn) {
    return function() {
      var wave = this;
      return {
        at: function(t) {
          wave.at(fcn(t));
        }
      };
    }
  };
  var waveOps = {
    reverse: waveTransform(function(t){return t-1; }),
    scale: function(factor) {
      var wave = this;
      return new MUSIC.Wave.FunctionWave(function(t) {
        return wave.at(t*factor);
      }); 
    },
    translate: function(disp) {
      var wave = this;
      return new MUSIC.Wave.FunctionWave(function(t) {
        return wave.at(t+disp);
      });
    },
    table: function(options) {
      return new MUSIC.Wave.Table(this, options);
    },
    combine: function(otherWave, otherFactor) {
      var thisWave = this;
      otherFactor = otherFactor || 0.5;
      var thisFactor = 1-otherFactor;
      otherWave = MUSIC.Types.cast("wave", otherWave);
      return new MUSIC.Wave.FunctionWave(function(t) {
        return otherWave.at(t) * otherFactor + thisWave.at(t) * thisFactor;
      });
    }
  };

  var defaultInterpolation = function(table){
    var length = table.length;
    return function(t) {
      var index = Math.floor(t*table.length)
      return table[index];
    };
  };

  MUSIC.Wave.Table = function(wave, options) {
    options = options || {};
    var sampleCount = options.samples || 100;
    var interpolation = options.interpolation || defaultInterpolation;

    var sample = [];
    for (var i=0; i<sampleCount; i++) {
      sample[i] = wave.at(i/sampleCount);
    }

    this.at = interpolation(sample);
  };
  MUSIC.Wave.Table.prototype = waveOps;

  MUSIC.Wave.FunctionWave = function(fcn) {
    this.at = fcn;
  };
  MUSIC.Wave.FunctionWave.prototype = waveOps;


  MUSIC.Wave.sine = function() {
    return new MUSIC.Wave.FunctionWave(function(t) {
      return Math.sin(twopi*t);
    });
  };

  MUSIC.Wave.square = function(options) {
    options = options || {};
    var dutyCycle = options.dutyCycle || 0.5;
    var dutyLevel = options.dutyLevel || 1;
    var offLevel = options.offLevel || -1;
    return new MUSIC.Wave.FunctionWave(function(t) {
      if (t<dutyCycle){
        return dutyLevel
      } else {
        return offLevel;
      }
    });
  };

  MUSIC.Wave.triangle = function() {
    return new MUSIC.Wave.FunctionWave(function(t) {
      var t2 = t-0.25;
      if (t2<0) t2++;
      if (t2<0.5) {
        return 1-t2*4;
      } else {
        return -1+(t2-0.5)*4;
      }
    });
  };

  MUSIC.Wave.sawtooth = function() {
    return new MUSIC.Wave.FunctionWave(function(t) {
      return t*2-1;
    });
  };

})();

