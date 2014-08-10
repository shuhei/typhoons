function initCanvas(canvas, startYear, typhoonsByYear, projection) {
  var width = parseInt(canvas.width, 10);
  var height = parseInt(canvas.height, 10);

  new Processing(canvas, createSketchProc());

  function projectPosition(position) {
    return projection([position.lon, position.lat]);
  }

  function shouldShow(time, typhoon) {
    return time >= typhoon.startTime && typhoon.endTime >= time;
  }

  function findNext(time) {
    var date = new Date(time);
    var year = date.getFullYear();
    var typhoons = typhoonsByYear[year];

    if (typhoons == null) {
      return null;
    }

    // If there are typhoons to show now, do not jump.
    var typhoonsToShow = typhoons.filter(function (typhoon) {
      return shouldShow(time, typhoon);
    });

    if (typhoonsToShow.length > 0) {
      return time;
    }

    // Jump to the start time of the next typhoon.
    var upcomingTime = typhoons.reduce(function (min, typhoon) {
      if (time < typhoon.startTime && typhoon.startTime < min) {
        return typhoon.startTime;
      } else {
        return min;
      }
    }, Number.MAX_VALUE);

    if (upcomingTime !== Number.MAX_VALUE) {
      return upcomingTime;
    }

    // Try next year.
    return findNext(new Date(year + 1, 0, 1).getTime());
  }

  function createSketchProc() {
    return (function (p5) {
      // Draw typhoons.
      var typhoons = typhoonsByYear[startYear];
      var now = new Date().getTime();
      var clock = new Date(startYear, 6 - 1, 1).getTime();

      p5.setup = function () {
        p5.size(width, height);
      }

      p5.draw = function () {
        p5.background(0, 0);

        // Update current time.
        clock = findNext(clock);
        if (!clock || clock >= now) {
          p5.noLoop();
          return;
        }

        // Update the clock.
        var currentTime = new Date(clock);
        var timeChangeEvent = new CustomEvent('timeChange', { detail: currentTime });
        canvas.dispatchEvent(timeChangeEvent);

        // Draw typhoons.
        typhoonsByYear[currentTime.getFullYear()].forEach(function (typhoon) {
          if (!shouldShow(clock, typhoon)) {
            return;
          }

          // Draw circles.
          p5.noStroke();
          typhoon.position.forEach(function (position) {
            if (position.time > clock) {
              return;
            }

            var pos = projectPosition(position);
            var r = 10 + (position.maxwind || 0) * 2;
            var alpha = Math.max(50 - 0.5 * (clock - position.time) / 1000 / 60 / 60,  0);
            p5.fill(0, 0, 0, alpha);
            p5.ellipse(pos[0], pos[1], r, r);
          });

          // Draw paths.
          p5.strokeWeight(0.5);
          p5.noFill;
          var before = projectPosition(typhoon.position[0]);
          typhoon.position.forEach(function (position) {
            if (position.time > clock) {
              return;
            }

            var pos = projectPosition(position);
            var alpha = Math.max(100 - 0.1 * (clock - position.time) / 1000 / 60 / 60,  0);
            p5.stroke(255, 0, 80, alpha);
            p5.line(before[0], before[1], pos[0], pos[1]);
            before = pos;
          });
        });

        clock += 60 * 60 * 1000 * 1.5;
      };
    });
  }
}

module.exports = initCanvas;
