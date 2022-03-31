const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');
const { Schema } = mongoose;

const UserSchema = new Schema({
	email: String,
	username: { type: String, lowercase: true },
	password: String,
    usertype: String,
	registerDate: { type: Date, default: Date.now}
});

UserSchema.methods.generateHash = (password) => {
	return bcrypt.hashSync(password, bcrypt.genSaltSync(10));
};

UserSchema.methods.validatePassword = function (password) {
	return bcrypt.compareSync(password, this.password);
};

module.exports = mongoose.model('Users', UserSchema);
