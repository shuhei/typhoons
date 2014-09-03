function pad(num) {
  return num < 10 ? '0' + num : num;
}

// Date to String 'YYYY-mm-dd HH:MM'.
function dateToStr(date) {
  var y = date.getFullYear();
  var m = date.getMonth() + 1;
  var d = date.getDate();
  var hours = date.getHours();
  return [y, pad(m), pad(d)].join('-') + ' ' + pad(hours) + ':00';
}

function strToTime(str) {
  // Date.parse does not work for 'yyyy-mm-dd HH:MM:SS' on Firefox.
  var components = str.split(' ');
  var dateFields = components[0].split('-');
  var timeFields = components[1].split(':');

  var year = parseInt(dateFields[0], 10);
  var month = parseInt(dateFields[1], 10);
  var day = parseInt(dateFields[2], 10);
  var hours = parseInt(timeFields[0], 10);
  var minutes = parseInt(timeFields[1], 10);
  var seconds = parseInt(timeFields[2], 10);

  return new Date(year, month - 1, day, hours, minutes, seconds).getTime();
}

module.exports = {
  dateToStr: dateToStr,
  strToTime: strToTime
};
