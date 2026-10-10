const { validateIsbn } = require('./isbn')

function toBook({ status, body }) {
  if (status === 200) {
    return { isbn: body.isbn, title: body.title, author: body.author }
  }

  if (status === 404) return null

  throw new Error('catalog unavailable')
}

function createCatalog(httpClient) {
  async function findBook(isbn) {
    const normalizedIsbn = validateIsbn(isbn)

    try {
      return await httpClient.get(`/books/${normalizedIsbn}`).then(toBook)
    } catch {
      throw new Error('catalog unavailable')
    }
  }

  return { findBook }
}

module.exports = { createCatalog }
