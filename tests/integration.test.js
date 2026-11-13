const request = require('supertest');
const app = require('../src/server');
const db = require('../src/database');

describe('Hospital Integration API - Testes de Regras de Negócio', () => {

  beforeEach(() => {
    db.pedidos.length = 0;
    db.documentos.length = 0;
    db.exames.length = 0;
  });

  test('Cenário 1: Pedido chega e não existe exame correspondente (integrado: false)', async () => {
    const response = await request(app)
      .post('/pedidos')
      .send({
        CodigoPedido: 616,
        NomePaciente: "ALEFHER MONTONI DE ALMEIDA",
        DataNascimento: "19970601",
        Sexo: "M",
        CodUnidade: 104,
        Exames: [
          {
            CodigoItemPedido: 930,
            AccessionNumber: "930",
            Modalidade: "CR",
            NomeProcedimento: "RX ANTEBRACO ESQUERDO"
          }
        ]
      });

    expect(response.status).toBe(201);
    expect(response.body.Integrado).toBe(false);
  });

  test('Cenário 2: Pedido chega e já existe exame com mesmo accession number (integrado: true)', async () => {
    db.exames.push({
      AccessionNumber: "930",
      NomePaciente: "ALEFHER MONTONI DE ALMEIDA",
      Modalidade: "CR",
      Status: "NOVO"
    });

    const response = await request(app)
      .post('/pedidos')
      .send({
        CodigoPedido: 616,
        NomePaciente: "ALEFHER MONTONI DE ALMEIDA",
        DataNascimento: "19970601",
        Sexo: "M",
        CodUnidade: 104,
        Exames: [
          {
            CodigoItemPedido: 930,
            AccessionNumber: "930",
            Modalidade: "CR",
            NomeProcedimento: "RX ANTEBRACO ESQUERDO"
          }
        ]
      });

    expect(response.status).toBe(201);
    expect(response.body.Integrado).toBe(true);
  });

  test('Cenário 3 e 4: Documento chega para pedido não integrado, depois chega o exame e integra', async () => {
    await request(app).post('/pedidos').send({
      CodigoPedido: 615,
      NomePaciente: "MARIA SILVA",
      Exames: [{ CodigoItemPedido: 100, AccessionNumber: "100", Modalidade: "US", NomeProcedimento: "USG" }]
    });

    const resDoc = await request(app).post('/documentos').send({
      CodigoDocumento: 251,
      CodigoPedido: 615,
      NomeDocumento: "PEDIDO",
      Documento: "base64data"
    });
    expect(resDoc.status).toBe(201);
    expect(resDoc.body.Integrado).toBe(false);

    const resExame = await request(app).post('/exames').send({
      AccessionNumber: "100",
      NomePaciente: "MARIA SILVA",
      Modalidade: "US"
    });
    expect(resExame.status).toBe(201);
    expect(resExame.body.pedidoAtualizado.Integrado).toBe(true);

    const resGetDocs = await request(app).get('/documentos/615');
    expect(resGetDocs.body[0].Integrado).toBe(true);
  });

  test('Cenário 5: Pedido chega novamente com novo exame sem duplicar os antigos', async () => {
    const pedidoPayload = {
      CodigoPedido: 616,
      NomePaciente: "ALEFHER",
      Exames: [{ CodigoItemPedido: 930, AccessionNumber: "930", Modalidade: "CR", NomeProcedimento: "RX 1" }]
    };

    await request(app).post('/pedidos').send(pedidoPayload);

    const resRepetido = await request(app).post('/pedidos').send({
      CodigoPedido: 616,
      NomePaciente: "ALEFHER",
      Exames: [
        { CodigoItemPedido: 930, AccessionNumber: "930", Modalidade: "CR", NomeProcedimento: "RX 1" },
        { CodigoItemPedido: 931, AccessionNumber: "931", Modalidade: "TC", NomeProcedimento: "TC 2" }
      ]
    });

    expect(resRepetido.status).toBe(201);
    expect(resRepetido.body.Exames.length).toBe(2);
  });

  test('Cenário 6: Documento duplicado chega novamente e retorna erro', async () => {
    const docPayload = {
      CodigoDocumento: 251,
      CodigoPedido: 615,
      NomeDocumento: "PEDIDO",
      Documento: "base64"
    };

    await request(app).post('/pedidos').send({ CodigoPedido: 615, Exames: [] });
    await request(app).post('/documentos').send(docPayload);

    const resDuplicado = await request(app).post('/documentos').send(docPayload);

    expect(resDuplicado.status).toBe(400);
    expect(resDuplicado.body).toHaveProperty('erro');
  });

});