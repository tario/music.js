window.SerializerOracle = window.SerializerOracle || {};

(function() {

window.SerializerOracle.HuffmanPackedJSON = function(innerSerializer) {
  var frequencies = [
    [",", 100],
    ["[]", 20],
    ["0123456789", 10],
    ["abcdef.-{}", 4],
    ["t+-*/()<>=? ", 1]
  ];

  var times = function(str, n) {
    var ret = "";
    for (var i =0;i<n; i++) ret = ret + str;
    return ret;
  };

  var concat = function(a, b){ return a.concat(b); };
  var text = frequencies.map(function(freq) {
    return times(freq[0], freq[1]);
  }).reduce(concat);

  text = text + "!\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~"
  var huffman = Huffman.treeFromText(text);

  var serialize = function(type, obj) {
    var str = innerSerializer.serialize(type, obj);
    return huffman.encode(str);
  };

  return {
    serialize: serialize
  };
};

})();
