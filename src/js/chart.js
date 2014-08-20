var EventEmitter = require('events').EventEmitter;

function initChart(startYear, typhoonsByYear) {
  var ee = new EventEmitter();
  ee.updateCurrentTime = updateCurrentTime;

  var CHART_WIDTH = 500;
  var CHART_HEIGHT = 800;
  var LABEL_WIDTH = 50;

  var ITEM_HEIGHT = 10;
  var ROW_MARGIN = 20;

  var svg = d3.select('body').append('svg')
    .attr('id', 'chart-svg')
    .attr('width', CHART_WIDTH + LABEL_WIDTH)
    .attr('height', CHART_HEIGHT);

  function typhoonsToShow() {
    var typhoons = Object.keys(typhoonsByYear).filter(function(year) {
      return year >= startYear;
    });
    return typhoons.map(function(year) {
      return typhoonsByYear[year];
    });
  }

  var yearInMillis = 365 * 24 * 60 * 60 * 1000;
  var timeScale = d3.scale.linear()
    .domain([0, yearInMillis])
    .range([0, CHART_WIDTH]);

  var typhoons = typhoonsToShow();

  var groupTransform = d3.svg.transform()
    .translate(function(d, i) { return [LABEL_WIDTH, ITEM_HEIGHT + i * (ITEM_HEIGHT + ROW_MARGIN)]; });

  var bars = svg.selectAll('g.bar')
    .data(typhoons)
  .enter().append('g')
    .attr('class', 'bar')
    .attr('transform', groupTransform);

  var lineFunc = d3.svg.line()
    .x(function(d) { return d.x; })
    .y(function(d) { return d.y; })
    .interpolate('linear');

  bars.append('text')
    .attr('class', 'bar-title')
    .attr('x', -8)
    .attr('y', 9)
    .text(function(d) { return d[0].year; });

  bars.append('path')
    .attr('class', 'bar-base')
    .attr('d', lineFunc([{ x: 0, y: ITEM_HEIGHT / 2 }, { x: CHART_WIDTH, y: ITEM_HEIGHT / 2 }]));

  bars.selectAll('rect.bar-typhoon')
    .data(function(d) { return d; })
  .enter().append('rect')
    .attr('class', 'bar-typhoon')
    .attr('width', function(d) { return timeScale(d.endTime - d.startTime); })
    .attr('height', ITEM_HEIGHT)
    .attr('x', function(d) { return timeScale(d.startTime - new Date(d.year, 0, 1)); })
    .on('click', function(d) { ee.emit('timeSelected', new Date(d.startTime)); });

  var current = svg.append('rect')
    .datum(new Date(startYear, 0, 1))
    .attr('class', 'chart-current')
    .attr('width', 1)
    .attr('height', ITEM_HEIGHT * 2)
    .call(positionCurrent);

  function positionCurrent(current) {
    current
      .attr('x', function(d) { return LABEL_WIDTH + timeScale(d - new Date(d.getFullYear(), 0, 1)); })
      .attr('y', function(d) { return (d.getFullYear() - startYear) * (ITEM_HEIGHT + ROW_MARGIN) + ITEM_HEIGHT / 2; });
  }

  function updateCurrentTime(currentTime) {
    current.datum(currentTime).call(positionCurrent);
  }

  return ee;
}

module.exports = initChart;
