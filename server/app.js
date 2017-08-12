const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser'); // cookie模块
const verify = require('./sdk/verify.js');
const Meeting = require('./meetings.js');
const User = require('./user.js');
//const verify = require('./sdk/verify.js');

app.use(cookieParser()); // cookie模块
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const server = app.listen(30005, '127.0.0.1', function() {
  var host = server.address().address;
  var port = server.address().port;
  console.log('App listening at http://%s:%s', host, port);
});
//日志处理
app.use((req, res, next) => {
  var nowTime = new Date();
  console.log('Time:' + nowTime + '|| Form' + req.url + '||' + req.headers.referer);
  next();
});

app.get('/', (req, res) => {
  res.send('Hexo auxiliary system is running');
});


app.post('/getList', Meeting.getList);
app.post('/getAllList', verify.checkToken, Meeting.checkClass, Meeting.getAllList);
app.post('/addActive', verify.checkToken, Meeting.checkClass, Meeting.addActive);
app.post('/postMan', Meeting.postMan);

app.post('/login', User.login, User.login_send); //用户登录
app.post('/logout', verify.logout); //退出登陆