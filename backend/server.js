const express = require("express")
const mongoose = require("mongoose")
const path = require("path")
const app = express()
const Score = require('./Models/Score');
const port = 3000
const mongoUri = "mongodb://localhost:27017/testdb"
const cors = require('cors')

mongoose.connect(mongoUri)
    .then(() => {
        console.log('Conectado ao Banco!')
    })
    .catch(err => {
        console.error('Erro ao conectar: ', err)
    })

app.use(cors())
app.use(express.json())
app.post('/savingScore', async (req, res) => {
    const { name, score, cheater } = req.body;

    try {
        const existingScore = await Score.findOne({ namePlayer: name }).exec();

        if (existingScore) {
            return res.status(409).send({ error: 'Já existe este Nickname.' });
        }

        const newScore = new Score({ namePlayer: name, score: score, cheater: cheater });
        await newScore.save();
        res.status(201).send(newScore);
    } catch (error) {
        res.status(500).send({ error: 'Erro ao salvar a variável.' });
    }
});

app.use(express.static(path.join(__dirname, '../')))
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../', 'index.html'))
})

app.listen(3000, () =>
    console.log("Rodando")
)