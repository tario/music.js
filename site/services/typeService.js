var musicShowCaseApp = angular.module("MusicShowCaseApp");

var ObjectCache = function() {
  var wm = new WeakMap();
  this.get = function(music, object) {
    var array = wm.get(music);
    var strobj = JSON.stringify(object);

    if (!array) return undefined;

    var elem = array.filter(function(x) {
      return x.obj === strobj;
    })[0];

    return elem && elem.value;
  };

  this.set = function(music, object, value) {
    var array = wm.get(music);
    var strobj = JSON.stringify(object);

    if (!array) {
      array = [];
    }

    var elem = array.filter(function(x) {
      return x.obj === strobj;
    })[0];

    if (elem) {
      elem.value = value;
    } else {
      array.push({obj: strobj, value: value});
    }

    if (array.length > 8) array = array.slice(1);

    wm.set(music, array);
  };
};

musicShowCaseApp.service("TypeService", ["$http", "$q", function($http, $q) {
  var make_mutable = function(fcn, options) {
    var cacheData = new ObjectCache();

    var cacheWrap = function(object, baseMusic) {
      var originalPrune = baseMusic.prune;
      baseMusic.prune = function() {
        cacheData = new ObjectCache();

        if (originalPrune) {
          return originalPrune.apply(this, arguments);
        }
      };

      return function(constructor) {
        return function(music, params){
          var key = baseMusic;
          if (key.getOriginal) key = key.getOriginal();
          cacheData.set(key, object, music)

          return constructor(music, params);
        };
      };
    };

    return function(object, subobjects, components) {
      var current;
      var instances = [];

      if (options && options.reusableNode) {
        current = function(music, params) {
          var wrapped = subobjects[0];
          var constructor = fcn(object, subobjects.map(cacheWrap(object, music)), components); 
          var key = music;
          if (key.getOriginal) key = key.getOriginal();

          var newBase = cacheData.get(key, object);
          if (newBase) {
            return wrapped(newBase);
          } else {
            return constructor(music, params);
          }
        }
      } else {
        current = fcn(object, subobjects, components);
      }

      if (current.update) {
        return current;
      }

      var ret = function(music, options) {
        var r;
        var wrapped = {};
        var lastCurrent = current;
        var proxy = function(name) {
          wrapped[name] = function() {
            if (lastCurrent != current) update();
            return r[name].apply(r, arguments);
          };
        };

        var update = function() {
            var newr = current(music, options);
            if (newr !== r && r && r.dispose) r.dispose();
            r = newr;

            instances.push(newr);

            lastCurrent = current;
            for (var k in r) proxy(k);
        };

        update();

        return wrapped;
      };

      var lastObjData;
      ret.update = function(newobject, _components) {
        components = _components
        if (JSON.stringify(newobject) === lastObjData) return ret;
        lastObjData = JSON.stringify(newobject);

        instances.forEach(function(instance) {
          if(instance.dispose) instance.dispose();
        });
        instances = [];

        current = fcn(newobject, subobjects, components);
        return ret;
      };

      return ret;
    };
  };


  var plugins = ["core"];
  var types = [];
  var translation = {};
  var m = function(pluginName) {
    return {
      lang: function(key, translateData) {
        translation[key] =translation[key]||{};
        translation[key][pluginName] = translateData;
      },
      type: function(typeName, options, constructor) {
        types.push({
          templateUrl: "site/plugin/" + pluginName + "/" + options.template + ".html",
          parameters: options.parameters,
          constructor: make_mutable(constructor, {reusableNode: options.reusableNode}),
          name: typeName,
          composition: options.composition,
          components: options.components,
          description: options.description,
          _default: options._default,
          subobjects: options.subobjects,
          stackAppend: options.stackAppend,
          monitor: options.monitor
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

  var getTypes = function(keyword) {
      var hasKeyword = function() {
        return true;
      };

      if (keyword) {
        keyword = keyword.toLowerCase();
        hasKeyword = function(x) {
          return x.name.toLowerCase().indexOf(keyword) !== -1;
        };
      }

      return pluginsLoaded.then(function() {
        return types.filter(hasKeyword);
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

  var loadTranslations = function(options) {
    return pluginsLoaded
      .then(function() {
        return translation[options.key]||{};
      });
  };

  return {
    getTypes: getTypes,
    getType: getType,
    loadTranslations: loadTranslations
  };

}]);

