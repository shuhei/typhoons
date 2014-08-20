var EventEmitter = require('events').EventEmitter;
var util = require('util');

function Clock(time, typhoonsByYear) {
  this.typhoonsByYear = typhoonsByYear;
  this.time = time;
  this.frameRate = 60;
}

util.inherits(Clock, EventEmitter);

Clock.prototype.start = function() {
  this.intervalID = setInterval(this.tick.bind(this), 1000 / this.frameRate);
};

Clock.prototype.stop = function() {
  if (this.intervalID) {
    clearInterval(this.intervalID);
  }
};

Clock.prototype.tick = function() {
  var timestamp = this.time.getTime() + 60 * 60 * 1000 * 1.5;
  var nextTime = this._findNext(timestamp);

  if (!nextTime) {
    return;
  }

  this.update(nextTime);
};

Clock.prototype.update = function(time) {
  this.time = new Date(time);
  this.emit('change', this.time);
};

Clock.prototype._findNext = function(time) {
  var self = this;
  var date = new Date(time);
  var year = date.getFullYear();
  var typhoons = this.typhoonsByYear[year];

  if (!typhoons) {
    return null;
  }

  // If there are typhoons to show now, do not jump.
  var typhoonsToShow = typhoons.filter(function (typhoon) {
    return time >= typhoon.startTime && typhoon.endTime >= time;
  }, this);

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
  return this._findNext(new Date(year + 1, 0, 1).getTime());
};

module.exports = Clock;
