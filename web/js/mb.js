//日期格式化
Date.prototype.Format = function(fmt) {
  var o = {
    'M+': this.getMonth() + 1, //月份
    'd+': this.getDate(), //日
    'h+': this.getHours(), //小时
    'm+': this.getMinutes(), //分
    's+': this.getSeconds(), //秒
    'q+': Math.floor((this.getMonth() + 3) / 3), //季度
    'S': this.getMilliseconds() //毫秒
  };
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(
      RegExp.$1, (this.getFullYear() + '').substr(4 - RegExp.$1.length));
  }
  for (var k in o) {
    if (new RegExp('(' + k + ')').test(fmt)) {
      fmt = fmt.replace(
        RegExp.$1,
        (RegExp.$1.length == 1) ? (o[k]) :
        (('00' + o[k]).substr(('' + o[k]).length)));
    }
  }
  return fmt;
};

function comptime(beginTime, endTime) {
  var beginTimes = beginTime.substring(0, 10).split('-');
  var endTimes = endTime.substring(0, 10).split('-');
  beginTime = beginTimes[1] + '-' + beginTimes[2] + '-' + beginTimes[0] + ' ' +
    beginTime.substring(10, 19);
  endTime = endTimes[1] + '-' + endTimes[2] + '-' + endTimes[0] + ' ' +
    endTime.substring(10, 19);
  var a = (Date.parse(endTime) - Date.parse(beginTime)) / 3600 / 1000;
  return a;
} //进行时间比较
//---------------------------------------------------------------------
function getCookie(name) {
  var arr, reg = new RegExp('(^| )' + name + '=([^;]*)(;|$)');
  return (arr = document.cookie.match(reg)) ? unescape(arr[2]) : null;
} //获取cookie

function getQueryString(name) {
  var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
  var r = window.location.search.substr(1).match(reg);
  return r !== null ? unescape(r[2]) : null;
} //获取get参数

function sendNotice(str) {
  $('#Alert_').alert('close');
  $('#notice').html('<div id="Alert_" class="alert alert-warning fade in"><a href="#" class="close" data-dismiss="alert">&times;</a><div id="sendToAlert">' + str + '</div></div>');
  setTimeout(function() {
    $('#Alert_').alert('close');
  }, 3000);
} //页面内通知

function sendNoticeIn(str) {
  $('#Alert_').alert('close');
  $('#notice2').html('<div id="Alert_" class="alert alert-warning fade in"><a href="#" class="close" data-dismiss="alert">&times;</a><div id="sendToAlert">' + str + '</div></div>');
  setTimeout(function() {
    $('#Alert_').alert('close');
  }, 3000);
} //模态框内通知

function regularTest(pattern, id, send) {
  if (!pattern.test(document.getElementById(id).value)) {
    sendNotice(send);
    $('#' + id).focus();
    $('#' + id).val('');
    return 0;
  } else {
    return 1;
  }
} //正则匹配

function isNullTest(id, send) {
  if (document.getElementById(id).value === '') {
    sendNotice(send);
    $('#' + id).focus();
    return 1;
  } else {
    return 0;
  }
} //非空检测

function lengthTest(id, min, max, send, qwq) {
  if (document.getElementById(id).value.length < min ||
    document.getElementById(id).value.length > max) {
    1 === qwq ? sendNotice2(send) : sendNotice(send); // qwq=1是模态框类通知
    $('#' + id).focus();
    return 0;
  } else {
    return 1;
  }
} //检测长度

function isEqualTest(id1, id2, send, qwq) {
  if (document.getElementById(id1).value !=
    document.getElementById(id2).value) {
    qwq === 1 ? sendNotice2(send) : sendNotice(send); // qwq=1是模态框类通知
    $('#' + id2).focus();
    return 0;
  } else {
    return 1;
  }
} //检测相等

function logout() {
  $.post('/api/logout', {}, (data) => {
    window.location.href = 'index.html';
  });
}

function sendNoticeAll(str) {
  $('#noticeDiv').html('<div id="noticeBox" class="float_div alert alert-warning alert-dismissable"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button><p> ' + str + '</p></div>');
  $('#noticeBox').fadeIn(300);
}