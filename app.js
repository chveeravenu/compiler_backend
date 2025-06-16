var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const CompilerRouter = require('./Routers/CompilerRouter')
const cors = require('cors');
const BodyParser = require('body-parser');

const mongoose = require('mongoose')

var app = express();

app.use(cors());
app.use(BodyParser.json());


mongoose.connect("mongodb+srv://chitturiveeravenu:Qf3mblbGdSF3Gigm@cluster0.ncmnrdq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
.then(resultl =>{
  console.log("connected successfully with mongodb")
})
.catch(err => {
  console.log(err)
})


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');


app.use("/",CompilerRouter);


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.listen(4000,function(){
  console.log("server started at port 6000")
})

// app.use('/', indexRouter);
// app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
