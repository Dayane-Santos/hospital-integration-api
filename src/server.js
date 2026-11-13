const express = require('express');
const swaggerUi = require('swagger-ui-express');
const service = require('./services/integrationService');

const app = express();
app.use(express.json({ limit: '10mb' }));

// Documentação Swagger básica e direta ao ponto
const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Hospital Integration API',
    version: '1.0.0',
    description: 'API REST para integração de pedidos, exames DICOM e documentos hospitalares.'
  },
  servers: [{ url: 'http://localhost:3000' }],
  paths: {
    '/pedidos': {
      post: {
        summary: 'Receber ou atualizar pedido de exame',
        responses: { '201': { description: 'Pedido salvo com sucesso' } }
      }
    },
    '/documentos': {
      post: {
        summary: 'Receber documento vinculado ao pedido',
        responses: { '201': { description: 'Documento salvo com sucesso' }, '400': { description: 'Erro de duplicidade ou pedido não encontrado' } }
      }
    },
    '/exames': {
      post: {
        summary: 'Simular a chegada de um exame (DICOM/AccessionNumber)',
        responses: { '201': { description: 'Exame processado e pedido integrado' } }
      }
    },
    '/pedidos/{codigoPedido}': {
      get: {
        summary: 'Consultar pedido por código',
        parameters: [{ name: 'codigoPedido', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { '200': { description: 'Dados do pedido' } }
      }
    },
    '/documentos/{codigoPedido}': {
      get: {
        summary: 'Listar documentos de um pedido',
        parameters: [{ name: 'codigoPedido', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { '200': { description: 'Lista de documentos' } }
      }
    },
    '/exames/{accessionNumber}': {
      get: {
        summary: 'Consultar exame por Accession Number',
        parameters: [{ name: 'accessionNumber', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Dados do exame' } }
      }
    }
  }
};

// Rota do Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Rotas da API
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

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`Swagger disponível em http://localhost:${PORT}/api-docs`);
  });
}

module.exports = app;