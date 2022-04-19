module.exports = (app, passport) => {
	//Database models and strategies
	const User = require('./models/user');
	const Games = require('./models/games');
	//const fs = require('fs');
	


	//Routes without session
	app.get('/', async (req, res, next) => {
		let gamelist = await Games.find({});
		res.render('index', { 
			title: "Home",
			user: req.user,
			gamelist : gamelist
		});
	});

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


	//Routes with session
	app.get('/profile', isAuthenticated, (req, res, next) => {
		res.render('profile', { 
			title: "Profile",
			user: req.user
		});
	});

	app.get('/backend', isAdmin, async (req, res, next) => {

		let gamelist = await Games.find({});
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

	app.post('/addgame', isAdmin, async (req, res) => {
		var name = req.body.game_name;
		var image = req.body.image;
		var provider = req.body.provider; 
		var demo = req.body.demo;
		if(name !== 'undefined' && name !== undefined){
			await updateGameFromList(name, image, provider, demo);
			req.flash('successMessage', 'Game added successfully')
			res.redirect('/backend');
		}
	});

	app.post('/deleteGame', isAdmin, async (req, res) => {
		var id = req.body.gameid;
		if(id.length >= 2){
			await deleteGamefromlist(id);
			req.flash('successMessage', 'Game deleted')
			res.redirect('/backend');
		}
	});

	app.post('/editgame', isAdmin, async (req, res) => {
		var id = req.body.gameEditid;
		var name = req.body.game_name;
		var image = req.body.image;
		var provider = req.body.provider; 
		var demo = req.body.demo;
		console.log(req.body);
		if(id.length >= 2){
			await updateSingleGamefromlist(id, name, image, provider, demo);
			req.flash('successMessage', 'Game updated')
			res.redirect('/backend');
		}
	});

	app.post('/deleteUser', isAdmin, async (req, res) => {
		var id = req.body.userid;
		if(id.length >= 2){
			await deleteUserfromlist(id);
			req.flash('successMessage', 'User removed')
			res.redirect('/backend');
		}
	});

	/*app.post('/updategames', isAdmin, async (req, res) => {
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
	});*/

	//Add Game to list db
	async function updateGameFromList(name, image, provider, demo){
		Games.findOne({'name': name}, async function (err, game){
			if(err){console.log(err)}
			if(!game){
				let newGame = new Games();
				newGame.name = name;
				newGame.image = image;
				newGame.provider = provider.toLowerCase().replace(/\s/g, '');
				newGame.demo = demo;
				await newGame.save(function (err){
					if (err){console.log(err);throw err;}
				});
			}else{
				console.log("Game allready in");
			}
		});
	}

	//Remove Game from list db
	async function deleteGamefromlist(id){
		Games.findByIdAndDelete(id, function (err, game){
			if(err){
				console.log(err)
			}else{
				console.log("Game Deleted: ", game);
			}
		});
	}


	//Update Game from list db
	async function updateSingleGamefromlist(id, name, image, provider, demo){
		Games.findByIdAndUpdate(id, { name: name, image:image, provider:provider, demo:demo }, function (err, game) {
			if (err){
				console.log(err)
			}
			else{
				console.log("Game Updated: ", game);
			}
		});
	}

	//Remove User from list db
	async function deleteUserfromlist(id){
		User.findByIdAndDelete(id, function (err, user){
			if(err){
				console.log(err)
			}else{
				console.log("User Deleted: ", user);
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