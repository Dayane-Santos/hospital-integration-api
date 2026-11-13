
# Hospital Integration API

API REST backend desenvolvida em **Node.js** para gerenciamento, cruzamento e integração de dados entre sistemas hospitalares, exames (padrão DICOM via `AccessionNumber`), pedidos médicos e documentos complementares.

---

## 🏥 Contexto do Projeto

Em cenários reais de interoperabilidade em saúde (HealthTechs), os dados de um atendimento chegam de forma distribuída: imagens médicas (padrão DICOM) chegam por um fluxo próprio contendo metadados essenciais (como *AccessionNumber*), enquanto pedidos médicos e documentos complementares chegam por outros sistemas.

Esta API realiza a unificação inteligente e assíncrona dessas informações, garantindo rastreabilidade e contexto completo para o corpo clínico.

---

## 🚀 Tecnologias Utilizadas

- **Node.js** & **Express** (API REST)
- **Swagger UI** (Documentação interativa de endpoints)
- **Jest** & **Supertest** (Suíte de testes automatizados)
- **Docker** & **Docker Compose** (Containerização e portabilidade de ambiente)

---

## ⚙️ Regras de Negócio Implementadas

1. **Recebimento de Pedidos (`POST /pedidos`):**
   - Salva ou atualiza o pedido com base no `CodigoPedido`.
   - Evita duplicação de itens de exames já existentes no mesmo pedido.
   - Verifica automaticamente se já existe um exame correspondente na base com o mesmo `AccessionNumber`. Se existir, o pedido é marcado como `Integrado: true`; caso contrário, permanece `false`.

2. **Recebimento de Documentos (`POST /documentos`):**
   - Salva documentos vinculados a pedidos utilizando chave composta (`CodigoDocumento` + `CodigoPedido`).
   - Retorna erro de duplicidade caso a mesma combinação seja enviada novamente.
   - Se o pedido pai já estiver integrado, o documento é vinculado imediatamente (`Integrado: true`).

3. **Chegada de Exame (`POST /exames`):**
   - Simula a chegada de um exame DICOM.
   - Verifica se existe um pedido aguardando este exame pelo `AccessionNumber`. Se houver, atualiza o pedido para `Integrado: true` e vincula documentos pendentes daquele pedido.

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

- Ter o **Node.js** (versão 18 ou superior) instalado.

### Passos:

1. Clone o repositório ou abra a pasta do projeto no terminal.
2. Instale as dependências:

   ```bash
   npm install
   ```

3. Inicie a aplicação:

   ```bash
   npm start
   ```

---

## 🐳 Executando com Docker e Docker Compose

Caso deseje executar a aplicação isolada em container, o projeto conta com configuração completa de containerização.

### Pré-requisitos

- **Docker** e **Docker Compose** instalados na máquina.

### Passos:

1. Na raiz do projeto, execute o comando para construir a imagem e subir o container:

   ```bash
   docker compose up --build
   ```

2. A API estará acessível em: 👉 **`http://localhost:3000`**
3. Para encerrar e remover o container, pressione `Ctrl + C` no terminal ou execute:

   ```bash
   docker compose down
   ```

---

## 📖 Documentação Interativa (Swagger)

Com o servidor rodando (seja via Node.js ou Docker), acesse no navegador:

👉 **`http://localhost:3000/api-docs`**

---

## 🧪 Executando os Testes Automatizados

O projeto possui uma suíte completa de testes cobrindo todos os cenários de integração (pedidos sem exames, cruzamento por AccessionNumber, chegada tardia de exames, documentos vinculados e rejeição de duplicidade).

Para rodar os testes com Jest:

```bash
npm test
```

---

## 💡 Decisões Técnicas e Arquiteturais

- **Arquitetura em Camadas:** O projeto separa claramente as rotas (`server.js`), as regras de negócio e serviços (`integrationService.js`) e a persistência de dados, garantindo alta coesão e facilidade de manutenção.

- **Persistência Otimizada:** Utilizada estrutura em memória tipada de alta performance para garantir validações instantâneas de chaves compostas e relacionamentos relacionais sem burocracia de ORM pesado.

- **Resiliência e Tratamento de Erros:** Blocos estruturados de captura de exceções com retornos HTTP padronizados (`201`, `400`, `404`) e mensagens descritivas para o cliente.
