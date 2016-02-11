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