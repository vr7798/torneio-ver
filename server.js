// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const Team = require('./models/Team');
const auth = require('basic-auth');
const PDFDocument = require('pdfkit');
require('dotenv').config(); // Carrega as variáveis de ambiente

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Conectar ao MongoDB usando a variável de ambiente
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('Conectado ao MongoDB'))
.catch((err) => console.error('Erro ao conectar ao MongoDB:', err));

// Lista de nomes de animais disponíveis
const animalNames = [
    'Leão', 'Águia', 'Cobra', 'Tigre', 'Elefante',
    'Urso', 'Lobo', 'Pantera', 'Guepardo', 'Rinoceronte',
    'Baleia', 'Golfinho', 'Canguru', 'Hiena', 'Jaguatirica',
    'Gavião', 'Raposa', 'Serpente', 'Coruja', 'Papagaio'
];

// Função para gerar um nome de animal único
async function gerarNomeAnimalUnico() {
    for (let animal of animalNames) {
        const existe = await Team.findOne({ animalName: animal });
        if (!existe) {
            return animal;
        }
    }
    throw new Error('Nenhum nome de animal disponível.');
}

// Função de autenticação básica
function autenticar(req, res, next) {
    const user = auth(req);
    const adminUser = process.env.ADMIN_USERNAME;
    const adminPass = process.env.ADMIN_PASSWORD;

    if (!user || user.name !== adminUser || user.pass !== adminPass) {
        res.set('WWW-Authenticate', 'Basic realm="Admin Area"');
        return res.status(401).send('Acesso não autorizado.');
    }
    return next();
}

// Rota para cadastrar uma equipe
app.post('/api/teams', async (req, res) => {
    const { membros } = req.body;
    try {
        // Validar se há exatamente 5 membros
        if (!membros || membros.length !== 5) {
            return res.status(400).json({ error: 'É necessário cadastrar exatamente 5 membros.' });
        }

        // Gerar nome de animal único
        const animalName = await gerarNomeAnimalUnico();

        // Gerar nome da equipe automaticamente (pode ser utilizado para logs ou outros propósitos)
        const teamName = `Team-${Date.now()}`;

        const newTeam = new Team({ nome: teamName, animalName, membros });
        await newTeam.save();
        res.status(201).json(newTeam);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Rota secreta para administração
app.get('/admin', autenticar, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Rota para gerar relatório em JSON (já existente)
app.get('/admin/report', autenticar, async (req, res) => {
    try {
        const teams = await Team.find().sort({ dataCadastro: -1 });
        res.json(teams);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Rota para gerar relatório em PDF
app.get('/admin/report/pdf', autenticar, async (req, res) => {
    try {
        const teams = await Team.find().sort({ dataCadastro: -1 });

        // Cria um novo documento PDF
        const doc = new PDFDocument({ margin: 50 });

        // Configura os headers de resposta para PDF
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=relatorio_equipes.pdf');

        // Pipe o PDF para a resposta
        doc.pipe(res);

        // Título do PDF
        doc.fontSize(20).text('Relatório de Equipes Cadastradas', { align: 'center' });
        doc.moveDown();

        // Itera sobre as equipes e adiciona informações ao PDF
        teams.forEach((team, index) => {
            doc.fontSize(16).text(`Equipe ${index + 1}: ${team.animalName}`, { underline: true });
            doc.fontSize(12).text(`Nome do Time: ${team.nome}`);
            doc.text(`Data de Cadastro: ${new Date(team.dataCadastro).toLocaleString('pt-BR')}`);
            doc.text('Membros:');
            team.membros.forEach((membro, idx) => {
                doc.text(`  ${idx + 1}. ${membro.nome}${membro.telefone ? ` (Telefone: ${membro.telefone})` : ''}`);
            });
            doc.moveDown();
        });

        // Finaliza o PDF
        doc.end();
    } catch (error) {
        console.error('Erro ao gerar relatório em PDF:', error);
        res.status(500).send('Erro ao gerar relatório.');
    }
});

// Rota para servir o index.html para qualquer rota não reconhecida
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Iniciar o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
