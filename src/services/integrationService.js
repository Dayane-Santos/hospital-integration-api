const db = require('../database');

class IntegrationService {
  salvarPedido(data) {
    const { CodigoPedido, Exames = [] } = data;
    let pedido = db.pedidos.find(p => p.CodigoPedido === CodigoPedido);

    let temExameCorrespondente = false;

    const examesProcessados = Exames.map(item => {
      const exameExiste = db.exames.find(e => e.AccessionNumber === item.AccessionNumber);
      if (exameExiste) temExameCorrespondente = true;
      return { ...item };
    });

    if (pedido) {
      for (const novoExame of examesProcessados) {
        const existeNoPedido = pedido.Exames.some(e => e.CodigoItemPedido === novoExame.CodigoItemPedido);
        if (!existeNoPedido) {
          pedido.Exames.push(novoExame);
        }
      }
      if (temExameCorrespondente) pedido.Integrado = true;
    } else {
      pedido = {
        ...data,
        Integrado: temExameCorrespondente,
        Exames: examesProcessados
      };
      db.pedidos.push(pedido);
    }

    return pedido;
  }

  salvarDocumento(data) {
    const { CodigoDocumento, CodigoPedido } = data;
    
    const duplicado = db.documentos.find(
      d => d.CodigoDocumento === CodigoDocumento && d.CodigoPedido === CodigoPedido
    );
    if (duplicado) {
      throw new Error('Documento duplicado para este pedido.');
    }

    const pedido = db.pedidos.find(p => p.CodigoPedido === CodigoPedido);
    if (!pedido) {
      throw new Error('Pedido não encontrado.');
    }

    let integrado = false;
    if (pedido.Integrado) {
      integrado = true;
    }

    const doc = { ...data, Integrado: integrado };
    db.documentos.push(doc);
    return doc;
  }

  salvarExame(data) {
    const { AccessionNumber } = data;
    db.exames.push({ ...data, Status: data.Status || 'NOVO' });

    const pedido = db.pedidos.find(p => p.Exames.some(e => e.AccessionNumber === AccessionNumber));
    
    if (pedido) {
      pedido.Integrado = true;
      db.documentos.forEach(doc => {
        if (doc.CodigoPedido === pedido.CodigoPedido) {
          doc.Integrado = true;
        }
      });
    }

    return { exame: data, pedidoAtualizado: pedido || null };
  }

  obterPedido(codigoPedido) {
    return db.pedidos.find(p => p.CodigoPedido == codigoPedido);
  }

  obterDocumentos(codigoPedido) {
    return db.documentos.filter(d => d.CodigoPedido == codigoPedido);
  }

  obterExame(accessionNumber) {
    return db.exames.find(e => e.AccessionNumber == accessionNumber);
  }
}

module.exports = new IntegrationService();