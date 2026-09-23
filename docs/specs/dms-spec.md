# Especificação - Document Management System

> Versão: 1.0
> Status: proposta de especificação para desenvolvimento orientado por especificação (Spec Driven Development)

## 1. Objetivo

Prover uma aplicação web para upload, organização, consulta e download de documentos de forma simples e segura, mantendo o armazenamento local do arquivo e registrando seus metadados em memória na fase inicial do projeto.

## 2. Escopo

### Dentro do escopo

- Upload de documentos por usuário
- Listagem de documentos enviados
- Download de documento por identificador
- Associação do documento ao proprietário do arquivo
- Armazenamento local do conteúdo em disco via multer
- Registro inicial de metadados em memória
- Interface web para interação simples com API
- Suporte a documentos de uso geral, sem versionamento

### Fora do escopo

- Armazenamento em nuvem ou externo
- Compartilhamento público de documentos
- Versionamento de arquivos
- Histórico de revisões ou auditoria de alterações
- Controle avançado de permissões multiusuário
- Busca textual por conteúdo do documento
- OCR, indexação semântica ou extração automática de metadados
- Processamento assíncrono de arquivos em fila

## 3. Requisitos funcionais

| ID | Requisito | Descrição detalhada |
| --- | --- | --- |
| RF-01 | O usuário pode enviar um documento | O sistema deve aceitar um arquivo via upload e criar um registro de documento com metadados válidos. |
| RF-02 | O sistema valida a presença do arquivo | Se não houver arquivo no payload, o sistema deve rejeitar a operação com erro claro. |
| RF-03 | O sistema gera identificador único | Cada documento carregado deve receber um identificador único para permitir recuperação e download. |
| RF-04 | O sistema registra metadados do documento | O sistema deve persistir em memória os dados do documento: identificador, nome original, tamanho, data de upload, dono e caminho de armazenamento. |
| RF-05 | O usuário pode listar os documentos | O sistema deve expor uma listagem dos documentos disponíveis para o usuário ou para o contexto da operação. |
| RF-06 | O usuário pode baixar um documento pelo identificador | A API deve devolver o conteúdo binário do arquivo original, preservando o nome do arquivo ao baixar. |
| RF-07 | O sistema rejeita identificador inexistente | Quando o identificador solicitado não existir, o sistema deve responder com erro de recurso não encontrado. |
| RF-08 | O sistema mantém o vínculo de propriedade | Cada arquivo deve estar associado ao usuário dono, permitindo diferenciação por contexto de uso. |
| RF-09 | O sistema preserva o nome original do arquivo | O nome do arquivo enviado deve ser mantido como referência para exibição e download. |
| RF-10 | O sistema usa o filesystem local para armazenamento | Os arquivos físicos devem ser gravados localmente na aplicação, em pasta dedicada do backend. |

### Critérios de aceitação

- O upload deve aceitar apenas arquivos enviados em multipart/form-data.
- A lista de documentos deve retornar uma estrutura JSON consistente.
- O download deve responder com o conteúdo do arquivo e cabeçalhos apropriados para download.
- A operação de download deve falhar com erro 404 quando o documento não existe.
- Em qualquer erro do processo de upload ou download, a resposta deve conter mensagem legível e código de erro consistente.

## 4. Requisitos não funcionais

| ID | Requisito | Descrição |
| --- | --- | --- |
| RNF-01 | Persistência local do arquivo | Os arquivos devem ser gravados no filesystem local da aplicação, preferencialmente em backend/storage, usando multer com diskStorage. |
| RNF-02 | Metadados em memória | Os metadados dos documentos devem ficar em memória nesta fase inicial, sem banco de dados ou armazenamento externo. |
| RNF-03 | Configuração via variáveis de ambiente | Parametrização do projeto deve ocorrer por meio de variáveis de ambiente, alinhando-se ao padrão 12-Factor. |
| RNF-04 | Arquitetura em camadas | O backend deve seguir a separação simples em routes, controllers, services e repositories. |
| RNF-05 | Frontend leve e funcional | A interface deve explorar React, permitir upload e listagem básica e se comunicar via fetch em /api. |
| RNF-06 | Respostas consistentes | A API deve responder em JSON para metadados e em binário para arquivos baixados. |
| RNF-07 | Tratamento de erro | Entradas inválidas, arquivos ausentes e identificadores inexistentes devem gerar erros explícitos e sem falhas silenciosas. |

