var initChart = require('./chart');
var initCanvas = require('./canvas');
var utils = require('./utils');
var Clock = require('./clock');

function initMap(width, height, projection) {
  var svg = d3.select('body').append('svg')
    .attr('id', 'map-svg')
    .attr('width', width)
    .attr('height', height);

  // Draw map with SVG.
  var pathProjection = d3.geo.path().projection(projection);
  d3.json('./data/east-asia.json', function (error, asia) {
    svg.append('path')
      .datum(topojson.feature(asia, asia.objects.subunits))
      .attr('class', 'map-asia')
      .attr('d', pathProjection);
  });
}

function addApp(startYear, typhoonsByYear) {
  var width = 1080;
  var height = 800;
  var projection = d3.geo.mercator()
    .scale(700)
    .translate([480 - 1700, 400 + 350]);

  // Map
  initMap(width, height, projection);

  // Clock
  var clock = new Clock(new Date(startYear, 5, 1), typhoonsByYear);

  // Chart
  var chart = initChart(startYear, typhoonsByYear);

  // Canvas
  var canvasElement = document.createElement('canvas');
  canvasElement.className = 'p5-canvas';
  canvasElement.width = width;
  canvasElement.height = height;
  document.body.appendChild(canvasElement);

  var canvas = initCanvas(canvasElement, typhoonsByYear, projection);

  // Time display
  var timeDisplay = document.createElement('p');
  timeDisplay.className = 'time-display';
  document.body.appendChild(timeDisplay);

  // Update time display and chart.
  clock.on('change', function(time) {
    timeDisplay.innerText = utils.dateToStr(time);
    chart.updateCurrentTime(time);
    canvas.updateCurrentTime(time);
  });

  chart.on('timeSelected', function(time) {
    clock.update(time);
  });

  clock.start();
}

function prepareData(typhoons) {
  // Convert time from String to Date.
  // Add startTime and endTime to typhoons.
  typhoons.forEach(function (typhoon) {
    typhoon.position.forEach(function (pos) {
      pos.time = utils.strToTime(pos.date);
    });
    typhoon.startTime = typhoon.position[0].time;
    typhoon.endTime = typhoon.position[typhoon.position.length - 1].time;
  });

  // Create an Object with year as key and Array of typhoon Objects as value.
  var typhoonsByYear = typhoons.reduce(function (acc, typhoon) {
    acc[typhoon.year] = acc[typhoon.year] || [];
    acc[typhoon.year].push(typhoon);
    return acc;
  }, {});

  return typhoonsByYear;
}

d3.json('/data/typhoons.json', function(typhoons) {
  var typhoonsByYear = prepareData(typhoons);
  addApp(2000, typhoonsByYear);
});
