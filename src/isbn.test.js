const { validateIsbn } = require('./isbn')

describe('validateIsbn', () => {
  test('returns the 13 digits of an ISBN written with hyphens', () => {
    expect(validateIsbn('978-0-13-468599-1')).toBe('9780134685991')
  })

  test('returns the 13 digits of an ISBN written with spaces', () => {
    expect(validateIsbn('978 0 13 468599 1')).toBe('9780134685991')
  })

  test('throws a TypeError when the ISBN is not a string', () => {
    expect(() => validateIsbn(9780134685991)).toThrow(TypeError)
    expect(() => validateIsbn(9780134685991)).toThrow('isbn must be a string')
  })

  test('throws when the ISBN has too few digits', () => {
    expect(() => validateIsbn('978-0-13-46859')).toThrow('isbn must have 13 digits')
  })

  test('throws when the ISBN has a letter in it', () => {
    expect(() => validateIsbn('978-0-13-468599-X')).toThrow('isbn must have 13 digits')
  })

  test('throws when the check digit is wrong', () => {
    expect(() => validateIsbn('9780134685992')).toThrow('isbn checksum is invalid')
  })

  test('answers with the first rule broken: the type before the length', () => {
    expect(() => validateIsbn(123)).toThrow(new TypeError('isbn must be a string'))
  })
})
