import express from 'express';
import fs from 'fs';
import cors from 'cors';

const app = express();
const PORT = 3002;

app.use(cors());

app.get('/ultimaConfig', (req, res) => {
  fs.readFile('./db.json', 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Erro ao ler db.json' });
    const db = JSON.parse(data);

    if (db.ultimaConfig) {
      return res.json(db.ultimaConfig);
    }
    if (db.config && db.config.length > 0) {
      return res.json(db.config[db.config.length - 1]);
    }
    res.status(404).json({ error: 'Nenhuma configuração encontrada' });
  });
});

app.listen(PORT, () => {
  console.log(`Fake ESP server rodando em http://localhost:${PORT}/ultimaConfig`);
});

fetch('http://localhost:3002/ultimaConfig')
  .then(res => res.json())
  .then(config => {
    // Use a configuração normalmente
    console.log(config);
  });

