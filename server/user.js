const db = require('./mongo.js');
const verify = require('./sdk/verify.js');
var userSchema = db.mb.Schema({
  uid: Number,
  token: Number,
  name: String,
  email: String,
  class: Number,
}, { collection: 'users' });
var userDB = db.mb.model('users', userSchema);
exports.db = userDB;

exports.login = (req, res, next) => {
  verify.getUserInfo(req.body.code, (data) => {
    if (data.state == 'ok') {
      userDB.findOne({ uid: data.userData.uid }, (err, val) => { //更新用户信息
        res.locals.myData = data.userData;
        res.locals.userClass = 0;
        if (val) {
          val.name = data.userData.name;
          val.email = data.userData.email;
          res.locals.userClass = val.class;
          val.save(() => { next(); });
        } else {
          db.insertDate(userDB, {
            uid: data.userData.uid,
            token: 0,
            name: data.userData.name,
            email: data.userData.email,
            class: 0,
          }, () => {
            next();
          });
        }
      });
    } else {
      res.send(data); //登陆失败
    }
  });
};

exports.login_send = (req, res, next) => {
  verify.makeNewToken(req, res, res.locals.myData.uid, () => {
    res.send({
      state: 'ok',
      name: res.locals.myData.name,
      email: res.locals.myData.email,
      class: res.locals.userClass,
    });
  });
};