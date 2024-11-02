const mongoose = require("mongoose")

const scorePlayer = mongoose.Schema({
    namePlayer: String,
    score: Number,
    cheater: Boolean,
    date: { type: Date, default: Date.now }
})

module.exports = mongoose.model('Score', scorePlayer);