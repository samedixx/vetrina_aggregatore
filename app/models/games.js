const mongoose = require('mongoose');
const { Schema } = mongoose;

const GamesSchema = new Schema({
        GAME_NAME: {type: String},
        PV_CODE: { type: String},
        CODE_TO_OPEN_GAME: {type: String},
        GAME_GROUP: { type: String},
        IS_MOBILE: {type: String},
        IMG_PATH: { type: String},
        registerDate: { type: Date, default: Date.now}
});

module.exports = mongoose.model('Games', GamesSchema);
