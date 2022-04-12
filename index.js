const session = require('express-session');
const engine = require('ejs-mate');
const passport = require('passport');
const path = require('path');
const flash = require('connect-flash');


//Express Server
const express = require('express');
const app = express();

//DB Connection
const { mongoose } = require('./config/database.js');

//Middlewares
require('./app/passport/local-auth.js')(passport);
app.set('views', path.join(__dirname, 'views'));
app.engine('ejs', engine);
app.set('view engine', 'ejs');

app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb', extended: false}));
app.use(session({
	secret: 'secretoken',
	resave: false,
	saveUninitialized: false
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

//Local Session
app.use( async (req, res, next) =>{
	res.locals.errorMessage = req.flash('errorMessage');
	res.locals.successMessage = req.flash('successMessage');
	app.locals.user = req.user;
	next();
});

//Routes
require('./app/routes.js')(app, passport);

app.use(express.static(path.join(__dirname, 'public')));

//Port Config okey test2 2 AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
app.set('port', process.env.PORT || 3000);

//Server Start Listening
app.listen(app.get('port'), () => {
	console.log('Server on port', app.get('port'));
});
