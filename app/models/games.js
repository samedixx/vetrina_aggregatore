const mongoose = require('mongoose');
const { Schema } = mongoose;

const GamesSchema = new Schema({
        name: { type: String, lowercase: true },
        image: { type: String},
        provider: {type: String},
        demo: { type: String},
        registerDate: { type: Date, default: Date.now}
});

module.exports = mongoose.model('Games', GamesSchema);
