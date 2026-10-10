const { createCatalog } = require('./catalog')

function clientAnswering(response) {
  return {
    get: async (path) => response,
  }
}

function clientFailingWith(message) {
  return {
    get: async () => {
      throw new Error(message)
    },
  }
}

describe('findBook', () => {
  test('resolves the isbn, title, and author of a book the catalog has', async () => {
    const catalog = createCatalog(clientAnswering({
      status: 200,
      body: { isbn: '9780134685991', title: 'Effective Java', author: 'Joshua Bloch', pages: 412 },
    }))

    await expect(catalog.findBook('9780134685991')).resolves.toEqual({
      isbn: '9780134685991',
      title: 'Effective Java',
      author: 'Joshua Bloch',
    })
  })

  test('resolves null for a book the catalog does not have', async () => {
    const catalog = createCatalog(clientAnswering({ status: 404, body: {} }))

    const book = await catalog.findBook('9780134685991')

    expect(book).toBeNull()
  })

  test('rejects when the catalog answers 500', async () => {
    const catalog = createCatalog(clientAnswering({ status: 500, body: {} }))

    await expect(catalog.findBook('9780134685991')).rejects.toThrow('catalog unavailable')
  })

  test('rejects when the network fails', async () => {
    const catalog = createCatalog(clientFailingWith('socket hang up'))

    await expect(catalog.findBook('9780134685991')).rejects.toThrow('catalog unavailable')
  })

  test('rejects an invalid ISBN with the validation error', async () => {
    const catalog = createCatalog(clientAnswering({ status: 200, body: {} }))

    await expect(catalog.findBook('9780134685992')).rejects.toThrow('isbn checksum is invalid')
  })
})
