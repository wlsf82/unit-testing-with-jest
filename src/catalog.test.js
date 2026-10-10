const { createCatalog } = require('./catalog')

describe('findBook', () => {
  test('asks for the normalized ISBN once and resolves the isbn, title, and author', async () => {
    const get = jest.fn().mockResolvedValue({
      status: 200,
      body: { isbn: '9780134685991', title: 'Effective Java', author: 'Joshua Bloch', pages: 412 },
    })
    const catalog = createCatalog({ get })

    const book = await catalog.findBook('978-0-13-468599-1')

    expect(book).toEqual({
      isbn: '9780134685991',
      title: 'Effective Java',
      author: 'Joshua Bloch',
    })
    expect(get).toHaveBeenCalledWith('/books/9780134685991')
    expect(get).toHaveBeenCalledTimes(1)
  })

  test('resolves null for a book the catalog does not have', async () => {
    const get = jest.fn().mockResolvedValue({ status: 404, body: {} })
    const catalog = createCatalog({ get })

    await expect(catalog.findBook('9780134685991')).resolves.toBeNull()
  })

  test('rejects when the catalog answers 500', async () => {
    const get = jest.fn().mockResolvedValue({ status: 500, body: {} })
    const catalog = createCatalog({ get })

    await expect(catalog.findBook('9780134685991')).rejects.toThrow('catalog unavailable')
  })

  test('rejects when the network fails', async () => {
    const get = jest.fn().mockRejectedValue(new Error('socket hang up'))
    const catalog = createCatalog({ get })

    await expect(catalog.findBook('9780134685991')).rejects.toThrow('catalog unavailable')
  })

  test('rejects an invalid ISBN without asking the catalog', async () => {
    const get = jest.fn()
    const catalog = createCatalog({ get })

    await expect(catalog.findBook('9780134685992')).rejects.toThrow('isbn checksum is invalid')
    expect(get).not.toHaveBeenCalled()
  })

  test('calls the real method of a spied client and records the call', async () => {
    const client = {
      get: async (path) => ({ status: 404, body: {} }),
    }
    const spy = jest.spyOn(client, 'get')

    const book = await createCatalog(client).findBook('9780134685991')

    expect(book).toBeNull()
    expect(spy).toHaveBeenCalledWith('/books/9780134685991')
    spy.mockRestore()
  })
})
