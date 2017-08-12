const db = require('./mongo.js');
const verify = require('./sdk/verify.js');
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

exports.getAllList = (req, res, next) => {
  meetingDB.find({}, (err, data) => {
    res.send({ state: 'ok', meetings: data });
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

exports.postMan = (req, res, next) => {
  meetingDB.findOne({ _id: req.body.id }, (err, val) => {
    if (val === null) {
      res.send({ state: 'failed', reason: 'NO_ID' });
    } else {
      val.peoples.push({
        name: req.body.name,
        phone: req.body.phone,
        text: req.body.text,
      });
      val.save(() => {});
      res.send({ state: 'ok' });
    }
  });
};