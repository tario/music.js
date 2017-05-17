musicShowCaseApp.directive("functionGraph", ["$timeout", "$parse", function($timeout, $parse) {
  return {
    scope: {},
    replace: true,
    template: '<canvas class="wavegraph"></canvas>',
    link: function(scope, element, attrs) {
      var f;
      scope.$parent.$watch(attrs.f, function(_f) {
        f = _f;
        if (f) redraw();
      });

      var redraw = function() {
        var canvas = element[0];
        var context = canvas.getContext('2d');

        canvas.width = canvas.clientWidth/4;
        canvas.height = canvas.clientHeight/4;

        var drawLine = function(x0, y0, x1, y1, color) {
          context.save();
          context.beginPath();
          context.moveTo(x0, y0);
          context.lineTo(x1, y1);
          context.strokeStyle = color;
          context.lineWidth = 1;
          context.stroke();
          context.restore(); 
        };

        var drawFunc = function(color) {
          context.save();
          context.save();
          context.translate(0,canvas.height/2);
          context.scale(canvas.width,canvas.height/2);

          context.moveTo(0, -f(0)*0.8);
          for (var i=1; i<=64; i++) {
            var t = i/64;
            context.lineTo(t, -f(t)*0.8);
          }
          context.restore();
          context.lineJoin = 'round';
          context.lineWidth = 1;
          context.strokeStyle = color;
          context.stroke();
          context.restore();
        };

        drawLine(0, canvas.height/2, canvas.width, canvas.height/2, 'aqua');
        drawFunc("#FFF");
      };
    }
  };
}]);

