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
  return Date.parse(str);
}

module.exports = {
  dateToStr: dateToStr,
  strToTime: strToTime
};
