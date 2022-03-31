//Filename database.js
const mongoose = require('mongoose');

const URI = 'mongodb://localhost/aggregatore';

mongoose.connect(URI,{useNewUrlParser: true,useUnifiedTopology: true})
	.then(db => console.log("okey connection database"))
	.catch(err => console.error(err));

module.exports = mongoose;

 