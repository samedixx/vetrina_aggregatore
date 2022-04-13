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
			user: req.user,
			gamelist : gamelist
		});
	});

	//Routes with session
	app.get('/profile', isAuthenticated, (req, res, next) => {
		res.render('profile', { 
			title: "Profile",
			user: req.user
		});
	});

	app.get('/backend', isAdmin, async (req, res, next) => {

		let rawdata = fs.readFileSync('./public/game_list.json');
		let gamelist = JSON.parse(rawdata);
		var allUsers = await User.find({});
		res.render('backend.ejs', { 
			title: "Admin Panel",
			user: req.user,
			totalgames: gamelist,
			allUsers: allUsers
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

	app.post('/addgame', isAdmin, async (req, res) => {
		var name = req.body.game_name;
		var image = req.body.image;
		var provider = req.body.provider; 
		var demo = req.body.demo;

		await fs.readFile('./public/game_list.json', async function (err, data) {
			var json = JSON.parse(data);
			var isDouble = 0;
			for(var i = 0; i < json.games.length;i++){
				if(json.games[i].name === name){
					isDouble = 1;
				}
			};
			if(isDouble == 0) {		
				json.games.push({
					"name" : name,
					"image" : image,
					"provider" : provider.toLowerCase(),
					"demo" : demo
				});
				await fs.writeFile('./public/game_list.json', JSON.stringify(json), function(err, result){
					if(err){
						console.log(err)
					}
					console.log('writeFile ==> ', result);
					if(result){
						console.log('porco dios')
					}
					req.flash('successMessage', 'Game added successfully')
					res.redirect('/backend');
				});
			}
		});
	});

	app.post('/updategames', isAdmin, async (req, res) => {
		let doneUpdating = 0;
		await fs.readFile('./public/game_list.json', async function (err, data) {
			var json = JSON.parse(data);
			if(json.games.length >= 1){
				console.log(json.games.length);
				for(var i = 0;i < json.games.length;i++){
					console.log(json.games[i].name);
					if(json.games[i].name !== 'undefined' && json.games[i].name !== undefined){
						await updateGameFromList(json.games[i].name, json.games[i].image, json.games[i].provider, json.games[i].demo);
					}
				}
				console.log("All Games Updated");
				res.redirect('/backend');
				
			}
		});
	});

	//GameListUpdateGame
	async function updateGameFromList(name, image, provider, demo){
		Games.findOne({'name': name}, async function (err, game){
			if(err){console.log(err)}
			if(!game){
				let newGame = new Games();
				newGame.name = name;
				newGame.image = image;
				newGame.provider = provider;
				newGame.demo = demo;
				await newGame.save(function (err){
					if (err){console.log(err);throw err;}
				});
			}else{
				console.log("Game allready in");
			}
		});
	}

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