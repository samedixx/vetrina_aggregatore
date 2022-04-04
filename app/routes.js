module.exports = (app, passport) => {
	//Database models and strategies
	const User = require('./models/user');
	const Games = require('./models/games');


	const fs = require('fs');

	//Routes without session
	app.get('/', (req, res, next) => {
		let rawdata = fs.readFileSync('./public/game_list.json');
		let gamelist = JSON.parse(rawdata);

		res.render('index', { 
			title: "Home",
			errorMessage: req.flash('errorMessage'),
			successMessage: req.flash('successMessage'),
			
			user: req.user,
			gamelist : gamelist
		});
	});

	//Routes with session
	app.get('/profile', isAuthenticated, (req, res, next) => {
		res.render('profile', { 
			title: "Profile",
			errorMessage: req.flash('errorMessage'),
			successMessage: req.flash('successMessage'),
			user: req.user
		});
	});

	app.get('/backend', isAdmin, async (req, res, next) => {
		var totalGames = await Games.count({});
		res.render('backend.ejs', { 
			title: "Admin Panel",
			errorMessage: req.flash('errorMessage'),
			successMessage: req.flash('successMessage'),
			user: req.user,
			totalgames: totalGames
		});
	});

	app.get('/logout', isAuthenticated, (req, res) =>{
		req.logout();
		res.redirect('/');
	});


	//Post without session
	app.post('/login', passport.authenticate('local-login', {
		successRedirect: '/',
		failureRedirect: '/',
		failureFlash: true
	}));


	app.post('/register', isAdmin, passport.authenticate('local-register', {
		successRedirect: '/',
		failureRedirect: '/',
		failureFlash: true
	}));

	app.post('/addgame', isAdmin, (req, res) => {
		var isError = 0;
		if(req.body.game_name.length >= 2){
			if(req.body.image.length >= 2){
				if(req.body.provider.length >= 2){
					if(req.body.demo.length >= 2){
						Games.findOne({'name': req.body.name}, async function (err, game){
							if(err){
								console.log(err);
								req.flash('errorMessage', 'Ops something went wrong: ' + err);
								res.redirect("/backend");
							} 
							if(game){
								req.flash('errorMessage', 'The game it\'s already added to the list');
								res.redirect("/backend");
							}else{
								var newGame = new Games();
								newGame.name = req.body.name;
								newGame.image = req.body.image;
								newGame.provider = req.body.provider;
								newGame.demo = req.body.demo;
						
								console.log(newGame);

								res.flash(newGame);




								
								
								var savedGame = await newGame.save();
								if(savedGame){
									req.flash('successMessage', 'Game successfully added');
									res.redirect('/backend');
								}else{
									req.flash('errorMessage', 'Something went wrong, try again later');
									console.log("Erro on save");
									res.redirect("/");
								}
							}
						});
					}else{
						isError = 1;
					}
				}else{
					isError = 1;
				}
			}else{
				isError = 1;
			}
		}else{
			isError = 1;
		}

		if(isError === 1){
			console.log("Last Error");
			req.flash('errorMessage', 'Make sure you completed all the fields');
			res.redirect("/backend");
		}
	});


	//Session checks
	function isAuthenticated(req, res, next){
		if(req.isAuthenticated()){
			return next();
		}
		res.redirect('/');
	};

	function isNotAuthenticated(req, res, next){
		if(!req.isAuthenticated()){
			return next();
		}
		res.redirect('/profile');
	};

	function isAdmin(req, res, next){
		if(req.user){
			if(req.user.usertype === "admin"){
				return next();
			}
		}
		res.redirect('/profile');
	}
}