## 5. Modelo de dados

### Entidade Documento

| Campo | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| id | string | Sim | Identificador único do documento. |
| originalName | string | Sim | Nome original do arquivo enviado pelo usuário. |
| storedName | string | Sim | Nome do arquivo gerado no armazenamento local para evitar colisões. |
| storagePath | string | Sim | Caminho absoluto ou relativo do arquivo salvo no filesystem local. |
| size | number | Sim | Tamanho do arquivo em bytes. |
| mimeType | string | Não | Tipo MIME detectado ou informado pelo cliente. |
| uploadedAt | string | Sim | Data e hora do upload em ISO 8601. |
| owner | string | Sim | Identificador do usuário ou proprietário do documento. |
| status | string | Não | Estado do documento no sistema; inicialmente pode ser "active". |

### Observações do modelo

- O modelo de dados é minimalista e atende ao contexto inicial do projeto.
- A persistência dos metadados é em memória; portanto, reinício da aplicação implica perda dos registros.
- O arquivo físico continua existindo no sistema de arquivos local enquanto o processo estiver ativo e a pasta de storage não for limpa.
- A propriedade do documento deve ser mantida por usuário para permitir futuras expansões sem quebrar a modelagem atual.

## 6. Contratos de API

### 6.1. POST /upload

#### Descrição
Cria um registro de documento a partir de um arquivo enviado via multipart/form-data e grava o conteúdo no filesystem local.

#### Requisição

- Método: POST
- Caminho: /upload
- Content-Type: multipart/form-data
- Campos esperados:
  - file: arquivo enviado pelo cliente
  - owner: identificador do usuário dono do documento (se a aplicação exigir no payload ou no contexto de autenticação)

#### Resposta de sucesso

- Código HTTP: 201 Created
- Content-Type: application/json

Exemplo:

```json
{
  "id": "doc_7c8dbd97-82cf-4f9f-b7b1-892e0c51a352",
  "originalName": "relatorio-financeiro.pdf",
  "storedName": "doc_7c8dbd97-82cf-4f9f-b7b1-892e0c51a352.pdf",
  "storagePath": "backend/storage/doc_7c8dbd97-82cf-4f9f-b7b1-892e0c51a352.pdf",
  "size": 142390,
  "mimeType": "application/pdf",
  "uploadedAt": "2026-09-23T12:45:10.000Z",
  "owner": "user-001",
  "status": "active"
}
```

#### Resposta de erro

- Código HTTP: 400 Bad Request
- Content-Type: application/json

Exemplo:

```json
{
  "code": "MISSING_FILE",
  "message": "Arquivo obrigatório para upload."
}
```

### 6.2. GET /documents

#### Descrição
Lista os documentos com seus metadados.

#### Requisição

- Método: GET
- Caminho: /documents

#### Resposta de sucesso

- Código HTTP: 200 OK
- Content-Type: application/json

Exemplo:

```json
[
  {
    "id": "doc_7c8dbd97-82cf-4f9f-b7b1-892e0c51a352",
    "originalName": "relatorio-financeiro.pdf",
    "size": 142390,
    "uploadedAt": "2026-09-23T12:45:10.000Z",
    "owner": "user-001"
  },
  {
    "id": "doc_9e1d3431-3e42-41de-9e4d-5a3dd5ac0a6d",
    "originalName": "contrato.pdf",
    "size": 481200,
    "uploadedAt": "2026-09-23T13:15:42.000Z",
    "owner": "user-001"
  }
]
```

#### Resposta de erro

- Código HTTP: 500 Internal Server Error, caso ocorra falha inesperada na leitura da estrutura em memória.

### 6.3. GET /documents/:id/download

#### Descrição
Recupera o conteúdo do arquivo correspondente ao identificador informado.

#### Requisição

- Método: GET
- Caminho: /documents/:id/download

#### Resposta de sucesso

- Código HTTP: 200 OK
- Content-Type: application/octet-stream
- Cabeçalho: Content-Disposition com o nome original do arquivo

Corpo: bytes do arquivo original.

#### Resposta de erro

- Código HTTP: 404 Not Found

Exemplo:

```json
{
  "code": "DOCUMENT_NOT_FOUND",
  "message": "Documento não encontrado."
}
```

### 6.4. Convenções gerais da API

