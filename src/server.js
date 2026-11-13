const express = require('express');
const service = require('./services/integrationService');

const app = express();
app.use(express.json({ limit: '10mb' }));

app.post('/pedidos', (req, res) => {
  try {
    const resultado = service.salvarPedido(req.body);
    return res.status(201).json(resultado);
  } catch (err) {
    return res.status(400).json({ erro: err.message });
  }
});

app.post('/documentos', (req, res) => {
  try {
    const resultado = service.salvarDocumento(req.body);
    return res.status(201).json(resultado);
  } catch (err) {
    return res.status(400).json({ erro: err.message });
  }
});

app.post('/exames', (req, res) => {
  try {
    const resultado = service.salvarExame(req.body);
    return res.status(201).json(resultado);
  } catch (err) {
    return res.status(400).json({ erro: err.message });
  }
});

app.get('/pedidos/:codigoPedido', (req, res) => {
  const pedido = service.obterPedido(req.params.codigoPedido);
  if (!pedido) return res.status(404).json({ erro: 'Pedido não encontrado' });
  return res.json(pedido);
});

app.get('/documentos/:codigoPedido', (req, res) => {
  const docs = service.obterDocumentos(req.params.codigoPedido);
  return res.json(docs);
});

app.get('/exames/:accessionNumber', (req, res) => {
  const exame = service.obterExame(req.params.accessionNumber);
  if (!exame) return res.status(404).json({ erro: 'Exame não encontrado' });
  return res.json(exame);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

module.exports = app;