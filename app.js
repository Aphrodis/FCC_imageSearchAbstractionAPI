var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);

//listen to port 3000 (local)
/*
app.listen(3000);
console.log('You are listening to port 3000');
*/

//for heroku

app.listen(process.env.PORT, function() {
    console.log('Listening to default PORT')
});


module.exports = app;
