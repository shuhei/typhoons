require('processing-js');

function initCanvas(canvas, typhoonsByYear, projection) {
  var width = parseInt(canvas.width, 10);
  var height = parseInt(canvas.height, 10);

  var p5 = new Processing(canvas, createSketchProc());

  return {
    updateCurrentTime: update
  };

  function projectPosition(position) {
    return projection([position.lon, position.lat]);
  }

  function createSketchProc() {
    return (function (p5) {
      p5.setup = function () {
        p5.size(width, height);
        p5.background(0, 0);
        p5.noLoop();
      };
    });
  }

  // Update the canvas.
  function update(currentTime) {
    p5.background(0, 0);

    var timestamp = currentTime.getTime();
    var timeChangeEvent = new CustomEvent('timeChange', { detail: currentTime });
    canvas.dispatchEvent(timeChangeEvent);

    // Draw typhoons.
    typhoonsByYear[currentTime.getFullYear()].forEach(function (typhoon) {
      if (timestamp < typhoon.startTime || typhoon.endTime < timestamp) {
        return;
      }

      // Draw circles.
      p5.noStroke();
      typhoon.position.forEach(function (position) {
        if (position.time > timestamp) {
          return;
        }

        var pos = projectPosition(position);
        var r = 10 + (position.maxwind || 0) * 2;
        var alpha = Math.max(50 - 0.5 * (timestamp - position.time) / 1000 / 60 / 60,  0);
        p5.fill(0, 0, 0, alpha);
        p5.ellipse(pos[0], pos[1], r, r);
      });

      // Draw paths.
      p5.strokeWeight(0.5);
      p5.noFill;
      var before = projectPosition(typhoon.position[0]);
      typhoon.position.forEach(function (position) {
        if (position.time > timestamp) {
          return;
        }

        var pos = projectPosition(position);
        var alpha = Math.max(100 - 0.1 * (timestamp - position.time) / 1000 / 60 / 60,  0);
        p5.stroke(255, 0, 80, alpha);
        p5.line(before[0], before[1], pos[0], pos[1]);
        before = pos;
      });
    });
  };
}

module.exports = initCanvas;
