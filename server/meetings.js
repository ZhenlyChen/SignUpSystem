const db = require('./mongo.js');
const verify = require('./sdk/verify.js');
const fs = require('fs'); //文件处理
var iconv = require('iconv-lite');
var schedule = require("node-schedule");
const spawn = require('child_process').spawn; //异步子进程模块

var meetingSchema = db.mb.Schema({
  name: String,
  email: String,
  endDate: Date,
  startDate: String,
  text: String,
  peoples: [{
    name: String,
    phone: Number,
    text: String,
  }],
}, { collection: 'meetings' });
var meetingDB = db.mb.model('meetings', meetingSchema);

var ipSchema = db.mb.Schema({
  ip: String,
  counts: Number,
  time: Date,
}, ({ collection: 'ip' }));
var ipDB = db.mb.model('ip', ipSchema);

schedule.scheduleJob('30 30 * * * *', function() {
  meetingDB.find({}, (err, data) => {
    var now = (new Date()).getTime();
    for (var i in data) {
      if (now > data[i].endDate.getTime() && now - data[i].endDate.getTime() < 4000000) {
        var myId = data[i]._id;
        var myName = data[i].name;
        var myEmail = data[i].email;
        var myDate = data[i].endDate;
        var mailText = myName + '活动已经在' + myDate + '截止报名了，活动报名详情请进入管理系统后台查看';
        fs.writeFile('mail.html', mailText, (err) => {
          makeAFile(myId, () => {
            spawn('./sendMail.sh', [myEmail, '[' + myName + ']活动报名名单', 'file/' + myId + '.csv']);
            console.log('OK: send a Email.');
          });
        });
      }
    }
  });
});


exports.getList = (req, res, next) => {
  meetingDB.find({}, (err, data) => {
    var activeList = [];
    for (var val in data) {
      activeList.push({
        id: data[val]._id,
        name: data[val].name,
        email: data[val].email,
        endDate: data[val].endDate,
        startDate: data[val].startDate,
        text: data[val].text,
        actors: data[val].peoples === undefined ? 0 : data[val].peoples.length,
      });
    }
    res.send({ state: 'ok', meetings: activeList });
  });
};

exports.getPeople = (req, res, next) => {
  meetingDB.findOne({ _id: req.body.id }, (err, val) => {
    if (val) {
      res.send({ state: 'ok', peoples: val.peoples });
    } else {
      res.send({ state: 'failed', reason: 'NO_ID' });
    }
  });
};
exports.checkClass = (req, res, next) => {
  if (verify.getUserData(res).class == 1) {
    next();
  } else {
    res.send({ state: 'failed', reason: 'NO_CLASS' });
    next('route');
  }
};

exports.addActive = (req, res, next) => {
  db.insertDate(meetingDB, {
    name: req.body.name,
    email: req.body.email,
    endDate: req.body.endDate,
    startDate: req.body.startDate,
    text: req.body.text,
    peoples: [],
  }, () => {
    res.send({ state: 'ok' });
  });
};

exports.checkIp = (req, res, next) => {
  ipDB.findOne({ ip: req.header('x-forwarded-for') }, (err, val) => {
    var now = new Date();
    if (val) {
      if (now - val.time.getTime() < 360000) {
        val.counts++;
        val.save(() => {});
        if (val.counts > 4) {
          res.send({ state: 'failed', reason: 'IP_LIMIT' });
          next('route');
        } else {
          next();
        }
      } else {
        val.counts = 1;
        val.time = now;
        val.save(() => {});
        next();
      }
    } else {
      db.insertDate(ipDB, {
        ip: req.header('x-forwarded-for'),
        counts: 1,
        time: new Date(),
      }, () => {
        next();
      });
    }
  });
};

exports.postMan = (req, res, next) => {
  meetingDB.findById(req.body.id, (err, val) => {
    if (val) {
      val.peoples.push({
        name: req.body.name,
        phone: req.body.phone,
        text: req.body.text,
      });
      val.save(() => {});
      res.send({ state: 'ok' });
    } else {
      res.send({ state: 'failed', reason: 'NO_ID' });
    }
  });
};


exports.deleteActive = (req, res, next) => {
  meetingDB.remove({ _id: req.body.id }, (err) => {
    if (err) {
      res.send({ state: 'failed', reason: 'NO_ID' });
    } else {
      res.send({ state: 'ok' });
    }
  });
};

exports.editActive = (req, res, next) => {
  meetingDB.findById(req.body.id, (err, val) => {
    if (val) {
      val.name = req.body.name;
      val.startDate = req.body.startDate;
      val.text = req.body.text;
      val.email = req.body.email;
      val.endDate = req.body.endDate;
      val.save(() => {});
      res.send({ state: 'ok' });
    } else {
      res.send({ state: 'failed', reason: 'NO_ID' });
    }
  });
};

exports.editMan = (req, res, next) => {
  meetingDB.findById(req.body.id, (err, val) => {
    if (val) {
      val.peoples = req.body.peoples;
      val.save(() => {});
      res.send({ state: 'ok' });
    } else {
      res.send({ state: 'failed', reason: 'NO_ID' });
    }
  });
};


exports.downloadTable = (req, res, next) => {
  makeAFile(req.body.id, () => {
    res.send({ state: 'ok', fileName: req.body.id + '.csv' });
  });
};

function makeAFile(id, callback) {
  meetingDB.findById(id, (err, val) => {
    if (val) {
      var data = '"姓名","联系电话","' + val.text + '"\n';
      for (var i = 0; i < val.peoples.length; i++) {
        data += '"' + val.peoples[i].name + '","' + val.peoples[i].phone + '","' + val.peoples[i].text + '"\n';
      }
      var csv = iconv.encode(data, 'GBK'); // 转编码
      fs.writeFile('file/' + id + '.csv', csv, (err) => {
        callback();
      });
    } else {
      res.send({ state: 'failed', reason: 'NO_ID' });
    }
  });
}