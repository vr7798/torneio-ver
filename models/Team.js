// models/Team.js
const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
    nome: { type: String, required: true },
    telefone: { type: String }
});

const teamSchema = new mongoose.Schema({
    nome: { type: String, required: true },
    animalName: { type: String, required: true, unique: true },
    membros: {
        type: [memberSchema],
        validate: [arrayLimit, '{PATH} deve ter exatamente 5 membros']
    },
    dataCadastro: { type: Date, default: Date.now }
});

function arrayLimit(val) {
    return val.length === 5;
}

module.exports = mongoose.model('Team', teamSchema);
