// Repositório de documentos: mantém os metadados em memória.

const documents = new Map();

function save(document) {
  documents.set(document.id, document);
  return document;
}

function findAll() {
  return Array.from(documents.values());
}

function findById(id) {
  return documents.get(id) || null;
}

// Usado pelos testes para isolar o estado em memória entre execuções.
function reset() {
  documents.clear();
}

module.exports = { save, findAll, findById, reset };