- A API deve seguir convenções REST simples.
- Respostas em JSON devem possuir estrutura consistente.
- O download de arquivo deve preservar o nome original para o cliente.
- O backend deve usar nomes e mensagens em português para feedback ao usuário.
- Erros de validação, ausência de arquivo e inexistência de documento devem ser tratados explicitamente.

## 7. Decisões arquiteturais

### 7.1. Clean Architecture simples

A arquitetura do backend deve manter as responsabilidades separadas em camadas:

- routes: definição dos endpoints e encaminhamento da requisição para o controller
- controllers: recebimento da requisição, leitura de dados da entrada HTTP e delegação
- services: regras de negócio, validações e orquestração
- repositories: acesso e controle dos dados em memória e arquivos locais

Fluxo de dependência esperado:

routes -> controllers -> services -> repositories

Esse fluxo garante que as regras de negócio e a persistência não dependam diretamente do protocolo HTTP.

### 7.2. Persistência local

- Arquivos físicos devem ser armazenados no filesystem local da aplicação.
- A pasta de destino é a pasta local do backend, conforme exigência do projeto.
- A estratégia de armazenamento deve usar multer com diskStorage para manter controle do caminho físico e do nome final do arquivo.
- A persistência temporária em memória é aceitável nesta etapa, mas não deve ser expandida para um banco de dados no escopo atual.

### 7.3. Frontend

- A interface deve ser desenvolvida com React e componentes funcionais.
- A comunicação com o backend deve acontecer via fetch com prefixo /api.
- O frontend deve disponibilizar operações simples de upload, listagem e download.
- Os componentes devem ser reaproveitáveis e de responsabilidade clara.

### 7.4. Restrições de produto

- Não deve haver uso de provedores de armazenamento externo.
- Não deve haver versionamento de documentos nesta etapa.
- O sistema deve ser evolutivo, mas sem introduzir complexidade desnecessária.

## 8. Plano de execução em etapas

> Este plano concentra a ordem lógica de desenvolvimento, sem detalhar execução de arquivos do backend e do frontend nesta fase de especificação.

### Etapa 1 - Definição do produto e dos critérios

- Confirmar objetivo, escopo e regras iniciais do sistema.
- Definir o perfil de uso e os casos principais de upload/listagem/download.
- Validar que a solução se mantém dentro do contexto de gerenciamento local e simples.

### Etapa 2 - Modelagem de domínio e metadados

- Formalizar o modelo de dados do documento.
- Definir campos mínimos para upload e download.
- Estabelecer a relação entre documento, dono e arquivo físico.

### Etapa 3 - Preparação do ambiente e do armazenamento local

- Confirmar configuração do backend e do diretório de storage local.
- Definir a política de nomes e caminhos dos arquivos salvos.
- Garantir que a infraestrutura local atenda ao uso com multer.

### Etapa 4 - Definição dos contratos de API

- Estabelecer as operações de upload, listagem e download.
- Definir payloads, respostas de sucesso e tratamentos de erro.
- Garantir consistência entre o modelo de dados e as respostas HTTP.

### Etapa 5 - Implementação da camada de negócio do sistema

- Separar regras de validação, processamento e gestão de dados.
- Organizar o fluxo de criação, listagem e recuperação do documento.
- Aplicar a lógica de propriedade e validação de identificadores inexistentes.

### Etapa 6 - Exposição dos endpoints do backend

- Expor os endpoints de upload, listagem e download em rota apropriada.
- Garantir integração com o armazenamento local e os metadados em memória.
- Validar respostas com casos positivos e de erro.

### Etapa 7 - Desenvolvimento da interface do usuário

- Criar a tela de upload e a listagem de documentos.
- Permitir o acionamento do download diretamente pela interface.
- Integrar a interação com a API usando fetch com prefixo /api.

### Etapa 8 - Validação e ajustes finais

- Verificar fluxos de upload, listagem e download em ambiente local.
- Testar casos de erro, ausência de arquivo e documento inexistente.
- Ajustar a documentação e a experiência do usuário conforme o feedback da validação.

## 9. Resumo executivo

O Document Management System proposto é uma aplicação simples, local e orientada por metadados, com foco em upload, listagem e download de documentos. A solução deve seguir a arquitetura em camadas do backend, respeitar a persistência local do arquivo com multer e manter o modelo de dados leve e consistente para a fase inicial do projeto. A especificação aqui apresentada serve como base para implementação controlada e para validação funcional em etapas futuras, sem perder a simplicidade e a clareza exigidas pelo contexto do sistema.
