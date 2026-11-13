# Hospital Integration API

API REST backend desenvolvida em **Node.js** para gerenciamento, cruzamento e integração de dados entre sistemas hospitalares, exames (padrão DICOM via `AccessionNumber`), pedidos médicos e documentos complementares.

---

## 🏥 Contexto do Projeto

Em cenários reais de interoperabilidade em saúde (HealthTechs), os dados de um atendimento chegam de forma distribuída: imagens médicas (padrão DICOM) chegam por um fluxo próprio contendo metadados essenciais (como *AccessionNumber*), enquanto pedidos médicos e documentos complementares chegam por outros sistemas. 

Esta API realiza a unificação inteligente e assíncrona dessas informações, garantindo rastreabilidade e contexto completo para o corpo clínico.

---

## 🚀 Tecnologias Utilizadas
* **Node.js** & **Express** (API REST)
* **Swagger UI** (Documentação interativa de endpoints)
* **Jest** & **Supertest** (Suíte de testes automatizados)
* **Docker** & **Docker Compose** (Containerização e portabilidade de ambiente)

---

## ⚙️ Regras de Negócio Implementadas

1. **Recebimento de Pedidos (`POST /pedidos`):**
   * Salva ou atualiza o pedido com base no `CodigoPedido`.
   * Evita duplicação de itens de exames já existentes no mesmo pedido.
   * Verifica automaticamente se já existe um exame correspondente na base com o mesmo `AccessionNumber`. Se existir, o pedido é marcado como `Integrado: true`; caso contrário, permanece `false`.

2. **Recebimento de Documentos (`POST /documentos`):**
   * Salva documentos vinculados a pedidos utilizando chave composta (`CodigoDocumento` + `CodigoPedido`).
   * Retorna erro de duplicidade caso a mesma combinação seja enviada novamente.
   * Se o pedido pai já estiver integrado, o documento é vinculado imediatamente (`Integrado: true`).

3. **Chegada de Exame (`POST /exames`):**
   * Simula a chegada de um exame DICOM.
   * Verifica se existe um pedido aguardando este exame pelo `AccessionNumber`. Se houver, atualiza o pedido para `Integrado: true` e vincula documentos pendentes daquele pedido.

---

## 📌 Endpoints da API

| Método | Rota | Descrição |
| :--- | :--- | :--- |
| **POST** | `/pedidos` | Cadastra ou atualiza um pedido de exame e valida integração |
| **POST** | `/documentos` | Cadastra documentos complementares vinculados a um pedido |
| **POST** | `/exames` | Simula a chegada de um exame (DICOM / AccessionNumber) |
| **GET** | `/pedidos/:codigoPedido` | Consulta os dados detalhados e status de um pedido |
| **GET** | `/documentos/:codigoPedido` | Lista todos os documentos vinculados a um pedido |
| **GET** | `/exames/:accessionNumber` | Consulta detalhes de um exame pelo Accession Number |

---

## 🛠️ Como Executar o Projeto Localmente

### Pré-requisitos
* Ter o **Node.js** (versão 18 ou superior) instalado.

### Passos:
1. Clone o repositório ou abra a pasta do projeto no terminal.
2. Instale as dependências:
   ```bash
   npm install