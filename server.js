const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Middleware para ler JSON no corpo da requisição
app.use(express.json());

// Rota GET principal serve a editar_codigo.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'editar_codigo.html'));
});

// Rota POST para adicionar entrada ao Gurps4E.json
app.post('/adicionar-gurps', (req, res) => {
  const novoItem = req.body;
  const filePath = path.join(__dirname, 'data', 'Gurps4E.json');

  let dados = {};
  if (fs.existsSync(filePath)) {
    dados = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  }

  dados[novoItem.nome] = {
    tipo: novoItem.tipo,
    descricao: novoItem.descricao,
    custo: novoItem.custo,
    ampliacoes: novoItem.ampliacoes || []
  };

  fs.writeFileSync(filePath, JSON.stringify(dados, null, 2), 'utf8');
  res.json({ sucesso: true, mensagem: 'Entrada adicionada ao Gurps4E.json!' });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
